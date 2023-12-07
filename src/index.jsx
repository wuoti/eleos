import ForgeUI, { IssuePanel, render } from "@forge/ui"
import App from "./app"

export const run = render(
  <IssuePanel>
    <App />
  </IssuePanel>,
)
