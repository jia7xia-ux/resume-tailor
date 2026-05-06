import { IncomingForm } from "formidable";
import fs from "fs";
import pdfParse from "pdf-parse";
import OpenAI from "openai";

export const config = {
  api: {
    bodyParser: false,
  },
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    try {
      const jd = fields.jd;
      const file = files.resume[0];

      const fileBuffer = fs.readFileSync(file.filepath);
      const pdfData = await pdfParse(fileBuffer);

      const resumeText = pdfData.text;

      const prompt = `
You are a resume optimization assistant.

Return ONLY valid JSON.

Resume:
${resumeText}

Job Description:
${jd}

Output format:
{
  "score": number,
  "missing_keywords": [],
  "suggestions": [],
  "rewritten_bullets": []
}
`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      });

      const output = completion.choices[0].message.content;

      res.status(200).json({ result: output });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Error processing file" });
    }
  });
}
