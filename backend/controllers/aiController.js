const Groq = require('groq-sdk');
const User = require('../models/User');
const Pet = require('../models/Pet');
const Booking = require('../models/Booking');
const Service = require('../models/Service');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

exports.analyzeSymptoms = async (req, res) => {
    try {
        const userMessage = req.body.symptoms || req.body.message;

        if (!userMessage) return res.status(400).json({ message: 'Message is required' });

        // Gather Database Context for the logged-in user
        const user = await User.findById(req.user._id).select('name email role isApproved');
        const userPets = await Pet.find({ owner: req.user._id }).select('name species breed age gender');
        const userBookings = await Booking.find({ user: req.user._id }).populate('provider', 'name').select('serviceType date status provider');
        
        // Gather General Platform Stats
        const totalVets = await User.countDocuments({ role: 'Veterinarian', isApproved: true });
        const availableServices = await Service.find({}).select('name category price');

        const dbContext = `
You are the "Payven AI Assistant", an expert, helpful, and concise assistant for the Payven pet care platform.
Answer all questions smoothly and in short.

CURRENT USER CONTEXT:
- Name: ${user.name}
- Role: ${user.role}
- Approved Status: ${user.isApproved ? 'Approved' : 'Pending/Unapproved'}
- Pets: ${JSON.stringify(userPets)}
- Recent Bookings: ${JSON.stringify(userBookings.slice(0, 5))}

PLATFORM CONTEXT:
- Total Approved Veterinarians on platform: ${totalVets}
- Available Services: ${JSON.stringify(availableServices.slice(0, 10))} // Limit to 10 for token size

If the user asks about their pets, bookings, or services, use the context above to give accurate, personalized answers. If they ask about symptoms, act as an expert veterinary triage assistant and give a concise recommendation, emphasizing when to see a vet.
Do not output raw JSON to the user. Speak naturally, concisely, and use emojis.
`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: dbContext },
                { role: "user", content: userMessage }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.5,
            max_tokens: 300,
        });

        const aiResponse = chatCompletion.choices[0]?.message?.content || "I couldn't process that right now.";

        res.json({
            analysis: {
                text: aiResponse
            }
        });
    } catch (error) {
        console.error('Groq Error:', error);
        res.status(500).json({ message: 'AI processing failed' });
    }
};
