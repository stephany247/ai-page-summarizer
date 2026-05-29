# PagePulse — AI Page Summarizer

> A Chrome Extension (Manifest V3) that extracts content from webpages and generates AI-powered summaries using Google's Gemini API.

---

## Features

- Standard summary mode with key insights
- Quick Digest mode with 3 concise bullet points
- Reading time estimation
- Word count display
- Summary caching using chrome.storage
- Copy summary to clipboard
- Light and dark theme support
- Loading and error states
- Rate limiting protection
- Responsive and accessible popup UI

---

## Installation (Local)

This extension is not published to the Chrome Web Store and is intended for local installation.

### 1. Download the Project

Clone or download this repository and extract it to a permanent location.

### 2. Create a Configuration File

Create a file named:

```txt
config.js
```

Add your Gemini API key:

```js
const API_KEY = "YOUR_GEMINI_API_KEY";
```

A sample configuration is provided in:

```txt
config.example.js
```

### 3. Load the Extension

1. Open Google Chrome.
2. Navigate to:

```txt
chrome://extensions
```

3. Enable **Developer Mode**.
4. Click **Load unpacked**.
5. Select the project folder.

The extension will now appear in your Chrome toolbar.

### 4. Use the Extension

1. Open any article or webpage.
2. Click the PagePulse extension icon.
3. Choose either:
   - Standard
   - Quick Digest

4. Click **Summarize Page**.
5. View the generated summary, reading time, and word count.

---

## Architecture

```txt
pagepulse/
├── manifest.json
├── background.js
├── content.js
├── popup.html
├── popup.css
├── popup.js
├── config.example.js
└── icons/
```

### Message Flow

```txt
Popup UI
    ↓
Content Script
    ↓
Extract Page Content
    ↓
Background Service Worker
    ↓
Gemini API
    ↓
Popup UI
```

### Component Responsibilities

| File              | Responsibility                                  |
| ----------------- | ----------------------------------------------- |
| manifest.json     | Extension configuration and permissions         |
| popup.html/css/js | User interface and interactions                 |
| content.js        | Extracts meaningful webpage content             |
| background.js     | Handles AI requests, caching, and rate limiting |
| config.js         | Stores the local Gemini API key                 |

---

## AI Integration

The extension uses Google's Gemini API to generate summaries.

### Model

```txt
gemini-flash-latest
```

### Endpoint

```txt
https://generativelanguage.googleapis.com
```

### Modes

#### Standard Mode

Returns:

- Summary section
- Key insights section

#### Quick Digest Mode

Returns:

- Three concise bullet points

### Content Processing

- Readable page content is extracted from the current webpage.
- Content is truncated before being sent to the API to reduce token usage.
- The background service worker handles all API communication.

---

## Security Decisions

### API Key Protection

- API keys are stored locally in config.js.
- config.js is excluded through .gitignore.
- config.example.js is provided for setup.
- API keys are never committed to source control.

### Message Validation

- Messages are validated before processing.
- Only supported actions are accepted by the background and content scripts.

### XSS Protection

- AI-generated content is sanitized before rendering.
- HTML characters are escaped before insertion into the DOM.
- User content is never directly executed.

### Minimal Permissions

| Permission         | Purpose                           |
| ------------------ | --------------------------------- |
| `activeTab`        | Access current tab information    |
| `scripting`        | Inject content extraction script  |
| `storage`          | Cache summaries and user settings |
| `host_permissions` | Access Gemini API                 |

---

## Trade-offs

| Decision                        | Trade-off                                                                 |
| ------------------------------- | ------------------------------------------------------------------------- |
| Local API key storage           | Easier setup, but users must provide their own API key                    |
| Chrome storage caching          | Faster repeated summaries but may serve stale content if a page changes   |
| Lightweight extraction approach | Faster implementation but less accurate than a full readability parser    |
| Gemini Flash model              | Fast responses and low cost, but output quality may vary on complex pages |

---

## Development

To test changes:

1. Save your files.
2. Open:

```txt
chrome://extensions
```

3. Click **Reload** on the PagePulse extension.
4. Refresh the target webpage.
5. Open the extension popup and test.

---

## Requirements

- Google Chrome (Manifest V3 compatible)
- Gemini API Key

---

## Future Improvements

- Readability parser integration
- Export summaries as PDF or Markdown
- Multi-language support
- Custom summary lengths
- Backend proxy for API key management
