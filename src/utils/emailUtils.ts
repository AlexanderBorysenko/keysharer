import nodemailer, {
	type TransportOptions,
	type SendMailOptions,
} from "nodemailer";

// Define the email options type
export interface EmailOptions {
	to: string;
	subject: string;
	text?: string;
	html?: string;
}

// Create a transporter using SMTP or another service
const transporter = nodemailer.createTransport({
	host: "smtp.gmail.com", // Use the SMTP server of your choice
	port: 587, // Common SMTP port
	secure: false, // Set to true if using port 465
	auth: {
		user: process.env.EMAIL_USER, // Email address
		pass: process.env.EMAIL_PASSWORD, // App password or real password
	},
} as TransportOptions);

// Define the sendEmail function
export async function sendEmail(options: EmailOptions): Promise<void> {
	try {
		// Merge default and provided email options
		const mailOptions: SendMailOptions = {
			from: process.env.EMAIL_USER, // Default sender
			to: options.to,
			subject: options.subject,
			text: options.text,
			html: options.html,
		};

		// Send email
		const info = await transporter.sendMail(mailOptions);
		console.log("Email sent:", info.messageId);
	} catch (error) {
		console.error("Error sending email:", error);
		throw error; // Rethrow the error for handling by the caller
	}
}
