import { GoogleGenAI, HarmCategory, HarmBlockThreshold, GenerationConfig, Content, Part } from '@google/genai';
import { getCorsHeaders, handleCorsPreflightRequest, applyCorsHeaders } from './cors-utils';

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

**Questionnaire-Based Insights (When 'message' contains questionnaire answers and no EKG is uploaded):**
-   When you receive answers from the heart health screening questionnaire (typically as a JSON string in the 'message' field, representing user's answers to questions like age, gender, smoking, hypertension, diabetes, cholesterol, familyHistory, exercise), your task is to provide a personalized analysis focusing on the user's risk factors for Acute Coronary Syndrome (ACS).
-   **Analyze the provided risk factors:** Carefully review each answer.
-   **Explain the implications in detail:** For each significant risk factor identified from the user's answers, clearly explain how it contributes to the potential risk of developing ACS. If multiple risk factors are present, explain how they can interact to increase risk. For example:
    -   If 'smoking' is 'current smoker': "Being a current smoker significantly damages blood vessels and increases the likelihood of blood clots, which are major contributors to ACS. The chemicals in tobacco smoke can also lead to atherosclerosis (hardening and narrowing of the arteries)."
    -   If 'hypertension' is 'yes': "Having diagnosed hypertension means your heart is working harder than normal to pump blood, and your arteries are under increased and sustained strain. Over time, this can lead to damage to the artery walls, making them more susceptible to plaque buildup and narrowing, which are key processes in the development of ACS."
    -   If 'diabetes' is 'yes': "Diabetes, especially if not well-managed, can damage blood vessels throughout the body, including the coronary arteries. High blood sugar levels contribute to atherosclerosis and can also affect nerve function, potentially masking chest pain that might otherwise signal a heart problem. This makes individuals with diabetes more vulnerable to ACS and its complications."
    -   If 'cholesterol' is 'high': "High cholesterol, particularly high LDL ('bad') cholesterol, leads to the formation of fatty deposits (plaques) in your arteries. This condition, known as atherosclerosis, narrows the arteries and can restrict blood flow to the heart. If a plaque ruptures, it can trigger a blood clot, leading to an ACS event like a heart attack."
    -   If 'familyHistory' is 'close': "A close family history of heart disease (parents or siblings, especially if they developed it at an early age) suggests a genetic predisposition. This means you might have inherited factors that increase your risk, such as tendencies towards high blood pressure, high cholesterol, or other conditions that contribute to ACS."
    -   If 'age' is '65plus' and 'gender' is 'male': "Being male and over 65 are both independent risk factors for ACS. Men generally develop heart disease earlier than women, and the risk for both genders increases significantly with age as arteries can become stiffer and more prone to plaque buildup over time."
    -   If 'exercise' is 'rarely': "A sedentary lifestyle or rarely exercising contributes to several risk factors for ACS, including obesity, high blood pressure, high cholesterol, and an increased risk of diabetes. Regular physical activity helps maintain heart health, control weight, and improve overall cardiovascular function."
-   **Connect to ACS:** Explicitly link the user's overall risk profile, based on their answers, to the potential for ACS. For example: "Based on your responses, factors such as [mention specific factors like 'current smoking' and 'diagnosed hypertension'] significantly elevate your potential risk for Acute Coronary Syndrome."
-   **Provide General Recommendations (Non-Medical Advice):** Offer general, evidence-based lifestyle recommendations relevant to the identified risk factors. For example, if the user smokes, suggest resources for quitting. If they rarely exercise, suggest starting with light activities.
-   **Emphasize Early Intervention and Professional Consultation:** Stress the importance of discussing these risk factors and the AI-generated insights with a doctor or healthcare professional. Early intervention and management of risk factors are crucial in preventing ACS.
-   **Structure the Output:** Present the analysis in a clear, easy-to-understand, and itemized or well-paragraphed format. Use headings or bold text for key sections if appropriate.
-   **Disclaimer:** Always conclude by reminding the user that this analysis is for informational and educational purposes only, is not a substitute for professional medical advice or diagnosis, and that they should consult with a qualified healthcare provider for any health concerns or before making any decisions related to their health or treatment.

Remember to maintain a supportive and helpful tone throughout the interaction.
`;

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Handle CORS preflight requests
    const corsPreflightResponse = handleCorsPreflightRequest(request);
    if (corsPreflightResponse) {
      return corsPreflightResponse;
    }
    
    const url = new URL(request.url);
    
    // Add health check endpoint
    if (url.pathname === '/ping' || url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...getCorsHeaders(request)
        }
      });
    }
    
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

        const response = new Response(readable, {
          headers: { 
            'Content-Type': 'text/plain; charset=utf-8',
          },
        });
        
        return applyCorsHeaders(response, request);

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
        const errorResponse = new Response(`Error processing chat request: ${errorMessage}`, { 
          status: 500
        });
        
        return applyCorsHeaders(errorResponse, request);
      }
    }

    const notFoundResponse = new Response('Not Found', { status: 404 });
    return applyCorsHeaders(notFoundResponse, request);
  },
};
