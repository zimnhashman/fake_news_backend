// Import required modules
import express from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import OpenAI from 'openai';

// Create an Express app
const app = express();
const port = 3000;

// Middleware setup
app.use(bodyParser.json());
app.use(compression());
app.disable('x-powered-by');

// OpenAI setup
const openai = new OpenAI({ apiKey: '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' });

// Endpoint for generating responses
app.post('/generate', async (req, res) => {
  try {
    const prompt = req.body.prompt;

    // Perform GPT-3 completion
    const completion = await openai.chat.completions.create({
      messages: [
        { "role": "system", "content": "You are a helpful assistant." },
        { "role": "user", "content": prompt },
      ],
      model: "gpt-4-turbo-preview",
    });

    const assistantResponse = completion.choices[0].message.content;

    // Send the response back to the client
    res.status(200).json({ message: assistantResponse });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
