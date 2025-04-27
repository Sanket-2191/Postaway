import nodemailer from 'nodemailer';


import { sendError } from './sendError.js';


export const sendEmail = async (res, to, subject, htmlContent = null) => {
    try {
        // Create transporter using Gmail
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAIL_USER,     // Sender's email address 
                pass: process.env.MAIL_PASS,     // App Password
            },
        });

        // Email options
        const mailOptions = {
            from: process.env.MAIL_USER,
            to,
            subject,
            html: htmlContent,
        };
        console.log(mailOptions);

        // Send email
        const result = await transporter.sendMail(mailOptions);
        console.log('Email sent:', result.response);
    } catch (error) {
        console.error('Error sending email:', error);

        return sendError(res, 500, "Error sending email:" + error.message + "PLEASE MAKE SURE PROPER SENDER MAILID & APP PASSWORD IS USED IN TRANSPORTER...");
    }
};

