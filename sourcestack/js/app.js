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

  try {
    submitButton.disabled = true;
    answer.textContent = "Reading documents and asking the AI…";

    const documents = await Promise.all(
      files.map(async (file) => {
        const extension = file.name.split(".").pop().toLowerCase();

        if (!["txt", "md"].includes(extension)) {
          throw new Error(`${file.name} is not supported yet. Choose .txt or .md files.`);
        }

        return {
          name: file.name,
          text: await file.text()
        };
      })
    );

    const response = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, documents })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "The request failed.");
    }

    answer.textContent = result.answer;
  } catch (error) {
    answer.textContent = error.message;
  } finally {
    submitButton.disabled = false;
  }
});
