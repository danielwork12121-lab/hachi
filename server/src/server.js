import { createApp } from './app.js';
import { createArkClient, readConfig, isConfigured } from './llm.js';

const config = readConfig();
const configured = isConfigured(config);

if (!configured) {
  console.warn(
    '[hachi-server] DOUBAO_API_KEY / DOUBAO_MODEL_ID not set — serving deterministic ' +
    'library readings only. Copy .env.example to .env to enable LLM readings.'
  );
}

const app = createApp({ generate: configured ? createArkClient(config) : null });
const port = Number(process.env.PORT || 8787);

app.listen(port, () => {
  console.log(`[hachi-server] listening on :${port} (llm ${configured ? 'enabled' : 'disabled'})`);
});
