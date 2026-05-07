const Consultation = require('../models/Consultation');
const Message = require('../models/Message');

exports.getConsultations = async (req, res) => {
    try {
        const isVet = req.user.role === 'Veterinarian';
        const query = isVet ? { vet: req.user._id } : { petOwner: req.user._id };
        
        const consultations = await Consultation.find(query)
            .populate('petOwner', 'name image')
            .populate('vet', 'name image')
            .sort({ lastMessageAt: -1 });
            
        res.json(consultations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createConsultation = async (req, res) => {
    try {
        const { vetId } = req.body;
        
        let consultation = await Consultation.findOne({
            petOwner: req.user._id,
            vet: vetId,
            status: 'Active'
        });

        if (!consultation) {
            consultation = await Consultation.create({
                petOwner: req.user._id,
                vet: vetId
            });
        }

        const populatedConsultation = await Consultation.findById(consultation._id)
            .populate('petOwner', 'name image')
            .populate('vet', 'name image');

        res.status(201).json(populatedConsultation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const messages = await Message.find({ consultation: req.params.consultationId })
            .populate('sender', 'name image')
            .sort({ createdAt: 1 });
            
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
