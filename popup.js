const button = document.getElementById("summarizeBtn");
const output = document.getElementById("output");
const titleElement = document.getElementById("pageTitle");
const urlElement = document.getElementById("pageUrl");
const faviconElement = document.getElementById("favicon");

chrome.tabs.query(
  {
    active: true,
    currentWindow: true,
  },

  (tabs) => {
    const tab = tabs[0];

    titleElement.textContent = tab.title;

    urlElement.textContent = tab.url;
    urlElement.href = tab.url;

    faviconElement.src = tab.favIconUrl;
  },
);

button.addEventListener("click", async () => {
  output.textContent = "Loading...";

  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  chrome.tabs.sendMessage(
    tab.id,
    { action: "getPageText" },

    (response) => {
      if (chrome.runtime.lastError) {
        output.textContent = chrome.runtime.lastError.message;
        return;
      }

      if (!response || !response.text) {
        output.textContent = "Could not extract page text.";
        return;
      }

      chrome.runtime.sendMessage(
        {
          action: "summarizeText",
          text: response.text.slice(0, 10000),
        },

        (result) => {
          if (chrome.runtime.lastError) {
            output.textContent = chrome.runtime.lastError.message;
            return;
          }

          output.textContent = result?.summary || "No summary generated.";
        },
      );
    },
  );
});
