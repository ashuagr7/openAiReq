require('dotenv').config();
const OPENAI_API_ENDPOINT = process.env.OPENAI_API_ENDPOINT;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const express = require('express');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const app = express();
const PORT = process.env.port || 5000;
app.use(cors());




// Middleware to parse JSON requests
app.use(express.json());

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 3, // limit each IP to 20 requests per windowMs
    message: 'Too many requests, please try again later.'
});
app.use(limiter);

app.post('/ask', async (req, res) => {
    try {
        const { prompt,model, max_tokens, temperature, top_p, n, stop, frequency_penalty, presence_penalty } = req.body;

        const response = await axios.post(OPENAI_API_ENDPOINT, {
            model,
            messages: [{role: 'system', content: 'You are a helpful assistant.'}, {role: 'user', content: prompt}],
            max_tokens,
            temperature,
            top_p,
            n,
            stop,
            frequency_penalty,
            presence_penalty
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        res.json(response.data);
    } catch (error) {
        if (error.response) {
            // The request was made and the server responded with a status code outside of the range of 2xx
            res.status(error.response.status).json(error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            res.status(500).json({ error: 'No response received from OpenAI API.' });
        } else {
            // Something happened in setting up the request that triggered an Error
            res.status(500).json({ error: 'Failed to send request to OpenAI API.' });
        }
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
