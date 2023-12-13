const dotenv = require('dotenv');

dotenv.config();

const openaiApiKey = `${process.env.OPENAI_API_KEY}`;

const openaiUrl = 'https://api.openai.com/v1/chat/completions';

module.exports = (prompt) => {
    return {
        method: 'POST',
        url: openaiUrl,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + openaiApiKey
        },
        data: {
            'model': 'gpt-3.5-turbo',
            'messages': [
                {
                    'role': 'user',
                    'content': prompt
                }
            ],
            'temperature': 0.7
        }
    };
}
