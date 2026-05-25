importScripts("config.js");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "summarizeText") {
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
  }
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
Return:

1. A bullet point summary

2. Key insights in bullet points

Keep it clean and readable.

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

  return data.candidates[0].content.parts[0].text;
}
