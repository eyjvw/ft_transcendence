import { createTransport, type Transporter } from "nodemailer";

import type SMTPPool from "nodemailer/lib/smtp-pool";

export const transporter: Transporter<SMTPPool.SentMessageInfo, SMTPPool.Options> = createTransport({
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
});