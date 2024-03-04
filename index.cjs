import express from 'express';
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const axios = require('axios');

const app = express();
const port = 3000;

const generativeApiKey = 'AIzaSyDV3o1suBgH6S23E3sKqnkPXDcxdy1fR7A';
const genAI = new GoogleGenerativeAI(generativeApiKey);
const serperApiKey = 'ae2a2bbf5de3b6c1bd2f9832f289d911b4a6d261';

// Middleware to log incoming requests
app.use(morgan('dev'));

app.use(cors()); // Enable CORS
app.use(compression()); // Enable Compression
app.use(express.json());

// Middleware to log outgoing responses
app.use((req, res, next) => {
  const originalSend = res.send;

  res.send = function (body) {
    console.log(`Outgoing Response for ${req.method} ${req.url}:`, body);
    originalSend.apply(res, arguments);
  };

  next();
});



app.post('/generate-text', async (req, res) => {
  try {
    const { prompt } = req.body;

    // Make a request to the Serper API
    const serperApiUrl = 'https://google.serper.dev/news';
    const serperData = { q: prompt, num: 20 }; // You can adjust the parameters as needed

    const serperResponse = await axios.post(serperApiUrl, serperData, {
      headers: { 'X-API-KEY': serperApiKey, 'Content-Type': 'application/json' },
    });

    const serperResults = serperResponse.data;

    // Ensure that the Serper API response is a JSON object
    if (typeof serperResults === 'object') {
      // For text-only input, use the gemini-pro model
      const model = genAI.getGenerativeModel({ model: 'gemini-1.0-pro' });

      // Append the necessary string for the Google Generative model
      const promptForGenerativeModel = JSON.stringify({ ...serperResults, prompt: `Based on the JSON Data provided above is it true or false` });

      const result = await model.generateContent(promptForGenerativeModel);
      const response = await result.response;
      const generatedText = response.text();


      res.json({ generatedText });
    } else {
      res.status(500).json({ error: 'Serper API did not return a valid JSON object.' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is now running on http://localhost:${port}`);

});
