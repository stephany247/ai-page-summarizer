const button = document.getElementById("summarizeBtn");
const output = document.getElementById("output");
const titleElement = document.getElementById("pageTitle");
const urlElement = document.getElementById("pageUrl");
const faviconElement = document.getElementById("favicon");
const readingTimeElement = document.getElementById("readingTime");
const wordCountElement = document.getElementById("wordCount");

let currentMode = "standard";
const tabs = document.querySelectorAll(".tab");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => {
      t.classList.remove("active");
    });

    tab.classList.add("active");

    currentMode = tab.dataset.mode;
  });
});

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

      readingTimeElement.textContent = `${response.readingTime} min read`;

      wordCountElement.textContent = `${response.wordCount} words`;

      chrome.runtime.sendMessage(
        {
          action: "summarizeText",
          text: response.text.slice(0, 10000),
          mode: currentMode,
        },

        (result) => {
          if (chrome.runtime.lastError) {
            output.textContent = chrome.runtime.lastError.message;
            return;
          }

          const summary = result?.summary || "No summary generated.";

          const formattedSummary = summary
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\*\s/g, "• ")
            .replace(/\n/g, "<br><br>");

          output.innerHTML = formattedSummary;
        },
      );
    },
  );
});
