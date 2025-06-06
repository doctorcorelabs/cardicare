import { GoogleGenAI, HarmCategory, HarmBlockThreshold, GenerationConfig, Content, Part } from '@google/genai';

export interface Env {
  GEMINI_API_KEY: string;
}

// Helper function to convert ArrayBuffer to base64
function bufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// System instruction to guide the AI
const systemInstruction = `You are an informative and empathetic virtual assistant for the 'CardiCare' heart health website. Your primary role is to support users.

**Core Responsibilities:**
1.  Provide general information. Base your answers on general knowledge.
2.  Use clear, friendly, empathetic, and easy-to-understand language.
3.  Avoid speculation or providing unverified information.
4.  Attempt to answer all questions to the best of your ability.

**EKG Image Interpretation (Primary Task for Uploads):**
-   If a user uploads an EKG image, your **primary and mandatory task** is to interpret it for potential signs of Acute Coronary Syndrome (ACS). You must always attempt to provide an interpretation.
-   **Image Quality Handling:** If the EKG image is unclear, of poor quality, or partially obscured, you must still attempt an interpretation. You may note if the image quality could affect the interpretation (e.g., "I will attempt to interpret the EKG image you provided. Please note that the image quality appears [blurry/low resolution/partially obscured], which may be a factor in this interpretation.").
-   **Specific Findings to Identify (if present):**
    -   ST segment elevation (and its location if possible)
    -   ST segment depression (and its location if possible)
    -   T wave inversion (and its location if possible)
    -   Pathological Q waves (and its location if possible)
    -   Specific location of ischemia or infarct if discernible.
-   Present your findings as a clear, itemized list.

Remember to maintain a supportive and helpful tone throughout the interaction.
`;

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/chat' && request.method === 'POST') {
      try {
        if (!env.GEMINI_API_KEY) {
          return new Response('GEMINI_API_KEY is not configured.', { status: 500 });
        }

        const formData = await request.formData();
        const userInput = formData.get('message') as string | null;
        const uploadedFile = formData.get('file') as File | null;
        const historyString = formData.get('history') as string | null;
        const history: Content[] = historyString ? JSON.parse(historyString) : [];

        const currentUserParts: Part[] = [];
        let isEKGImageUpload = false;

        if (uploadedFile) {
          if (uploadedFile.size > 10 * 1024 * 1024) { // 10MB limit
            return new Response('File exceeds 10MB limit.', { status: 413 });
          }

          const supportedImageMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
          const supportedPdfMimeType = 'application/pdf';

          if (supportedImageMimeTypes.includes(uploadedFile.type)) {
            isEKGImageUpload = true; // Assume any image could be an EKG for now
            const fileBuffer = await uploadedFile.arrayBuffer();
            const base64Data = bufferToBase64(fileBuffer);
            currentUserParts.push({
              inlineData: {
                mimeType: uploadedFile.type,
                data: base64Data,
              },
            });
          } else if (uploadedFile.type === supportedPdfMimeType) {
            // Handle PDF if necessary, or reject if only images are for EKG
             const fileBuffer = await uploadedFile.arrayBuffer();
             const base64Data = bufferToBase64(fileBuffer);
             currentUserParts.push({
               inlineData: {
                 mimeType: uploadedFile.type,
                 data: base64Data,
               },
             });
            // For now, we are not specifically treating PDFs as EKGs unless instructed
          } else {
            return new Response(
              `Unsupported file type: ${uploadedFile.type}. Supported: JPG, PNG, GIF, WEBP for images, or PDF.`,
              { status: 415 }
            );
          }
        }
        
        // Add text input if present. If it's an EKG image, the text might be a specific prompt.
        if (userInput && userInput.trim()) {
          currentUserParts.push({ text: userInput.trim() });
        } else if (isEKGImageUpload && currentUserParts.length > 0) {
          // If it's an EKG image and no text, add a default prompt for interpretation
          currentUserParts.unshift({ text: "Interpret this EKG image for signs of Acute Coronary Syndrome." });
        }


        if (currentUserParts.length === 0) {
          return new Response('Message or file is required.', { status: 400 });
        }

        const genAI = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
        // Use a model that is good with vision and text, like gemini-pro-vision or a newer equivalent
        // For this example, we'll stick to the provided model name but acknowledge vision capabilities are key.
        const modelName = 'gemini-1.5-flash-latest'; // Use a model known for multimodal capabilities
                                                  // Or 'gemini-pro-vision' if that's preferred and available
                                                  // The original 'gemini-2.5-flash-preview-05-20' might also work if it supports vision.

        // System instruction as the first content part
        const systemInstructionContent: Content = {
            role: "model", // Or "system" if the SDK version treats it that way for initial instruction
            parts: [{text: systemInstruction}],
        };
        
        const fullContents: Content[] = [
          systemInstructionContent,
          ...history, 
          { role: 'user', parts: currentUserParts },
        ];

        // generationConfig is removed for now due to compatibility issues with generateContentStream parameters
        // const generationConfig: GenerationConfig = { ... };

        // Use the direct genAI.models.generateContentStream method
        const resultStream = await genAI.models.generateContentStream({
          model: modelName,
          contents: fullContents,
          // generationConfig: generationConfig, // Removed
        });
        

        const { readable, writable } = new TransformStream();
        const writer = writable.getWriter();
        const textEncoder = new TextEncoder();
        (async () => {
          try {
            console.log("[Worker] Starting to stream chunks...");
            // Iterate directly on resultStream and use chunk.text property
            for await (const chunk of resultStream) { 
              try {
                const chunkText = chunk.text; // text is a property
                if (typeof chunkText === 'string') {
                  console.log("[Worker] Streaming chunk:", chunkText.substring(0, 50) + "..."); 
                  await writer.write(textEncoder.encode(chunkText));
                } else {
                  console.log("[Worker] Received chunk without text or not a string:", chunk);
                }
              } catch (chunkError) {
                console.error("[Worker] Error processing chunk:", chunkError);
              }
            }
            console.log("[Worker] Finished streaming chunks.");
          } catch (error) {
            console.error('Error during streaming from Gemini (inside async pipe):', error);
            if (error instanceof Error) {
              console.error('Stream Error Name:', error.name);
              console.error('Stream Error Message:', error.message);
              console.error('Stream Error Stack:', error.stack);
            }
            // Avoid writing to writer if it's already closed or in an error state
            try {
              await writer.write(textEncoder.encode('Sorry, an internal error occurred while streaming data.'));
            } catch (writeError) {
              console.error("[Worker] Error writing error message to stream:", writeError);
            }
          } finally {
            console.log("[Worker] Closing writer.");
            try {
              await writer.close();
            } catch (closeError) {
               console.error("[Worker] Error closing writer:", closeError);
            }
          }
        })();

        return new Response(readable, {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });

      } catch (error) {
        console.error('Error in /chat handler (raw):', error); 
        if (error instanceof Error) {
          console.error('Error name:', error.name);
          console.error('Error message:', error.message);
          console.error('Error stack:', error.stack);
          if ('response' in error && (error as any).response?.data) {
             console.error('API Response Error Data:', (error as any).response.data);
          }
        } else {
          console.error('Unknown error object structure:', error);
        }
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred. Check worker logs for details.';
        return new Response(`Error processing chat request: ${errorMessage}`, { status: 500 });
      }
    }

    return new Response('Not Found', { status: 404 });
  },
};
