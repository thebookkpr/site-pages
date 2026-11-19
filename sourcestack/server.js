require("dotenv").config();

const express = require("express");
const path = require("path");
const OpenAI = require("openai");

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY in your .env file.");
}

const app = express();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.json({ limit: "3mb" }));
app.use(express.static(path.join(__dirname)));

app.post("/api/ask", async (req, res) => {
  const { question, documents } = req.body;

  if (typeof question !== "string" || !question.trim()) {
    return res.status(400).json({ error: "Enter a question." });
  }

  if (!Array.isArray(documents) || documents.length === 0) {
    return res.status(400).json({ error: "Select at least one .txt or .md document." });
  }

  const sourceText = documents
    .filter((doc) =>
      doc &&
      typeof doc.name === "string" &&
      typeof doc.text === "string"
    )
    .map((doc) => `Document: ${doc.name}\n${doc.text}`)
    .join("\n\n---\n\n");

  if (!sourceText.trim()) {
    return res.status(400).json({ error: "No readable document text was provided." });
  }

  try {
    const response = await client.responses.create({
      model: "gpt-6.2-astra",
      instructions:
        "Answer using the provided documents. If they do not contain the answer, say so. Do not invent facts. When useful, mention which document supports the answer.",
      input: `DOCUMENTS\n${sourceText}\n\nQUESTION\n${question.trim()}`
    });

    res.json({ answer: response.output_text });
  } catch (error) {
    console.error("AI request failed:", error.message);
    res.status(500).json({ error: "The AI request failed. Check the server terminal for details." });
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`SourceStack is running at http://localhost:${port}`);
});
