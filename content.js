chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getPageText") {
    const pageText = document.body.innerText;

    const wordCount = pageText.trim().split(/\s+/).length;

    const readingTime = Math.ceil(wordCount / 200);

    sendResponse({
      text: pageText,
      readingTime,
      wordCount,
    });
  }
});
