
import type { NextApiRequest, NextApiResponse } from "next";

type ResponseData = {
  answer: string;
  sources?: string[];
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
    const answer = await getAnswerWithRetry(question);
    return res.status(200).json({ answer });
  } catch (error) {
    console.error("Error processing question:", error);
    return res.status(500).json({ 
      error: "I'm having trouble connecting right now. Please try again in a moment." 
    });
  }
}

async function getAnswerWithRetry(question: string, retries = 2): Promise<string> {
  try {
    return await getAnswer(question);
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return getAnswerWithRetry(question, retries - 1);
    }
    throw error;
  }
}

async function getAnswer(question: string): Promise<string> {
  const lowerQuestion = question.toLowerCase();
  
  const needsWebSearch = 
    lowerQuestion.includes("current") ||
    lowerQuestion.includes("today") ||
    lowerQuestion.includes("latest") ||
    lowerQuestion.includes("news") ||
    lowerQuestion.includes("weather") ||
    lowerQuestion.includes("when is") ||
    lowerQuestion.includes("what time");

  if (needsWebSearch) {
    const searchAnswer = await searchWeb(question);
    if (searchAnswer) return searchAnswer;
  }

  return await askGPT(question);
}

async function searchWeb(question: string): Promise<string | null> {
  const braveApiKey = process.env.BRAVE_SEARCH_API_KEY;
  
  if (!braveApiKey) {
    console.log("Brave Search API key not configured, falling back to GPT");
    return null;
  }

  try {
    const response = await fetch(
      `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(question)}&count=3`,
      {
        headers: {
          "Accept": "application/json",
          "X-Subscription-Token": braveApiKey
        }
      }
    );

    if (!response.ok) {
      console.error("Brave Search API error:", response.status);
      return null;
    }

    const data = await response.json();
    const results = data.web?.results || [];

    if (results.length === 0) {
      return null;
    }

    const context = results
      .slice(0, 3)
      .map((r: any) => `${r.title}: ${r.description}`)
      .join("\n\n");

    return await summarizeWithGPT(question, context);
  } catch (error) {
    console.error("Error searching web:", error);
    return null;
  }
}

async function summarizeWithGPT(question: string, context: string): Promise<string> {
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!openaiApiKey) {
    return `Based on recent information: ${context}`;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant for an 87-year-old woman. Provide clear, warm, and concise answers. Be patient and caring in your tone. Keep answers under 150 words."
          },
          {
            role: "user",
            content: `Question: ${question}\n\nContext from web search:\n${context}\n\nPlease provide a clear, friendly answer based on this information.`
          }
        ],
        temperature: 0.7,
        max_tokens: 250
      })
    });

    if (!response.ok) {
      throw new Error("OpenAI API error");
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error with GPT summarization:", error);
    return `Based on recent information: ${context}`;
  }
}

async function askGPT(question: string): Promise<string> {
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!openaiApiKey) {
    return "I need an OpenAI API key to answer questions. Please add your OPENAI_API_KEY to the environment variables in the Softgen settings.";
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful, patient assistant for an 87-year-old Jewish woman named Lois. You have knowledge about general topics, Judaism, and health. Provide warm, clear, and concise answers. Be respectful and caring. Keep answers under 150 words unless asked for more detail."
          },
          {
            role: "user",
            content: question
          }
        ],
        temperature: 0.7,
        max_tokens: 250
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error asking GPT:", error);
    throw error;
  }
}
