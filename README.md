# Eleos - Jira Acceptance Criteria Generator

## What is it?

A Jira plugin written as [Atlassian Forge app](https://developer.atlassian.com/platform/forge) to generate acceptance criteria for a Jira ticket using a LLM.

## How does it work?

The app attaches to the Jira issue panel and adds a form to fill in the parameters for the acceptance criteria generation. When the form is submitted, the plugin will fetch the Jira issue description and will send it to the selected LLM to request for the acceptance criteria. Once the criteria is generated, the app displays it in the UI for the user to copy-paste it into the issue.

## Requirements

See [Set up Forge](https://developer.atlassian.com/platform/forge/set-up-forge/) for instructions to get set up.

## Quick start

- Build and deploy the app by running:

```
forge deploy
```

- Install the app in an Atlassian site by running:

```
forge install
```

- You will also need to set up the environment variables for Libertai and ChatGPT API keys running:

```
forge variables set --encrypt LIBERTAI_API_KEY <add-libertai-api-key>
forge variables set --encrypt CHATGPT_API_KEY <add-chatgpt-api-key>
```

- Develop the app by running `forge tunnel` to proxy invocations locally. You will need to specify the API keys for Libertai and ChatGPT as environment variables:

```
FORGE_USER_VAR_LIBERTAI_API_KEY=<add-libertai-api-key> FORGE_USER_VAR_CHATGPT_API_KEY=<add-chatgpt-api-key> forge tunnel
```

### Notes

- Use the `forge deploy` command when you want to persist code changes.
- Use the `forge install` command when you want to install the app on a new site.
- Once the app is installed on a site, the site picks up the new app changes you deploy without needing to rerun the install command.
