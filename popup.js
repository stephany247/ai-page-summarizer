const button = document.getElementById("summarizeBtn");
const output = document.getElementById("output");
const titleElement = document.getElementById("pageTitle");
const urlElement = document.getElementById("pageUrl");
const faviconElement = document.getElementById("favicon");
const readingTimeElement = document.getElementById("readingTime");
const wordCountElement = document.getElementById("wordCount");
const footer = document.querySelector(".footer");
const clearBtn = document.getElementById("clearBtn");
const copyBtn = document.getElementById("copyBtn");
const tabs = document.querySelectorAll(".tab");

let currentMode = "standard";

function formatSummary(summary) {
  if (currentMode === "quick") {
    return summary
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*\s/g, "• ")
      .replace(/\n/g, "<br><br>");
  }

  return summary
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/^\*\s/gm, "• ")
    .replace(/\n{2,}/g, "<br><br>")
    .replace(/\n/g, "<br>");
}

function resetUI() {
  button.disabled = false;
  button.innerHTML = "Summarize Page";
  output.classList.remove("loading");
}

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
  button.disabled = true;
  button.innerHTML = "Summarizing...";

  footer.classList.add("hidden");

  output.classList.add("loading");
  output.innerHTML = `
  <div class="loader"></div>
`;

  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  const cacheKey = `${tab.url}_${currentMode}`;
  chrome.storage.local.get(
    [cacheKey],

    (cached) => {
      const saved = cached[cacheKey];

      if (saved) {
        console.log("CACHE HIT");
        output.innerHTML = formatSummary(saved.summary);

        readingTimeElement.textContent = `${saved.readingTime} min read`;
        wordCountElement.textContent = `${saved.wordCount} words`;

        footer.classList.remove("hidden");

        resetUI();

        return;
      }
      console.log("CACHE MISS - calling Gemini");

      chrome.tabs.sendMessage(
        tab.id,
        { action: "getPageText" },

        (response) => {
          if (chrome.runtime.lastError) {
            output.textContent = chrome.runtime.lastError.message;
            resetUI();
            return;
          }

          if (!response || !response.text) {
            output.textContent = "Could not extract page text.";
            resetUI();
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
                resetUI();
                return;
              }

              const summary = result?.summary || "No summary generated.";

              output.classList.remove("loading");
              output.innerHTML = formatSummary(summary);

              const cacheKey = `${tab.url}_${currentMode}`;
              if (
                summary !== "Error generating summary" &&
                summary !== "No summary generated."
              ) {
                chrome.storage.local.set({
                  [cacheKey]: {
                    summary,
                    readingTime: response.readingTime,
                    wordCount: response.wordCount,
                  },
                });
              }

              button.disabled = false;
              button.innerHTML = "Summarize Page";

              footer.classList.remove("hidden");
            },
          );
        },
      );
    },
  );
});

clearBtn.addEventListener("click", () => {
  output.innerHTML = "";
  footer.classList.add("hidden");
});

copyBtn.addEventListener("click", async () => {
  const text = output.innerText;

  if (!text.trim()) {
    return;
  }

  await navigator.clipboard.writeText(text);
  copyBtn.textContent = "Copied!";
  setTimeout(() => {
    copyBtn.textContent = "Copy";
  }, 2000);
});
