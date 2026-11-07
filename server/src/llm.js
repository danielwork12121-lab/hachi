/**
 * Volcengine Ark (Doubao) chat client.
 *
 * Deliberately small: one call, a hard timeout, and exactly one retry on
 * transient failures. Everything it can throw is typed so the caller can decide
 * between "fall back to the deterministic reading" and "this is a bug".
 */

export class LLMError extends Error {
  constructor(message, { retryable = false, status = null } = {}) {
    super(message);
    this.name = 'LLMError';
    this.retryable = retryable;
    this.status = status;
  }
}

export class LLMNotConfigured extends LLMError {
  constructor() {
    super('LLM is not configured (DOUBAO_API_KEY / DOUBAO_MODEL_ID missing).');
    this.name = 'LLMNotConfigured';
  }
}

const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);

export function readConfig(env = process.env) {
  return {
    apiKey: env.DOUBAO_API_KEY || '',
    modelId: env.DOUBAO_MODEL_ID || '',
    baseUrl: (env.DOUBAO_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3').replace(/\/+$/, ''),
    timeoutMs: Number(env.LLM_TIMEOUT_MS || 20000),
  };
}

export function isConfigured(config) {
  return Boolean(config.apiKey && config.modelId);
}

/**
 * Create a `generate(systemPrompt, userPrompt) -> string` function.
 * Injected into the reading service so tests never touch the network.
 */
export function createArkClient(config = readConfig(), fetchImpl = globalThis.fetch) {
  return async function generate(systemPrompt, userPrompt) {
    if (!isConfigured(config)) throw new LLMNotConfigured();

    const attempt = async () => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), config.timeoutMs);
      try {
        const res = await fetchImpl(`${config.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.apiKey}`,
          },
          body: JSON.stringify({
            model: config.modelId,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.8,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new LLMError(`Ark responded ${res.status}`, {
            retryable: RETRYABLE_STATUS.has(res.status),
            status: res.status,
          });
        }
        const body = await res.json();
        const text = body?.choices?.[0]?.message?.content;
        if (typeof text !== 'string' || !text.trim()) {
          throw new LLMError('Ark returned an empty completion.', { retryable: true });
        }
        return text;
      } catch (err) {
        if (err?.name === 'AbortError') {
          throw new LLMError(`Ark timed out after ${config.timeoutMs}ms`, { retryable: true });
        }
        throw err;
      } finally {
        clearTimeout(timer);
      }
    };

    try {
      return await attempt();
    } catch (err) {
      if (err instanceof LLMError && err.retryable) return await attempt();
      throw err;
    }
  };
}
