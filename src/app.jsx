import ForgeUI, {
  Form,
  Fragment,
  Heading,
  Radio,
  RadioGroup,
  SectionMessage,
  Text,
  TextField,
  useProductContext,
  useState,
} from "@forge/ui"
import { fetchAcceptanceCriteria } from "./llm"
import { fetchIssueDescription } from "./jira-api"

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

    const { criteriaCount, llm } = validatedFormData
    const { htmlDescription } = await fetchIssueDescription(
      context.platformContext.issueKey,
    )
    const criteria = await fetchAcceptanceCriteria({
      description: htmlDescription,
      criteriaCount,
      llm,
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
        <RadioGroup name="llm" label="Select an LLM to use">
          <Radio
            defaultChecked={
              formState?.llm == null || formState?.llm === "chatgpt"
            }
            label="ChatGPT"
            value="chatgpt"
          />
          <Radio
            defaultChecked={formState?.llm === "libertai"}
            label="Libertai"
            value="libertai"
          />
          <Radio
            defaultChecked={formState?.llm === "mock"}
            label="Mock response"
            value="mock"
          />
        </RadioGroup>
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

export default App
