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
      error: "I'm having trouble right now. Please try asking again in a moment." 
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
  const openaiApiKey = process.env.OPENAI_API_KEY;
  
  if (openaiApiKey) {
    return await askGPT(question, openaiApiKey);
  }
  
  return await getBasicAnswer(question);
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

  if (lowerQuestion.includes("shabbat") || lowerQuestion.includes("sabbath")) {
    return "Shabbat is the Jewish day of rest, beginning Friday evening at sunset and ending Saturday evening when three stars appear in the sky. It's a time for rest, prayer, and family.";
  }

  if (lowerQuestion.includes("passover") || lowerQuestion.includes("pesach")) {
    return "Passover is a major Jewish holiday celebrating the Israelites' exodus from slavery in Egypt. It lasts 7-8 days and includes the Seder meal with symbolic foods and the retelling of the Exodus story.";
  }

  if (lowerQuestion.includes("rosh hashanah")) {
    return "Rosh Hashanah is the Jewish New Year, a time of reflection and renewal. It's celebrated with apples and honey (symbolizing a sweet new year), special prayers, and the blowing of the shofar.";
  }

  if (lowerQuestion.includes("yom kippur")) {
    return "Yom Kippur is the Day of Atonement, the holiest day in Judaism. It's a day of fasting and prayer, asking for forgiveness for the past year's sins.";
  }

  if (lowerQuestion.includes("emergency") || lowerQuestion.includes("911")) {
    return "For emergencies, always call 911 immediately. For medical questions, please consult with your doctor or healthcare provider.";
  }

  if (lowerQuestion.includes("medicine") || lowerQuestion.includes("medication")) {
    return "For questions about your medications, please speak with your doctor or pharmacist. They have your medical history and can give you the best advice.";
  }

  if (lowerQuestion.includes("help") && !lowerQuestion.includes("can you help")) {
    return "I'm here to help! You can ask me about general topics, the time and date, or I can provide friendly conversation. What would you like to know?";
  }

  return `I heard your question: "${question}"\n\nI can help with:\n• Time and date\n• General conversation\n• Emergency numbers (911)\n\nFor more detailed answers, you can add an OpenAI API key in the settings to enable advanced AI responses. But I'm always here to chat and help however I can!`;
}

async function askGPT(question: string, apiKey: string): Promise<string> {
  try {
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
            content: "You are a helpful, knowledgeable assistant named aworkingbear's Assistant. Provide clear, concise, and accurate answers. Be friendly and professional. Keep answers under 150 words unless asked for more detail."
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
    return await getBasicAnswer(question);
  }
}