# Hachi reading backend

A small Node/Express service that turns a pet's birth details into a personalized
reading: it computes the Bazi chart with **the app's own engine**, then asks an LLM
to write the prose from that already-correct chart.

```bash
cd server
npm install
cp .env.example .env     # add your Ark credentials (optional — see below)
npm start                # http://localhost:8787
npm test                 # 30 tests, no network or API key needed
```

## Why this service exists

An API key bundled into a React Native app can be extracted from the app. If Hachi
is going to call an LLM, the key has to live on a server — that is the whole
architectural reason this directory exists, and it is why the client cannot simply
call Ark directly.

## Design

**The LLM never does Bazi math.** `src/chart.js` imports `computeZipingBazi` from
`../../src/utils/zipingBazi.js` — the exact function the React Native app uses — so
the server and the client can never disagree about a pillar. A test asserts the two
paths produce identical output. The model only receives a finished chart and turns
it into prose.

**It always answers.** If the LLM is unconfigured, times out, errors, or returns
something unparseable, the service falls back to the hand-written pillar libraries
the app already shipped (`src/data/dayPillarLibrary.js`). The response always
reports which path produced it, so a fallback is never passed off as a generated
reading:

```json
{ "source": "fallback", "fallbackReason": "llm-not-configured" }
```

`source` is `"llm"` or `"fallback"`; `fallbackReason` is `llm-not-configured`,
`llm-error`, `llm-unparseable`, or `null`.

## API

### `GET /health`
```json
{ "ok": true, "llmConfigured": true }
```

### `POST /reading`

```json
{ "birthDate": "2021-06-15", "birthTime": "08:30",
  "birthLocation": "Atlanta, USA", "petName": "Mochi", "species": "cat" }
```

Only `birthDate` (`YYYY-MM-DD`) is required. A missing `birthTime` is defaulted and
flagged — the prompt then tells the model to keep claims about the Hour pillar
(the inner self) non-committal, rather than inventing confidence the data doesn't
support. Malformed input returns `400` with the failing step.

Response: `reading` (`summary`, `personality`, `bondingStyle`, `quirks`), `source`,
`fallbackReason`, and the full computed `chart` — pillars, elements, day master,
zodiac, and the engine's own calculation notes.

## Layout

```
src/chart.js      validation + adapter over the app's Bazi engine
src/prompt.js     system prompt and chart -> user prompt
src/llm.js        Ark (Doubao) client: timeout, one retry, typed errors
src/fallback.js   deterministic reading from the shipped pillar libraries
src/reading.js    orchestration, response parsing, fallback decisions
src/app.js        Express app factory (no listen — so tests can mount it)
src/server.js     entrypoint
test/             30 tests; the LLM is injected, so none of them hit the network
```

## Honest scope

In-memory only: no database, no auth, no rate limiting, no caching of readings.
Readings are not persisted. The pillar libraries cover the 60 sexagenary day
pillars; a chart outside that set degrades to a chart-only summary rather than
failing. Node 20.6+ (the server reads the app's ESM modules directly, which Node
auto-detects; a benign `MODULE_TYPELESS_PACKAGE_JSON` warning on startup is
expected and does not affect behaviour).

Readings are entertainment, not veterinary or behavioural advice. The system
prompt forbids medical claims.
