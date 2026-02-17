import { createTransport } from "nodemailer";

export const transporter = createTransport({
	host: "",
	port: 587,
	secure: false,
	pool: true,
	maxConnections: 10,
	maxMessages: 1000,
	auth: {
		user: Bun.env.MAIL_USER,
		pass: Bun.env.MAIL_PASS
	}
})