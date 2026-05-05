const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text, html }) => {
    try {
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: `"PetCare Admin" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

module.exports = sendEmail;
