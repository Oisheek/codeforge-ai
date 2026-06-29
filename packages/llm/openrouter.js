const https = require('https');
const http = require('http');
const { getOpenRouterConfig } = require('@codeforge/shared/config');
const { parseJSON } = require('@codeforge/shared/utils');

/**
 * Create an OpenRouter API client.
 * @param {object} options
 * @param {string} options.apiKey - OpenRouter API key
 * @returns {{chat: function, chatStream: function}}
 */
function createClient(options = {}) {
  const config = getOpenRouterConfig();
  const apiKey = options.apiKey || config.apiKey;

  if (!apiKey) {
    throw new Error('OpenRouter API key is required. Set OPENROUTER_API_KEY in .env or pass it in options.');
  }

  /**
   * Send a chat completion request to OpenRouter.
   * @param {object} params
   * @param {string} params.model - Model ID (e.g. 'qwen/qwen3-coder:free')
   * @param {Array} params.messages - Array of {role, content} messages
   * @param {number} [params.temperature=0.3] - Sampling temperature
   * @param {number} [params.max_tokens=4096] - Maximum tokens to generate
   * @returns {Promise<string>} - The assistant's response text
   */
  async function chat(params) {
    const { model, messages, temperature = 0.3, max_tokens = 4096 } = params;

    const body = JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens,
    });

    const url = new URL('/api/v1/chat/completions', 'https://openrouter.ai');

    return new Promise((resolve, reject) => {
      const req = https.request(
        {
          hostname: url.hostname,
          path: url.pathname,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': config.defaultHeaders['HTTP-Referer'],
            'X-Title': config.defaultHeaders['X-Title'],
            'Content-Length': Buffer.byteLength(body),
          },
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => {
            if (res.statusCode !== 200) {
              reject(new Error(`OpenRouter API error (${res.statusCode}): ${data}`));
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.message?.content || '';
              resolve(content);
            } catch (err) {
              reject(new Error(`Failed to parse OpenRouter response: ${err.message}\nRaw: ${data}`));
            }
          });
        }
      );

      req.on('error', (err) => {
        reject(new Error(`OpenRouter request failed: ${err.message}`));
      });

      req.write(body);
      req.end();
    });
  }

  /**
   * Send a streaming chat completion request to OpenRouter.
   * @param {object} params - Same as chat()
   * @param {function} onChunk - Callback for each chunk of text
   * @returns {Promise<string>} - Full response text
   */
  async function chatStream(params, onChunk) {
    const { model, messages, temperature = 0.3, max_tokens = 4096 } = params;

    const body = JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens,
      stream: true,
    });

    const url = new URL('/api/v1/chat/completions', 'https://openrouter.ai');

    return new Promise((resolve, reject) => {
      const req = https.request(
        {
          hostname: url.hostname,
          path: url.pathname,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': config.defaultHeaders['HTTP-Referer'],
            'X-Title': config.defaultHeaders['X-Title'],
            'Content-Length': Buffer.byteLength(body),
          },
        },
        (res) => {
          let fullText = '';
          let buffer = '';

          res.on('data', (chunk) => {
            buffer += chunk.toString();
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith('data: ')) continue;

              const data = trimmed.slice(6);
              if (data === '[DONE]') {
                resolve(fullText);
                return;
              }

              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta?.content || '';
                if (delta) {
                  fullText += delta;
                  if (onChunk) onChunk(delta);
                }
              } catch {}
            }
          });

          res.on('end', () => {
            resolve(fullText);
          });
        }
      );

      req.on('error', (err) => {
        reject(new Error(`OpenRouter stream request failed: ${err.message}`));
      });

      req.write(body);
      req.end();
    });
  }

  return { chat, chatStream };
}

module.exports = { createClient };