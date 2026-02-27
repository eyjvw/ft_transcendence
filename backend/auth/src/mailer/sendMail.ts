import { BrevoClient } from "@getbrevo/brevo";

const client: BrevoClient = new BrevoClient({ apiKey: Bun.env.BREVO_API_KEY! });

export async function sendEmail(mail: string)
{
	try
	{
		await client.transactionalEmails.sendTransacEmail({
			subject: "Welcome to ft_gambling",
			textContent: "Welcome",
			sender: {
				name: "ft_gambling",
				email: "ft.gambling@gmail.com"
			},
			to: [{ email: mail }]
		});
	}
	catch (err: unknown)
	{
		console.error("Error during sending mail :", err);
	}
}