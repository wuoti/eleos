import api, { route } from "@forge/api"
import ForgeUI, {
  Form,
  Fragment,
  Heading,
  IssuePanel,
  render,
  SectionMessage,
  Text,
  TextField,
  Toggle,
  useProductContext,
  useState,
} from "@forge/ui"
import { fetch } from "@forge/api"

const fetchIssueDescription = async (issueIdOrKey) => {
  const res = await api
    .asUser()
    .requestJira(route`/rest/api/3/issue/${issueIdOrKey}?expand=renderedFields`)

  const data = await res.json()
  return {
    htmlDescription: data.renderedFields.description,
    adfDescription: data.fields.description,
  }
}

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

const fetchAcceptanceCriteriaFromChatGPT = async (
  description,
  { criteriaCount, useMockResponse },
) => {
  const chatGptApiKey = process.env.CHATGPT_API_KEY
  if (!chatGptApiKey?.trim().length) {
    throw new Error("No ChatGPT API key specified")
  }

  const response = useMockResponse
    ? await mockAcceptanceCriteriaResponse
    : await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${chatGptApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `You are an assistant in an issue management, such as Atlassian Jira. Your task is to receive a description for a technical issue as input and create an ${criteriaCount}-step acceptance criteria based on the description in JSON array format where each item is one item of the acceptance criteria. The response should consist of only the JSON array and nothing else.`,
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

  return JSON.parse(response.choices[0].message.content)
}

const validateForm = (formData) => {
  const { criteriaCount } = formData
  const criteriaCountInt = parseInt(criteriaCount)
  const maxCriteriaCount = 10

  const criteriaErrorMessage =
    criteriaCountInt < 0 || criteriaCount > 10
      ? `The number of criteria must be between 1-${maxCriteriaCount}`
      : undefined

  return {
    formData: { ...formData, criteriaCount: criteriaCountInt },
    errors: [criteriaErrorMessage].filter(Boolean),
  }
}

const App = () => {
  const context = useProductContext()
  const [formErrors, setFormErrors] = useState([])
  const [formState, setFormState] = useState(undefined)
  const [acceptanceCriteria, setAcceptanceCriteria] = useState(undefined)

  const onSubmit = async (formData) => {
    setFormErrors([])
    setAcceptanceCriteria(undefined)

    const { formData: validatedFormData, errors } = validateForm(formData)
    setFormState(validatedFormData)
    if (errors.length) {
      setFormErrors(errors)
      return
    }

    const { criteriaCount, useMockResponse } = validatedFormData
    const { htmlDescription, adfDescription } = await fetchIssueDescription(
      context.platformContext.issueKey,
    )

    const criteria = await fetchAcceptanceCriteriaFromChatGPT(htmlDescription, {
      criteriaCount,
      useMockResponse,
    })

    setAcceptanceCriteria(criteria)
  }

  const defaultCriteriaCount = 5

  return (
    <Fragment>
      <Form onSubmit={onSubmit}>
        {formErrors.length > 0 && (
          <SectionMessage appearance="error">
            {formErrors.map((errorMessage, i) => (
              <Text key={i}>{errorMessage}</Text>
            ))}
          </SectionMessage>
        )}
        <TextField
          defaultValue={formState?.criteriaCount ?? defaultCriteriaCount}
          isRequired
          name="criteriaCount"
          label="Number of criteria"
          type="number"
        />
        <Toggle
          defaultChecked={formState?.useMockResponse}
          label="Enable LLM mock response"
          name="useMockResponse"
        />
      </Form>
      {acceptanceCriteria && (
        <Fragment>
          <Heading size="medium">Acceptance criteria</Heading>
          {acceptanceCriteria.map((criterion, i) => (
            <Text key={i}>{criterion}</Text>
          ))}
        </Fragment>
      )}
    </Fragment>
  )
}

export const run = render(
  <IssuePanel>
    <App />
  </IssuePanel>,
)
