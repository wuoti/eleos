import { fetch } from "@forge/api"
import { getLLmConfig } from "./config"

const mockAcceptanceCriteriaResponse = Promise.resolve({
  id: "chatcmpl-8QJ5tEuz6z0uBmtZNs0578QjSiXNU",
  object: "chat.completion",
  created: 1701280617,
  model: "gpt-3.5-turbo-0613",
  choices: [
    {
      index: 0,
      message: {
        role: "assistant",
        content: JSON.stringify([
          "As a reward platform customer, I should receive an email with all booking information",
          "The email should be sent after receiving a confirm…reward platform that my order has been successful",
          "Only flight booking confirmation emails should be sent for now",
          "The email should include all flight booking details",
          "The email should be sent using the email service's…=Emails%20Service#/emails/PostEmailsConfirmations",
        ]),
      },
      finish_reason: "stop",
    },
  ],
  usage: {
    prompt_tokens: 458,
    completion_tokens: 195,
    total_tokens: 653,
  },
})

const getPrompt = (criteriaCount) =>
  `You are an assistant in an issue management, such as Atlassian Jira. Your task is to receive a description for a technical issue as input and create an ${criteriaCount}-step acceptance criteria based on the description in JSON array format where each item is one item of the acceptance criteria in plain text. The response should consist of only the JSON array and nothing else.`

const fetchAcceptanceCriteriaFromLLM = ({
  description,
  criteriaCount,
  llm,
}) => {
  const config = getLLmConfig(llm)
  const { apiKey, baseUrl, model } = config

  return fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: getPrompt(criteriaCount),
        },
        {
          role: "user",
          content: description,
        },
      ],
      temperature: 1,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    }),
  }).then((response) => response.json())
}

export const fetchAcceptanceCriteria = async (params) => {
  const { llm } = params
  const useMockResponse = llm === "mock"
  const response = useMockResponse
    ? await mockAcceptanceCriteriaResponse
    : await fetchAcceptanceCriteriaFromLLM(params)

  return JSON.parse(response.choices[0].message.content)
}
