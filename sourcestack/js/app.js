const API_URL = "https://YOUR-RENDER-SERVICE.onrender.com/api/ask";

const documentsInput = document.querySelector("#documents");
const fileStatus = document.querySelector("#file-status");
const questionForm = document.querySelector("#question-form");
const questionInput = document.querySelector("#question");
const answer = document.querySelector("#answer");
const submitButton = questionForm.querySelector('button[type="submit"]');

documentsInput.addEventListener("change", () => {
  const files = [...documentsInput.files];

  fileStatus.textContent = files.length
    ? `${files.length} document${files.length === 1 ? "" : "s"} selected.`
    : "No documents selected.";
});

questionForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const files = [...documentsInput.files];
  const question = questionInput.value.trim();

  if (!files.length) {
    answer.textContent = "Select at least one .txt or .md document first.";
    return;
  }

  if (!question) {
    answer.textContent = "Enter a question first.";
    return;
  }

  try {
    submitButton.disabled = true;
    answer.textContent = "Reading your documents and asking the AI…";

    const documents = await Promise.all(
      files.map(async (file) => {
        const extension = file.name.split(".").pop().toLowerCase();

        if (!["txt", "md"].includes(extension)) {
          throw new Error(
            `${file.name} is not supported yet. Choose a .txt or .md file.`
          );
        }

        return {
          name: file.name,
          text: await file.text()
        };
      })
    );

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ question, documents })
    });

    const contentType = response.headers.get("content-type") || "";
    const responseText = await response.text();

    if (!contentType.includes("application/json")) {
      throw new Error(
        "The backend returned a webpage instead of JSON. Check the Render service URL."
      );
    }

    const result = JSON.parse(responseText);

    if (!response.ok) {
      throw new Error(result.error || "The request failed.");
    }

    answer.textContent = result.answer || "The AI returned an empty answer.";
  } catch (error) {
    answer.textContent = error.message;
  } finally {
    submitButton.disabled = false;
  }
});
