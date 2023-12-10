import ForgeUI, {
  Button,
  Form,
  Fragment,
  Heading,
  IssuePanel,
  Radio,
  RadioGroup,
  SectionMessage,
  Text,
  TextField,
  useProductContext,
  useState,
} from "@forge/ui"
import {
  fetchAcceptanceCriteria,
  fetchAcceptanceCriteriaInPoeticForm,
  fetchAcceptanceCriteriaWithCaptainTone,
  fetchAcceptanceCriteriaWithJuvenileTone,
  fetchAcceptanceCriteriaWithSarcasticTone,
} from "./llm"
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

const normalTone = "normal"
const sarcasticTone = "sarcastic"
const captainTone = "captain"
const juvenileTone = "juvenile"
const poemTone = "poem"
const tones = [normalTone, sarcasticTone, captainTone, juvenileTone, poemTone]

const useAcceptanceCriteria = () => {
  const initialAcceptanceCriteria = tones.reduce(
    (acc, tone) => ({ ...acc, [tone]: [] }),
    {},
  )
  const [acceptanceCriteria, setAcceptanceCriteria] = useState(
    initialAcceptanceCriteria,
  )

  const checkToneIsValid = (tone) => {
    if (!tones.includes(tone)) {
      throw new Error(`Unknown tone ${tone}`)
    }
  }

  const setAcceptanceCriteriaForTone = (tone, acceptanceCriteriaForTone) => {
    checkToneIsValid(tone)

    setAcceptanceCriteria({
      ...acceptanceCriteria,
      [tone]: acceptanceCriteriaForTone,
    })
  }

  const getAcceptanceCriteriaForTone = (tone) => {
    checkToneIsValid(tone)
    return acceptanceCriteria[tone].length
      ? acceptanceCriteria[tone]
      : undefined
  }

  const [tone, setTone] = useState(normalTone)
  const acceptanceCriteriaToShow = getAcceptanceCriteriaForTone(tone)

  return {
    tone,
    setTone: (tone) => {
      checkToneIsValid(tone)
      setTone(tone)
    },
    getAcceptanceCriteriaForTone,
    setAcceptanceCriteriaForTone,
    acceptanceCriteriaToShow,
  }
}

const App = () => {
  const context = useProductContext()
  const [formErrors, setFormErrors] = useState([])
  const [formState, setFormState] = useState(undefined)
  const {
    acceptanceCriteriaToShow,
    getAcceptanceCriteriaForTone,
    setAcceptanceCriteriaForTone,
    setTone,
  } = useAcceptanceCriteria()
  const [issueDescription, setIssueDescription] = useState(undefined)

  const normalToneAcceptanceCriteria = getAcceptanceCriteriaForTone(normalTone)

  const onSubmit = async (formData) => {
    setFormErrors([])
    const { formData: validatedFormData, errors } = validateForm(formData)
    setFormState(validatedFormData)
    if (errors.length) {
      setFormErrors(errors)
      return
    }

    const { criteriaCount, llm } = validatedFormData
    const description = await fetchIssueDescription(
      context.platformContext.issueKey,
    )
    const criteria = await fetchAcceptanceCriteria({
      description,
      criteriaCount,
      llm,
    })

    setIssueDescription(description)
    setAcceptanceCriteriaForTone(normalTone, criteria)
    setTone(normalTone)
  }

  const defaultCriteriaCount = 5

  const toneOnClickHandler = (tone) => async () => {
    try {
      setFormErrors([])
      if (tone !== normalTone && !getAcceptanceCriteriaForTone(tone)) {
        const fetchers = {
          sarcastic: fetchAcceptanceCriteriaWithSarcasticTone,
          captain: fetchAcceptanceCriteriaWithCaptainTone,
          juvenile: fetchAcceptanceCriteriaWithJuvenileTone,
          poem: fetchAcceptanceCriteriaInPoeticForm,
        }

        const { criteriaCount, llm } = formState
        const criteria = await fetchers[tone]({
          description: issueDescription,
          criteriaCount,
          llm,
          acceptanceCriteria: normalToneAcceptanceCriteria,
        })
        setAcceptanceCriteriaForTone(tone, criteria)
      }
      setTone(tone)
    } catch (error) {
      setFormErrors([
        `Generating acceptance criteria failed, message: ${error.message}`,
      ])
    }
  }

  const labels = {
    [normalTone]: "Normal 😐",
    [sarcasticTone]: "Sarcastic! 🤪",
    [captainTone]: "Captain 👩‍✈️",
    [juvenileTone]: "Juvenile 👶",
    [poemTone]: "Poem ✍️",
  }

  return (
    <IssuePanel>
      <Form
        onSubmit={onSubmit}
        submitButtonText="Get acceptance criteria"
        actionButtons={
          normalToneAcceptanceCriteria
            ? Object.entries(labels).map(([tone, label]) => (
                <Button
                  key={tone}
                  text={label}
                  onClick={toneOnClickHandler(tone)}
                />
              ))
            : undefined
        }
      >
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
        </RadioGroup>
      </Form>
      {acceptanceCriteriaToShow && (
        <Fragment>
          <Heading size="medium">Acceptance criteria</Heading>
          {acceptanceCriteriaToShow.map((criterion, i) => (
            <Text key={i}>{criterion}</Text>
          ))}
        </Fragment>
      )}
    </IssuePanel>
  )
}

export default App
