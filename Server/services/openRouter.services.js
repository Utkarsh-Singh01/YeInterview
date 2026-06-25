import axios from "axios";

const DEFAULT_FREE_MODELS = [
  "openrouter/free",
  "qwen/qwen3-next-80b-a3b-instruct:free",
  "openai/gpt-oss-20b:free",
  "google/gemma-4-26b-a4b-it:free",
  "meta-llama/llama-3.3-70b-instruct:free",
];

const getModelList = () => {
  if (process.env.OPENROUTER_MODELS) {
    const envModels = process.env.OPENROUTER_MODELS.split(",")
      .map((model) => model.trim())
      .filter(Boolean);

    if (envModels.length) return envModels;
  }

  return DEFAULT_FREE_MODELS;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getErrorMessage = (error) => {
  const data = error.response?.data;

  if (typeof data === "string") return data;

  return (
    data?.error?.message ||
    data?.message ||
    error.message ||
    "Unknown OpenRouter error"
  );
};

const normalizeContent = (content) => {
  if (typeof content === "string") return content;

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        return part?.text || "";
      })
      .join("");
  }

  return "";
};

export const askAi = async (messages, maxTokens = 1000, options = {}) => {
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    throw new Error("Messages array is empty or not provided");
  }

  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not set in environment variables");
  }

  const models = getModelList();
  let lastError = null;

  for (const model of models) {
    try {
      console.log(`Trying model: ${model}`);

      const body = {
        model,
        messages,
        max_tokens: maxTokens,
        temperature: options.temperature ?? 0.3,
      };

      if (options.json === true) {
        body.response_format = { type: "json_object" };
      }

      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        body,
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.CLIENT_URL || "http://localhost:5173",
            "X-Title": "YeInterview",
          },
          timeout: options.timeout || 60000,
        }
      );

      const choice = response?.data?.choices?.[0];
      const content = normalizeContent(choice?.message?.content);

      if (!content || !content.trim()) {
        lastError = new Error(`Empty content from ${model}`);
        continue;
      }

      console.log(`Success with model: ${model}`);
      return content.trim();
    } catch (error) {
      const status = error.response?.status;
      const errMsg = getErrorMessage(error);

      console.error(
        `Model ${model} failed — Status: ${status || "N/A"}, Error: ${errMsg}`
      );

      if (status === 401) {
        throw new Error("Invalid or missing OpenRouter API key");
      }

      if (status === 402) {
        throw new Error("OpenRouter credits/payment required");
      }

      if (status === 429) {
        lastError = new Error("OpenRouter rate limit reached");
        await sleep(1000);
        continue;
      }

      if (error.code === "ECONNABORTED") {
        lastError = new Error("OpenRouter request timed out");
        continue;
      }

      if (error.code === "ENOTFOUND") {
        throw new Error("Network error. Could not reach OpenRouter.");
      }

      lastError = new Error(errMsg);
      continue;
    }
  }

  throw new Error(
    `All AI models unavailable. Last error: ${
      lastError?.message || "unknown error"
    }`
  );
};