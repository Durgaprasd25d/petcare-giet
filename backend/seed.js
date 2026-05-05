require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/petcare';

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: String,
    isVerified: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const accounts = [
    { name: 'Pet Owner',        email: 'owner@petcare.com',    password: 'Owner@123',    role: 'Pet Owner',        isApproved: true },
    { name: 'Dr. Vet',          email: 'vet@petcare.com',      password: 'Vet@123',      role: 'Veterinarian',     isApproved: true },
    { name: 'Service Provider', email: 'provider@petcare.com', password: 'Provider@123', role: 'Service Provider', isApproved: true },
    { name: 'Admin',            email: 'admin@petcare.com',    password: 'Admin@123',    role: 'Admin',            isApproved: true },
];

async function seed() {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');

    for (const acc of accounts) {
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(acc.password, salt);
        await User.findOneAndUpdate(
            { email: acc.email },
            { ...acc, password: hashed, isVerified: true, isApproved: true },
            { upsert: true, new: true }
        );
        console.log(`✓ Created/Updated: [${acc.role}] ${acc.email}`);
    }

    console.log('\n--- SEEDED ACCOUNTS ---');
    console.log('Role             | Email                    | Password');
    console.log('-----------------|--------------------------|-------------');
    accounts.forEach(a => {
        console.log(`${a.role.padEnd(16)} | ${a.email.padEnd(24)} | ${a.password}`);
    });

    await mongoose.disconnect();
    console.log('\nDone!');
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
