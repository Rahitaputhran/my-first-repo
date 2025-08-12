// server.js

// Import required packages
const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs"); // Import the File System module

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();
const port = 3000;

// --- Load the Knowledge Base ---
// Read the JSON file and parse it when the server starts.
const knowledgeBase = JSON.parse(fs.readFileSync(path.join(__dirname, "travel_data.json")));

// Middleware to parse JSON bodies and serve static files
app.use(express.json());
app.use(express.static(path.join(__dirname))); // Serve static files

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Route to serve the main HTML page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// API endpoint to answer questions based on the JSON data
app.post("/api/itinerary", async (req, res) => {
    try {
        const { destination } = req.body.payload; // User input from the form
        const userQuery = destination.toLowerCase(); // Standardize the query

        // --- Retrieval Step ---
        // Find the relevant data from our knowledge base.
        // We search if the user's query matches a destination's name or id.
        const relevantData = knowledgeBase.find(
            (item) => item.name.toLowerCase().includes(userQuery) || item.id.includes(userQuery)
        );

        // If no relevant data is found in our JSON file
        if (!relevantData) {
            return res.json({
                itinerary: `Sorry, I do not have any information about "${destination}" in my database. I only have data on Paris and Tokyo.`,
            });
        }

        // --- Generation Step ---
        // Convert the found data object into a string to use in the prompt
        const context = JSON.stringify(relevantData);

        // --- New Prompt Engineering ---
        // We "ground" the model by providing context and a strict instruction.
        const prompt = `
      You are a helpful travel assistant. Answer the user's question based ONLY on the provided context below.
      If the information to answer the question is not in the context, say "I cannot find that information in my data." Do not use any outside knowledge.

      CONTEXT:
      ${context}

      QUESTION:
      Tell me about the attractions in ${relevantData.name}.
    `;

        // In a real app, the 'QUESTION' part would be more dynamic, 
        // but this demonstrates how to use the context.

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const answer = response.text();

        res.json({ itinerary: answer });
    } catch (error) {
        console.error("Error processing request:", error);
        res.status(500).send("Failed to process request. Please check server logs.");
    }
});

// Start the server
app.listen(port, () => {
    console.log(`✨ AI Q&A Bot server listening at http://localhost:${port}`);
});