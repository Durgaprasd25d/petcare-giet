require('dotenv').config();
const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
async function main() {
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: "Test" }],
            model: "llama-3.1-8b-instant", 
            temperature: 0.5,
            max_tokens: 300,
        });
        console.log("SUCCESS:", chatCompletion.choices[0]?.message?.content);
    } catch(e) {
        console.error("FAIL:", e);
    }
}
main();
