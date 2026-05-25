const button = document.getElementById("summarizeBtn");
const output = document.getElementById("output");

button.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  chrome.tabs.sendMessage(
    tab.id,
    { action: "getPageText" },
    (response) => {
      output.textContent = response.text.slice(0, 500);
    }
  );
});