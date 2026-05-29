importScripts("config.js");
let lastRequestTime = 0;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action !== "summarizeText" || typeof request.text !== "string") {
    return;
  }
  const now = Date.now();

  if (now - lastRequestTime < 5000) {
    sendResponse({
      summary: "Please wait a few seconds before generating another summary.",
    });
    return true;
  }

  lastRequestTime = now;

  summarizeText(request.text, request.mode)
    .then((summary) => {
      sendResponse({
        summary,
      });
    })

    .catch((error) => {
      console.error(error);

      sendResponse({
        summary: "Error generating summary",
      });
    });

  return true;
});

async function summarizeText(text, mode) {
  let prompt = "";

  if (mode === "quick") {
    prompt = `
Return ONLY 3 short bullet points.

No introductions.
No headings.
No explanations.

Webpage:
${text}
`;
  } else {
    prompt = `
Return plain text only.

Format:

SUMMARY
• short bullet
• short bullet
• short bullet

KEY INSIGHTS
• short insight
• short insight
• short insight

Rules:
- No HTML
- No markdown
- No markdown headings
- No ### symbols
- No separators
- Keep bullets concise
- No introductions
- No conclusions

Webpage:
${text}
`;
  }

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
                text: prompt,
              },
            ],
          },
        ],
      }),
    },
  );

  const data = await response.json();

  console.log(data);

  if (!data.candidates) {
    throw new Error(data.error?.message || "No summary returned");
  }

  return data.candidates[0].content.parts[0].text;
}
