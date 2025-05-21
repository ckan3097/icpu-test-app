import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  try {
    const { messages } = req.body;

    console.log("Sending to OpenAI:", messages);

    const completion = await openai.chat.completions.create({
      model: "gpt-4-nano",
      messages: messages,
      max_tokens: 500,
    });

    const response = completion.choices[0].message.content;
    res.status(200).json({ response });
  } catch (error) {
    console.error("OpenAI API Error:", error);
    res.status(500).json({ error: error.message });
  }
}
