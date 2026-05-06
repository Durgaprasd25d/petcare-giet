const User = require('../models/User');

const seedAdmin = async () => {
    try {
        const adminExists = await User.findOne({ role: 'Admin' });

        if (!adminExists) {
            console.log('🛡️ No Admin found. Seeding default admin...');
            
            await User.create({
                name: 'System Admin',
                email: 'admin@gmail.com',
                password: '000000',
                role: 'Admin',
                isVerified: true,
                isApproved: true
            });

            console.log('✅ Default Admin created: admin@gmail.com / 000000');
        } else {
            console.log('🛡️ Admin already exists. Skipping seed.');
        }
    } catch (error) {
        console.error('❌ Admin Seeding Error:', error.message);
    }
};

module.exports = seedAdmin;
