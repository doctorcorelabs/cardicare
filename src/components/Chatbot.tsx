import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, Send, Paperclip, XCircle } from 'lucide-react'; // Added Paperclip, XCircle
import ReactMarkdown, { Components } from 'react-markdown';

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
    });


    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        // headers: { 'Content-Type': 'application/json' }, // Removed for FormData
        body: formData, // Use FormData
      });

      if (!response.ok) { // Check response.ok first
        const errorText = await response.text();
        // Display specific error from backend if available
        const displayError = response.status === 413 ? 'File is too large. Max 10MB.' :
                             response.status === 415 ? 'Unsupported file type. Please use JPG, PNG, GIF, WEBP, or PDF.' :
                             `Server error: ${response.status} ${errorText || response.statusText}`;
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
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === aiResponseId
            ? { ...msg, text: error instanceof Error ? error.message : 'Sorry, an error occurred. Please try again.' }
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
    <div ref={chatContainerRef} className="flex flex-col h-[500px] max-w-lg mx-auto bg-white shadow-xl rounded-lg border border-gray-200" tabIndex={0} /* Make div focusable for paste */ >
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <Bot className="mr-2 h-6 w-6 text-blue-600" />
          CardiCare Assistant
        </h2>
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
