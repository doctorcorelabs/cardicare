import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, Send, Paperclip, XCircle } from 'lucide-react';
import ReactMarkdown, { Components } from 'react-markdown';
import { fetchWithFallback, getDiagnosticInfo } from '@/lib/api-utils';
import { checkApiHealth } from '@/lib/api-health';
import ApiStatusIndicator from '@/components/ApiStatusIndicator';

// DNS resolution helper
const isNetworkError = (error: Error): boolean => {
  const errorMsg = error.message.toLowerCase();
  return errorMsg.includes('network') || 
         errorMsg.includes('failed to fetch') || 
         errorMsg.includes('err_name_not_resolved') ||
         errorMsg.includes('dns') ||
         errorMsg.includes('connection');
};

// Direct IP fallback URLs in case DNS fails completely
const IP_FALLBACK_URLS = [
  "https://104.21.36.155/chat", // Example: Direct IP for Cloudflare worker (replace with your actual IP)
  "https://172.67.150.37/chat"  // Example: Secondary IP (replace with your actual IP)
];

interface Message {
  id: string;
  text: string; // User's text message
  sender: 'user' | 'ai';
  timestamp: Date;
  fileURL?: string; // For displaying user-uploaded images in chat
  fileName?: string; // For displaying PDF names
  fileType?: string; // e.g., 'image/jpeg', 'application/pdf'
}

// Define the structure for chat history sent to the backend
interface BackendContentPart {
  text: string;
}
interface BackendContent {
  role: 'user' | 'model'; // 'model' is used for AI responses in Gemini history
  parts: BackendContentPart[];
}

import { Element } from 'hast'; // Import Element type for node

