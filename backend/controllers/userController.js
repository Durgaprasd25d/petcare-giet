const User = require('../models/User');
const Booking = require('../models/Booking');
const Pet = require('../models/Pet');
const Service = require('../models/Service');

// Get admin dashboard stats (Admin only)
exports.getAdminStats = async (req, res) => {
    try {
        const [totalUsers, totalPets, totalBookings, completedBookings, pendingApprovals, allUsers] = await Promise.all([
            User.countDocuments({}),
            Pet.countDocuments({}),
            Booking.countDocuments({}),
            Booking.find({ status: 'Completed' }).select('amount'),
            User.countDocuments({ isApproved: false, role: { $in: ['Veterinarian', 'Service Provider'] } }),
            User.find({}).select('-password').sort({ createdAt: -1 }).limit(10),
        ]);

        const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.amount || 0), 0);

        // Count by role
        const roleCounts = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);

        res.json({
            totalUsers,
            totalPets,
            totalBookings,
            totalRevenue,
            pendingApprovals,
            recentUsers: allUsers,
            roleCounts,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all users (Admin only)
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Toggle user suspension (Admin only)
exports.toggleSuspension = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            if (user.role === 'Admin') {
                return res.status(403).json({ message: 'Cannot suspend an admin account' });
            }
            user.isSuspended = !user.isSuspended;
            await user.save();
            res.json({ message: `User ${user.isSuspended ? 'suspended' : 'unsuspended'} successfully`, user });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all services for admin (Admin only)
exports.getAdminServices = async (req, res) => {
    try {
        const services = await Service.find({})
            .populate('provider', 'name email role')
            .sort({ createdAt: -1 });
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get pending approval users (Admin only)
exports.getPendingApprovals = async (req, res) => {
    try {
        const users = await User.find({ 
            isApproved: false, 
            role: { $in: ['Veterinarian', 'Service Provider'] } 
        }).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Approve user (Admin only)
exports.approveUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.isApproved = true;
            await user.save();
            res.json({ message: 'User approved successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Reject user (Admin only)
exports.rejectUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await User.deleteOne({ _id: req.params.id });
            res.json({ message: 'User rejected and removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.name = req.body.name || user.name;
            if (req.body.image) {
                user.image = req.body.image;
            }
            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                image: updatedUser.image,
                isApproved: updatedUser.isApproved,
                token: req.headers.authorization.split(' ')[1]
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
