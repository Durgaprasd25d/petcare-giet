const Service = require('../models/Service');

// @desc    Create a new service listing
// @route   POST /api/services
// @access  Private (Provider/Vet)
exports.createService = async (req, res) => {
    try {
        const { name, description, category, price, duration, image } = req.body;

        // Ensure user is approved
        if (!req.user.isApproved) {
            return res.status(403).json({ message: 'Account not approved yet. Cannot create services.' });
        }

        const service = await Service.create({
            provider: req.user._id,
            name,
            description,
            category,
            price,
            duration,
            image
        });

        res.status(201).json(service);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all services listed by the logged-in provider
// @route   GET /api/services/provider
// @access  Private (Provider/Vet)
exports.getProviderServices = async (req, res) => {
    try {
        const services = await Service.find({ provider: req.user._id });
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all active services (for Pet Owners to browse)
// @route   GET /api/services
// @access  Private
exports.getAllServices = async (req, res) => {
    try {
        const { category } = req.query;
        let query = {};
        if (category) {
            query.category = category;
        } else {
            // If no category specified, return all EXCEPT Veterinary for the "Other Services" tab
            query.category = { $ne: 'Veterinary' };
        }
        const services = await Service.find(query).populate('provider', 'name email address');
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a service
// @route   PUT /api/services/:id
// @access  Private (Provider/Vet)
exports.updateService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        // Make sure the logged-in user owns this service
        if (service.provider.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to update this service' });
        }

        const updatedService = await Service.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updatedService);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Private (Provider/Vet)
exports.deleteService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        if (service.provider.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to delete this service' });
        }

        await Service.deleteOne({ _id: req.params.id });
        res.json({ message: 'Service removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