const markdownComponents: Components = {
  code(props: React.ComponentPropsWithoutRef<'code'> & { node: Element; inline?: boolean }) {
    const { node, inline, className, children, ...restProps } = props;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _node = node; // Mark as handled, as it's destructured but not directly used in this logic block
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
      <code className={className} {...restProps}>
        {children}
      </code>
    ) : (
      <code className={className} {...restProps}>
        {children}
      </code>
    );
  },
  pre(props: React.ComponentPropsWithoutRef<'pre'> & { node: Element }) {
    const { node, className, children, ...restProps } = props;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _node = node; // Mark as handled
    return <pre className={className} {...restProps}>{children}</pre>;
  }
};

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null); // For image dataURL or PDF name
  const [fileError, setFileError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'fallback' | 'unknown'>('unknown');
  const [checkingApi, setCheckingApi] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null); // Ref for the main chat container

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
    // Check API status when component mounts
  useEffect(() => {
    const checkStatus = async () => {
      setCheckingApi(true);
      try {
        const healthStatus = await checkApiHealth();
        console.log('API health check result:', healthStatus);
        setApiStatus(healthStatus.status);
      } catch (error) {
        console.error('Error checking API health:', error);
        setApiStatus('offline');
      } finally {
        setCheckingApi(false);
      }
    };
    
    checkStatus();
    
    // Set up a periodic health check every 5 minutes
    const intervalId = setInterval(checkStatus, 5 * 60 * 1000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  
  // Function to manually refresh API status
  const refreshApiStatus = async () => {
    setCheckingApi(true);
    try {
      const healthStatus = await checkApiHealth();
      setApiStatus(healthStatus.status);
    } catch (error) {
      console.error('Error refreshing API health:', error);
      setApiStatus('offline');
    } finally {
      setCheckingApi(false);
    }
  };

  useEffect(() => {
    const pasteHandler = (event: ClipboardEvent) => {
      if (isLoading) return; // Don't allow paste while loading

      const items = event.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            if (blob) {
              // Simulate a file input change event
              // Create a new File object to ensure it has a name, otherwise some logic might break
              const pastedFile = new File([blob], `pasted-image-${Date.now()}.${blob.type.split('/')[1] || 'png'}`, { type: blob.type });
              
              // Create a synthetic event to pass to handleFileChange
              const syntheticEvent = {
                target: {
                  files: [pastedFile]
                }
              } as unknown as React.ChangeEvent<HTMLInputElement>; // Type assertion
              handleFileChange(syntheticEvent);
              event.preventDefault(); // Prevent default paste action if image is handled
              return; // Handle only the first image
            }
          }
        }
      }
    };

    const chatDiv = chatContainerRef.current;
    chatDiv?.addEventListener('paste', pasteHandler);

    return () => {
      chatDiv?.removeEventListener('paste', pasteHandler);
    };
  }, [isLoading]); // Add isLoading to dependencies to re-evaluate if pasting is allowed

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      removeSelectedFile();
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setFileError('Unsupported file type. Please upload an image (JPEG, PNG, GIF, WEBP) or PDF.');
      setSelectedFile(null);
      setFilePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setFileError('File exceeds 10MB limit.');
      setSelectedFile(null);
      setFilePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedFile(file);
    setFileError(null);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
      setFilePreview(file.name);
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e?: FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if ((!input.trim() && !selectedFile) || isLoading) return;

    const newUserMessage: Message = {
      id: `user-${Date.now()}`,
      text: input,
      sender: 'user',
      timestamp: new Date(),
      ...(selectedFile && selectedFile.type.startsWith('image/') && { fileURL: filePreview || undefined, fileType: selectedFile.type }),
      ...(selectedFile && selectedFile.type === 'application/pdf' && { fileName: selectedFile.name, fileType: selectedFile.type }),
    };

    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    // Don't clear input/file here, clear in finally or after successful send
    setIsLoading(true);

    const formData = new FormData();
    if (input.trim()) {
      formData.append('message', input.trim());
    }
    if (selectedFile) {
      formData.append('file', selectedFile);
    }

    // Prepare chat history for the backend (excluding messages that are just file previews)
    const backendHistory: BackendContent[] = messages
      .filter(msg => !(msg.fileURL && !msg.text) && !(msg.fileName && !msg.text)) // Filter out file-only preview messages for history
      .map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      }));
    formData.append('history', JSON.stringify(backendHistory));


    // Add a placeholder for AI response
    const aiResponseId = `ai-${Date.now()}`;
    setMessages((prevMessages) => {
      // If the last message was the user message we just added, append AI placeholder
      // Otherwise, it means AI is already responding or an error occurred, so don't add another placeholder
      const lastMessage = prevMessages[prevMessages.length -1];
      if(lastMessage && lastMessage.id === newUserMessage.id) {
        return [...prevMessages, { id: aiResponseId, text: '', sender: 'ai', timestamp: new Date() }];
      }
      return prevMessages;
    });    try {
      // Use environment variable for API URL in production or fallback to relative path for development
      // Get both primary and fallback API URLs
      const baseApiUrl = import.meta.env.DEV ? '/api' : import.meta.env.VITE_API_URL?.replace(/\/+$/, '');
      const fallbackApiUrl = import.meta.env.DEV ? '/api' : import.meta.env.VITE_API_URL_FALLBACK?.replace(/\/+$/, '');
      
      // Hard-coded fallback if environment variables fail to resolve
      const hardcodedUrl = "https://heart-health-ai-assistant.daivanfebrijuansetiya.workers.dev";
      
      // Prepare all possible API endpoints including IP fallbacks
      const primaryApiUrl = baseApiUrl ? `${baseApiUrl}/chat` : `${hardcodedUrl}/chat`;
      const secondaryApiUrl = fallbackApiUrl ? `${fallbackApiUrl}/chat` : `${hardcodedUrl}/chat`;
      
      // Add diagnostic info to the console for debugging
      console.log(`Attempting to send request to API`);
      console.log(`Primary URL: ${primaryApiUrl}`);
      console.log(`Fallback URL: ${secondaryApiUrl}`);

      // Also attempt to pre-resolve DNS to warm up the connection
      try {
        if (navigator.onLine) {
          // Log network status
          console.log(`Network appears online, attempting DNS prefetch`);
          const link = document.createElement('link');
          link.rel = 'dns-prefetch';
          link.href = new URL(primaryApiUrl).origin;
          document.head.appendChild(link);
        } else {
          console.warn('Browser reports network is offline');
        }
      } catch (prefetchError) {
        console.warn('DNS prefetch attempt failed:', prefetchError);
      }
      
      // Use our utility with automatic retries and fallback
      let response: Response;
      
      try {
        response = await fetchWithFallback(
          primaryApiUrl,
          secondaryApiUrl,
          {
            method: 'POST',
            body: formData,
            mode: 'cors',
            credentials: 'omit',
            cache: 'no-store'
          },
          3 // increased maximum retry count
        );
      } catch (fetchError) {
        // If regular fetching with domains fails, try direct IP addresses as absolute last resort
        if (fetchError instanceof Error && isNetworkError(fetchError)) {
          console.log('Domain-based API fetch failed, trying direct IP fallbacks...');
          for (const ipUrl of IP_FALLBACK_URLS) {
            try {
              console.log(`Trying direct IP fallback: ${ipUrl}`);
              response = await fetch(ipUrl, {
                method: 'POST',
                body: formData,
                mode: 'cors',
                credentials: 'omit',
                cache: 'no-store',
                headers: {
                  'Host': 'heart-health-ai-assistant.daivanfebrijuansetiya.workers.dev'
                }
              });
              console.log('Direct IP fallback connection successful!');
              break; // Exit the loop if successful
            } catch (ipError) {
              console.error(`IP fallback failed: ${ipError}`);
              continue; // Try next IP if available
            }
          }
          // If response is still undefined, all fallbacks failed
          if (!response) {
            throw new Error('All API connection attempts failed, including direct IP fallbacks.');
          }
        } else {
          // If it's not a network error, re-throw
          throw fetchError;
        }
      }if (!response.ok) { // Check response.ok first
        const errorText = await response.text();
        // Display specific error from backend if available
        const displayError = response.status === 413 ? 'File is too large. Max 10MB.' :
                             response.status === 415 ? 'Unsupported file type. Please use JPG, PNG, GIF, WEBP, or PDF.' :
                             response.status === 404 ? 'Could not connect to chat service. The server may be down or unavailable.' :
                             `Server error: ${response.status} ${errorText || response.statusText}`;
        console.error(`API error: ${displayError}`);
        throw new Error(displayError);
      }
      if (!response.body) { // Then check response.body
         throw new Error(`API request failed: Empty response body`);
      }


      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedResponse = '';

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulatedResponse += chunk;
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === aiResponseId ? { ...msg, text: accumulatedResponse } : msg
          )
        );
      }
      // Final decode for any remaining bytes
      const finalChunk = decoder.decode();
      if (finalChunk) {
        accumulatedResponse += finalChunk;
         setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === aiResponseId ? { ...msg, text: accumulatedResponse } : msg
          )
        );
      }
    } catch (error) {
      console.error('Chatbot error:', error);
        // Determine if this is a network/connection error
      const isNetworkError = error instanceof TypeError && error.message.includes('fetch');
      const isDNSError = error instanceof Error && 
                        (error.message.includes('ERR_NAME_NOT_RESOLVED') || 
                         error.message.includes('net::ERR_NAME_NOT_RESOLVED'));
      
      // Create more user-friendly error messages
      let errorMessage;
      if (isNetworkError) {
        errorMessage = 'Network error: Could not connect to the chat service. Please check your internet connection and try again.';
      } else if (isDNSError) {
        errorMessage = 'Server unavailable: The chat service is currently unavailable. Our team has been notified of this issue.';
      } else if (error instanceof Error && error.message.includes('404')) {
        errorMessage = 'Server not found: The chat service may be temporarily down for maintenance. Please try again later.';
      } else {
        errorMessage = error instanceof Error ? error.message : 'Sorry, an error occurred. Please try again.';
      }
      
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === aiResponseId
            ? { ...msg, text: errorMessage }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      setInput(''); // Clear input after attempt
      removeSelectedFile(); // Clear file after attempt
    }
  };

  return (
    <div ref={chatContainerRef} className="flex flex-col h-[500px] max-w-lg mx-auto bg-white shadow-xl rounded-lg border border-gray-200" tabIndex={0} /* Make div focusable for paste */ >      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center justify-between">
          <div className="flex items-center">
            <Bot className="mr-2 h-6 w-6 text-blue-600" />
            CardiCare Assistant
          </div>
          <ApiStatusIndicator 
            status={checkingApi ? 'unknown' : apiStatus} 
            onRefresh={refreshApiStatus}
          />
        </h2>
        {apiStatus === 'offline' && (
          <div className="mt-2 p-2 bg-red-50 text-red-800 text-xs rounded-md">
            The chat service is currently unreachable. Please try again later or contact support if the issue persists.
          </div>
        )}
        {apiStatus === 'fallback' && (
          <div className="mt-2 p-2 bg-amber-50 text-amber-800 text-xs rounded-md">
            Using backup server. Some features may be limited.
          </div>
        )}
      </div>
      <ScrollArea className="flex-grow p-4 space-y-4" ref={scrollAreaRef}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-end space-x-2 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'ai' && (
              <Bot className="h-7 w-7 text-blue-600 mb-1 flex-shrink-0" />
            )}
            <div
              className={`p-3 rounded-lg max-w-[70%] shadow ${
                msg.sender === 'user'
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
              } prose prose-sm max-w-none text-sm whitespace-pre-wrap text-justify`}
            >
              {msg.fileURL && msg.fileType?.startsWith('image/') && (
                <img src={msg.fileURL} alt="Uploaded content" className="mt-1 mb-2 rounded-lg max-w-full h-auto max-h-60" />
              )}
              {msg.fileName && msg.fileType === 'application/pdf' && (
                <div className="mt-1 mb-2 p-2 bg-gray-200 dark:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-200">
                  PDF: {msg.fileName}
                </div>
              )}
              {msg.text && <ReactMarkdown components={markdownComponents}>
                {msg.text || (isLoading && msg.sender === 'ai' ? '...' : '')}
              </ReactMarkdown>}
              {/* If only file was sent by user, and AI is thinking, show '...' */}
              {!msg.text && (msg.fileURL || msg.fileName) && msg.sender === 'user' && isLoading && (messages.length > 0 && messages[messages.length - 1].sender === 'ai' && !messages[messages.length - 1].text) && (
                 <ReactMarkdown components={markdownComponents}>{'...'}</ReactMarkdown>
              )}
               {/* AI placeholder text */}
              {msg.sender === 'ai' && !msg.text && isLoading && <ReactMarkdown components={markdownComponents}>{'...'}</ReactMarkdown>}
            </div>
            {msg.sender === 'user' && (
              <User className="h-7 w-7 text-gray-400 mb-1 flex-shrink-0" />
            )}
          </div>
        ))}
        {isLoading && messages[messages.length -1]?.sender === 'user' && !messages.find(m => m.id === `ai-${parseInt(messages[messages.length-1].id.split('-')[1])}`) && (
             <div className="flex items-end space-x-2 justify-start">
                <Bot className="h-7 w-7 text-blue-600 mb-1 flex-shrink-0" />
                <div className="p-3 rounded-lg max-w-[70%] shadow bg-gray-100 text-gray-800 rounded-bl-none">
                    <p className="text-sm">Typing...</p>
                </div>
            </div>
        )}
      </ScrollArea>
      <div className="p-4 border-t border-gray-200">
        {fileError && <p className="text-xs text-red-500 mb-2">{fileError}</p>}
        {selectedFile && filePreview && (
          <div className="mb-2 p-2 border rounded-md flex items-center justify-between bg-gray-50">
            <div className="flex items-center space-x-2 overflow-hidden">
              {selectedFile.type.startsWith('image/') ? (
                <img src={filePreview} alt="Preview" className="h-10 w-10 object-cover rounded flex-shrink-0" />
              ) : (
                <Paperclip className="h-6 w-6 text-gray-500 flex-shrink-0" /> // PDF icon
              )}
              <span className="text-sm text-gray-700 truncate">{selectedFile.name}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={removeSelectedFile} className="text-red-500 hover:text-red-700 flex-shrink-0">
              <XCircle className="h-5 w-5" />
            </Button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
            style={{ display: 'none' }}
          />
          <Button type="button" variant="ghost" size="icon" onClick={triggerFileInput} disabled={isLoading} aria-label="Attach file">
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question..."
            className="flex-grow"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || (!input.trim() && !selectedFile)} size="icon" aria-label="Send message">
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
