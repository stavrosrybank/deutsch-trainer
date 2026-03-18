# Deutsch Trainer

A personal German writing practice app. Get a random prompt, write freely in German, and receive intelligent feedback from Claude Sonnet that focuses on the patterns that matter most.

## What it does

- **Practice tab**  pick a random topic from 250 prompts, write your response, submit to Claude for analysis
- **Phrase Log**  every curated correction is saved as a personal phrasebook entry, grouped by week
- **Progress tab**  track your 100-session goal for 2026, daily streak, and most common error categories

## Prerequisites

- Node.js 18+
- An Anthropic API key from [console.anthropic.com](https://console.anthropic.com)

## Setup

```bash
# Clone or download this repo, then:
cd deutschtrainer
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

On first load you will be prompted for your Anthropic API key. It is stored only in your browser's localStorage and never sent anywhere except directly to the Anthropic API.

## Running the built version (offline)

```bash
npm run build
npx serve dist
```

## Project structure

```
src/
  services/storage.js     all localStorage read/write
  services/claude.js      Anthropic API calls + prompts
  hooks/useSessions.js    session state
  hooks/useProgress.js    streak & category stats
  components/
    ApiKeyModal.jsx
    NavBar.jsx
    practice/             TopicCard, WritingArea, AnalysisResult, Practice
    phraselog/            PhraseLog, PhraseWeekGroup, PhraseEntry
    progress/             Progress, ProgressBar, StreakCounter, CategoryBreakdown
public/
  topics.json             250 writing prompts (fetched at runtime)
```

## localStorage keys

| Key | Contents |
|-----|----------|
| `dt_sessions` | Array of session objects |
| `dt_phrases` | Denormalized phrase log entries |
| `dt_settings` | `{ apiKey }` |
| `dt_pattern_reports` | Pattern report cards (generated every 5 sessions) |

## Changing your API key

Open browser DevTools  Application  Local Storage  find `dt_settings` and update `apiKey`, then refresh the page.
