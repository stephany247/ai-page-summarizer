chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getPageText") {
    const article = document.querySelector("article");
    const main = document.querySelector("main");

    const pageText =
      article?.innerText || main?.innerText || document.body.innerText;

    const wordCount = pageText.trim().split(/\s+/).length;

    const readingTime = Math.ceil(wordCount / 200);

    sendResponse({
      text: pageText,
      readingTime,
      wordCount,
    });
  }
});
