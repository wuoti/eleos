const getConfigs = () => [
  {
    id: "chatgpt",
    name: "OpenAI ChatGPT",
    apiKey: process.env.CHATGPT_API_KEY,
    baseUrl: "https://api.openai.com/v1/chat/completions",
    model: "gpt-3.5-turbo",
  },
  {
    id: "libertai",
    name: "Libertai",
    apiKey: process.env.LIBERTAI_API_KEY,
    baseUrl:
      "https://curated.aleph.cloud/vm/a8b6d895cfe757d4bc5db9ba30675b5031fe3189a99a14f13d5210c473220caf/v1/chat/completions",
    model: "openhermes-2.5",
  },
]

const validateConfig = (config) => {
  if (!config) {
    throw new Error("Config cannot be undefined")
  }

  const { apiKey, baseUrl, model, name } = config

  if (!name?.trim().length) {
    throw new Error("Config name is not specified")
  }

  if (!apiKey?.trim().length) {
    throw new Error(`API key for ${name} config is not specified`)
  }

  if (!baseUrl?.trim().length) {
    throw new Error(`Base URL for ${name} config is not specified`)
  }

  if (!model?.trim().length) {
    throw new Error(`Model for ${name} config is not specified`)
  }
}

export const getLLmConfig = (id) => {
  const config = getConfigs().find((config) => config.id === id)

  validateConfig(config)
  return config
}
