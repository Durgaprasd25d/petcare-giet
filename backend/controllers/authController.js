const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        let user = await User.findOne({ email });
        
        const otp = generateOTP();
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        if (user) {
            if (user.isVerified) {
                return res.status(400).json({ message: 'User already exists and is verified.' });
            }
            // Update unverified user
            user.name = name;
            user.password = password;
            user.role = role;
            user.otp = otp;
            user.otpExpires = otpExpires;
            await user.save();
        } else {
            user = await User.create({ 
                name, 
                email, 
                password, 
                role, 
                otp, 
                otpExpires,
                isVerified: process.env.DISABLE_OTP === 'true' 
            });
        }

        if (process.env.DISABLE_OTP === 'true') {
            return res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isApproved: user.isApproved,
                token: generateToken(user._id),
                message: 'Account created successfully (OTP bypassed)'
            });
        }

        // Send OTP via Email
        const message = `Your OTP for Payven registration is: ${otp}. It is valid for 10 minutes.`;
        try {
            await sendEmail({
                to: user.email,
                subject: 'Payven - Registration OTP',
                text: message,
            });
            
            res.status(201).json({
                message: 'OTP sent to email. Please verify to complete registration.',
                email: user.email
            });
        } catch (error) {
            // If email fails and it's dev, allow bypass or return error
            console.error('Email Error:', error);
            res.status(500).json({ message: 'Failed to send OTP. Please try again later.' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'User already verified' });
        }

        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Mark as verified
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isApproved: user.isApproved,
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Bypass verification check if OTP is disabled
        if (!user.isVerified && process.env.DISABLE_OTP !== 'true') {
            return res.status(401).json({ message: 'Please verify your email first' });
        }

        if (await user.matchPassword(password)) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isApproved: user.isApproved,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
