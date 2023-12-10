import api, { route } from "@forge/api"

export const fetchIssueDescription = async (issueIdOrKey) => {
  const res = await api
    .asUser()
    .requestJira(
      route`/rest/api/3/issue/${issueIdOrKey}?fields=description&expand=renderedFields`,
    )

  const data = await res.json()

  return data.renderedFields.description
}
