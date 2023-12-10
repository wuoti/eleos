import { fetch } from "@forge/api"
import { getLLmConfig } from "./config"

const getPrompt = (criteriaCount) =>
  `You are an assistant in an issue management, such as Atlassian Jira. Your task is to receive a description for a technical issue as input and create an ${criteriaCount}-step acceptance criteria based on the description in JSON array format where each item is one item of the acceptance criteria in plain text. The response should consist of only the JSON array and nothing else.`

const fetchAcceptanceCriteriaFromLLM = async ({
  description,
  criteriaCount,
  llm,
  extraMessages,
}) => {
  const config = getLLmConfig(llm)
  const { apiKey, baseUrl, model } = config

  const response = await fetch(baseUrl, {
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
        ...(extraMessages ? extraMessages : []),
      ],
      temperature: 1,
      max_tokens: 3500,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    }),
  })

  const text = await response.text()
  console.log("text", text)

  return response.json()
}

const safeParse = (text) => {
  try {
    return JSON.parse(text)
  } catch (error) {
    return [text]
  }
}

export const fetchAcceptanceCriteria = async (params) => {
  const response = await fetchAcceptanceCriteriaFromLLM(params)
  return safeParse(response.choices[0].message.content)
}

export const fetchAcceptanceCriteriaWithSarcasticTone = async (params) => {
  const { acceptanceCriteria } = params
  const response = await fetchAcceptanceCriteriaFromLLM({
    ...params,
    extraMessages: [
      { role: "system", content: JSON.stringify(acceptanceCriteria) },
      {
        role: "user",
        content:
          "Make it more sarcastic, and return the response in the valid JSON string array format as earlier",
      },
    ],
  })

  return safeParse(response.choices[0].message.content)
}

export const fetchAcceptanceCriteriaWithCaptainTone = async (params) => {
  const { acceptanceCriteria } = params
  const response = await fetchAcceptanceCriteriaFromLLM({
    ...params,
    extraMessages: [
      { role: "system", content: JSON.stringify(acceptanceCriteria) },
      {
        role: "user",
        content:
          "Make the acceptance criteria sound like a flight announcement. Include a weather report in the response. Return the response in the valid JSON string array format as earlier. The response should consist of only the JSON array and nothing else.",
      },
    ],
  })

  return safeParse(response.choices[0].message.content)
}

export const fetchAcceptanceCriteriaWithJuvenileTone = async (params) => {
  const { acceptanceCriteria } = params
  const response = await fetchAcceptanceCriteriaFromLLM({
    ...params,
    extraMessages: [
      { role: "system", content: JSON.stringify(acceptanceCriteria) },
      {
        role: "user",
        content:
          "Make it sound like it was written by an angsty teenager who couldn't care less. Return the response in the valid JSON string array format as earlier. The response should consist of only the JSON array and nothing else.",
      },
    ],
  })

  return safeParse(response.choices[0].message.content)
}

export const fetchAcceptanceCriteriaInPoeticForm = async (params) => {
  const { acceptanceCriteria } = params
  const response = await fetchAcceptanceCriteriaFromLLM({
    ...params,
    extraMessages: [
      { role: "system", content: JSON.stringify(acceptanceCriteria) },
      {
        role: "user",
        content:
          "Make it into a haiku poem. Return the as JSON string array format as earlier. The response should consist of only the JSON array with string elements and nothing else.",
      },
    ],
  })

  return safeParse(response.choices[0].message.content)
}
