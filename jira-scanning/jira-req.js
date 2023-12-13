const dotenv = require('dotenv');

dotenv.config();

const jiraBasicAuth = `${process.env.JIRA_BASIC_AUTH}`;

const jiraURL = 'https://aviosgroup.atlassian.net/rest/api/2/search';

module.exports = (startAt) => {
    return {
        method: 'GET',
        url: jiraURL,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + jiraBasicAuth
        },
        params: {
            'fields': 'description,customfield_11055,summary',
            'expand': 'renderedFields',
            'maxResults': 100,
            'startAt': startAt,
            'jql': 'project="RPS" AND statusCategory!=Done'
        }
    }
};
