import nodemailer from 'nodemailer';

/**
 * Sends an email using the configured transporter.
 * 
 * @param to - The recipient's email address.
 * @param subject - The subject line of the email.
 * @param html - The HTML content of the email.
 */
export const sendEmail = async (to: string, subject: string, html: string): Promise<void> => {
    try {
        // Configure nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Gmail SMTP
            auth: {
                user: process.env.EMAIL_USER, // Email from .env
                pass: process.env.EMAIL_PASS, // App password from .env
            },
        });

        // Prepare and send the email
        await transporter.sendMail({
            from: `"Wardrobe Wizards" <${process.env.EMAIL_USER}>`, // Sender's name and email
            to,                                                     // Recipient's email
            subject,                                                // Email subject
            html,                                                   // Email content (HTML format)
        });

        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
};

/**
 * Sends a verification email to the user.
 * 
 * @param email - The recipient's email address.
 * @param verificationLink - The link to verify the user's email.
 */
export const sendVerificationEmail = async (email: string, verificationLink: string): Promise<void> => {
    const subject = 'Verify Your Email';
    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2>Welcome to Wardrobe Wizards!</h2>
            <p>We're excited to have you onboard. Please click the button below to verify your email address:</p>
            <a href="${verificationLink}" style="
                display: inline-block;
                padding: 10px 20px;
                margin-top: 10px;
                background-color: #4CAF50;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
            ">Verify Your Email</a>
            <p>If you did not request this, please ignore this email.</p>
            <p>Thanks,<br>The Wardrobe Wizards Team</p>
        </div>
    `;

    await sendEmail(email, subject, html);
};

/**
 * Sends a password recovery email to the user.
 * 
 * @param email - The recipient's email address.
 * @param resetLink - The link to reset the user's password.
 */
export const sendPasswordRecoveryEmail = async (email: string, resetLink: string): Promise<void> => {
    const subject = 'Reset Your Password';
    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2>Password Recovery</h2>
            <p>We received a request to reset your password for your Wardrobe Wizards account.</p>
            <p>Please click the button below to set a new password:</p>
            <a href="${resetLink}" style="
                display: inline-block;
                padding: 10px 20px;
                margin-top: 10px;
                background-color: #4CAF50;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
            ">Reset Password</a>
            <p>If you did not request this, please ignore this email.</p>
            <p>Thanks,<br>The Wardrobe Wizards Team</p>
        </div>
    `;

    await sendEmail(email, subject, html);
};

/**
 * Sends an email recovery notification to the user.
 * 
 * @param email - The recipient's email address.
 * @param username - The user's username.
 */
export const sendEmailRecoveryNotification = async (email: string, username: string): Promise<void> => {
    const subject = 'Email Recovery';
    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2>Email Recovery Request</h2>
            <p>Hello ${username},</p>
            <p>We received a request to recover the email associated with your account. Your email is: <strong>${email}</strong>.</p>
            <p>If you did not request this, please ignore this email.</p>
            <p>Thanks,<br>The Wardrobe Wizards Team</p>
        </div>
    `;

    await sendEmail(email, subject, html);
};
