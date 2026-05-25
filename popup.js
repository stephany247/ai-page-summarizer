const button = document.getElementById("summarizeBtn");
const output = document.getElementById("output");

button.addEventListener("click", async () => {
  output.textContent = "Loading...";

  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  chrome.tabs.sendMessage(
    tab.id,
    { action: "getPageText" },

    (response) => {

      if (chrome.runtime.lastError) {
        output.textContent =
          chrome.runtime.lastError.message;
        return;
      }

      if (!response || !response.text) {
        output.textContent =
          "Could not extract page text.";
        return;
      }

      chrome.runtime.sendMessage(
        {
          action: "summarizeText",
          text: response.text.slice(0, 10000)
        },

        (result) => {

          if (chrome.runtime.lastError) {
            output.textContent =
              chrome.runtime.lastError.message;
            return;
          }

          output.textContent =
            result?.summary || "No summary generated.";
        }
      );
    }
  );
});