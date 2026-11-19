const documentsInput = document.querySelector("#documents");
const fileStatus = document.querySelector("#file-status");
const questionForm = document.querySelector("#question-form");
const questionInput = document.querySelector("#question");
const answer = document.querySelector("#answer");
const submitButton = questionForm.querySelector('button[type="submit"]');
const promptOutput = document.querySelector("#prompt-output");
const copyButton = document.querySelector("#copy-prompt");
const openDuckButton = document.querySelector("#open-duck");

let preparedPrompt = "";

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
    answer.textContent = "Reading your documents…";
    promptOutput.hidden = true;
    copyButton.hidden = true;
    openDuckButton.hidden = true;

    const documents = await Promise.all(
      files.map(async (file) => {
        const extension = file.name.split(".").pop().toLowerCase();

        if (!["txt", "md"].includes(extension)) {
          throw new Error(
            `${file.name} is not supported. Choose a .txt or .md file.`
          );
        }

        return {
          name: file.name,
          text: await file.text()
        };
      })
    );

    const documentText = documents
      .map(({ name, text }) => `--- Document: ${name} ---\n${text}`)
      .join("\n\n");

    preparedPrompt = [
      "Answer the question using the provided documents as your sources.",
      "If the documents do not contain the answer, say so. Do not invent facts.",
      "When useful, identify which document supports your answer.",
      "",
      `Question: ${question}`,
      "",
      "Documents:",
      documentText
    ].join("\n");

    promptOutput.value = preparedPrompt;
    promptOutput.hidden = false;
    copyButton.hidden = false;
    openDuckButton.hidden = false;
    answer.textContent =
      "Prompt ready. Copy it, open Duck.ai, and paste it into the chat.";
  } catch (error) {
    answer.textContent = error.message;
  } finally {
    submitButton.disabled = false;
  }
});

copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(preparedPrompt);
    answer.textContent = "Copied. Open Duck.ai and paste the prompt into the chat.";
  } catch {
    promptOutput.focus();
    promptOutput.select();
    answer.textContent =
      "Automatic copy didn’t work. The prompt is selected—copy it, then paste it into Duck.ai.";
  }
});

openDuckButton.addEventListener("click", () => {
  window.open("https://duck.ai/", "_blank", "noopener,noreferrer");
});
