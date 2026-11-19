const documentsInput = document.querySelector("#documents");
const fileStatus = document.querySelector("#file-status");
const questionForm = document.querySelector("#question-form");
const answer = document.querySelector("#answer");

documentsInput.addEventListener("change", () => {
  const files = [...documentsInput.files];

  fileStatus.textContent = files.length
    ? `${files.length} document${files.length === 1 ? "" : "s"} selected.`
    : "No documents selected.";
});

questionForm.addEventListener("submit", (event) => {
  event.preventDefault();

  answer.textContent =
    "The interface is ready. Next, we’ll add document reading and connect it to an AI backend.";
});
