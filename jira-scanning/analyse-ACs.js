const axios = require('axios');
const fs = require('fs');

const openaiRequest = require('./openai-req');

const acs = JSON.parse(fs.readFileSync('./all-tickets.json', { encoding: 'utf8', flag: 'r' }))
    .map(ticket => ticket.acceptanceCriteria)
    .filter(ac => ac != '');

const promptTemplateA = 'Give me a rating out of 10 - only the number - for the following software engineering acceptance criteria: "';
const promptTemplateB = '" Respond with only the number';

const analyseACs = async () => {
    var ratings = [];
    var badACs = [];

    for (var i = 0; i < acs.length; i++) {
        try {
            const response = await axios(openaiRequest(promptTemplateA + acs[i] + promptTemplateB));
            const rating = response.data.choices[0].message.content;
            if (!isNaN(rating)) {
                if (rating <= 5) {
                    console.log("=================== Bad rating: " + i + " =======================");
                    console.log(acs[i]);
                    badACs.push(acs[i]);
                }
                ratings.push(rating);
            }
        } catch (er) {
            console.log(er);
        }
    }

    const badRatings = ratings.filter(rating => rating <= 5).length;
    console.log("\n\nCount of badly rated ACs: " + badRatings);
    console.log("Percentage: " + (Math.round(badRatings * 10000 / ratings.length) / 100) + "%");
    var sum = ratings.reduce((a, b) => Number(a) + Number(b), 0);
    console.log("Average rating: " + (sum / ratings.length));

    const json = JSON.stringify(badACs);
    fs.writeFile('bad-acceptance-criteria.json', json, err => {
        if (err) {
            console.error(err);
        }
    });
}

analyseACs();
