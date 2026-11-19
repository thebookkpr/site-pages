require("dotenv").config();

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();

app.use(cors({
  origin: "https://thebookkpr.github.io"
}));
app.use(express.json({ limit: "3mb" }));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/api/ask", async (req, res) => {
  const { question, documents } = req.body;

  if (!question || !Array.isArray(documents) || documents.length === 0) {
    return res.status(400).json({
      error: "Provide a question and at least one document."
    });
  }

  const documentText = documents
    .map((doc) => `Document: ${doc.name}\n${doc.text}`)
    .join("\n\n---\n\n");

  try {
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-6.2-astra",
      instructions:
        "Answer using the provided documents. If they do not contain the answer, say so. Do not invent facts.",
      input: `DOCUMENTS\n${documentText}\n\nQUESTION\n${question}`
    });

    res.json({ answer: response.output_text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "The AI request failed. Check the backend logs." });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log(`SourceStack backend listening on port ${port}`);
});
