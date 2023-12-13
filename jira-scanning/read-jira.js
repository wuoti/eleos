const axios = require('axios');
const fs = require('fs');

const jiraRequest = require('./jira-req');

const readJiraTickets = async () => {

    var results = [];
    for (var i = 0; i < 15; i++) {
        const response = await axios(jiraRequest(i * 100));
        const newResults = response.data.issues.map((issue) => {
            return {
                'summary': issue.fields.summary,
                'description': issue.renderedFields.description,
                'acceptanceCriteria': issue.renderedFields.customfield_11055,
                'ticketNo': issue.key
            }
        });
        results.push.apply(results, newResults);
    }
    console.log("Total tickets: " + results.length);
    const described = results.filter((ticket) => ticket.description != "").length;
    const describedPercent = Math.round(described * 10000 / results.length) / 100;
    console.log("Total with descriptions: " + described + ", " + describedPercent + "%");

    const criteriaCount = results.filter((ticket) => ticket.acceptanceCriteria != "").length;
    const criteriaPercent = Math.round(criteriaCount * 10000 / results.length) / 100;
    console.log("Total with acceptance criteria: " + criteriaCount + ", " + criteriaPercent + "%");

    const describedCriteria = results.filter((ticket) => ticket.description != "" && ticket.acceptanceCriteria == "")
        .filter((ticket) => ticket.description.includes("AC") || ticket.description.toLowerCase().includes("acceptance criteria")).length;
    const dcPercent = Math.round(describedCriteria * 10000 / results.length) / 100;
    console.log("Total acceptance criteria in description: " + describedCriteria + ", " + dcPercent + "%");
    
    const compoundPercent = Math.round((criteriaCount + describedCriteria) * 10000 / results.length) / 100;
    console.log("Compound % of ACs: " + compoundPercent + "%");

    const json = JSON.stringify(results);
    fs.writeFile('all-tickets.json', json, err => {
        if (err) {
            console.error(err);
        }
    });

};

readJiraTickets();
