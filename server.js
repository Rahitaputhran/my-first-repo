import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/api/itinerary", async (req, res) => {
    const { destination, numDays, numPeople } = req.body;

    const prompt = `Create a brief travel itinerary for a group of ${numPeople} people visiting ${destination} for ${numDays} days.
Requirements:
- Maximum 3 activities per day
- Each activity description should be 3-4 words maximum
- Format as simple text with each line as: Day number | Time | Activity
- Times should be in format like "9 AM" or "2 PM"
- Do not include any special characters or formatting
Example format:
Day 1 | 9 AM | Visit Central Park
Day 1 | 2 PM | Shopping at Mall
Day 2 | 10 AM | Beach Swimming`;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        res.json({ content: text });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to generate itinerary" });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});