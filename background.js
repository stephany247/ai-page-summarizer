importScripts("config.js");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "summarizeText") {
    summarizeText(request.text)
      .then((summary) => {
        sendResponse({ summary });
      })
      .catch((error) => {
        sendResponse({
          summary: "Error generating summary",
        });
      });

    return true;
  }
});

async function summarizeText(text) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Return ONLY 3 clean bullet points. Do not include introductions, titles, or explanations. Webpage: ${text}`,
              },
            ],
          },
        ],
      }),
    },
  );

  const data = await response.json();

  return data.candidates[0].content.parts[0].text;
}
