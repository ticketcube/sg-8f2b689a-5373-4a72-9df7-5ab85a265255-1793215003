import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";

type ResponseData = {
  answer: string;
  sources?: string[];
  usedAI?: boolean;
};

type ErrorData = {
  error: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ErrorData>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { question } = req.body;

  if (!question || typeof question !== "string") {
    return res.status(400).json({ error: "Question is required" });
  }

  try {
    const result = await getAnswerWithRetry(question);
    
    // Save to Supabase (no auth required since RLS is disabled)
    await saveConversation(question, result.answer, result.usedAI);
    
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error processing question:", error);
    return res.status(500).json({ 
      error: "I'm having trouble right now. Please try asking again in a moment." 
    });
  }
}

async function saveConversation(question: string, answer: string, usedAI?: boolean): Promise<void> {
  try {
    const { error } = await supabase
      .from('conversations')
      .insert({
        question,
        answer,
        metadata: {
          model: usedAI ? 'gpt-3.5-turbo' : 'basic',
          timestamp: new Date().toISOString(),
          usedOpenAI: usedAI || false
        }
      });
    
    if (error) {
      console.error("Error saving to Supabase:", error);
    }
  } catch (error) {
    console.error("Error saving conversation:", error);
  }
}

async function getAnswerWithRetry(question: string, retries = 2): Promise<ResponseData> {
  try {
    return await getAnswer(question);
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return getAnswerWithRetry(question, retries - 1);
    }
    console.error("All retries failed, using basic answer:", error);
    return {
      answer: await getBasicAnswer(question),
      usedAI: false
    };
  }
}

async function getAnswer(question: string): Promise<ResponseData> {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  
  if (!openaiApiKey || !openaiApiKey.startsWith('sk-')) {
    console.log("No valid OpenAI API key found, using basic answer");
    return {
      answer: await getBasicAnswer(question),
      usedAI: false
    };
  }
  
  try {
    const answer = await askGPT(question, openaiApiKey);
    return {
      answer,
      usedAI: true
    };
  } catch (error) {
    console.error("OpenAI error, falling back to basic answer:", error);
    return {
      answer: await getBasicAnswer(question),
      usedAI: false
    };
  }
}

async function askGPT(question: string, apiKey: string): Promise<string> {
  console.log("Calling OpenAI API...");
  
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful, knowledgeable assistant for Lois. Provide clear, concise, and accurate answers. Be friendly and professional. Keep answers under 150 words unless asked for more detail. Speak naturally as if talking to a friend."
        },
        {
          role: "user",
          content: question
        }
      ],
      temperature: 0.7,
      max_tokens: 300
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: { message: response.statusText } }));
    console.error("OpenAI API Error:", errorData);
    throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  console.log("OpenAI response received successfully");
  return data.choices[0].message.content.trim();
}

async function getBasicAnswer(question: string): Promise<string> {
  const lowerQuestion = question.toLowerCase();
  
  const greetings = ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"];
  if (greetings.some(g => lowerQuestion.includes(g))) {
    return "Hello! I'm here to help you. What would you like to know?";
  }
  
  if (lowerQuestion.includes("how are you")) {
    return "I'm doing well, thank you for asking! How can I help you today?";
  }
  
  if (lowerQuestion.includes("what") && lowerQuestion.includes("time")) {
    const now = new Date();
    return `It's currently ${now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} on ${now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.`;
  }
  
  if (lowerQuestion.includes("what") && lowerQuestion.includes("day")) {
    const now = new Date();
    return `Today is ${now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}.`;
  }

  return `I heard your question: "${question}"\n\nI can help with:\n• Time and date\n• General conversation\n• Questions and answers\n\nNote: To get smarter AI answers, make sure your OpenAI API key is properly configured.`;
}