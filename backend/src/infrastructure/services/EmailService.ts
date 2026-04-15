import nodemailer from 'nodemailer';

/**
 * Sends a notification email to the portfolio owner when a contact form
 * submission is received.
 *
 * Required environment variables:
 *   MAIL_USER   — Gmail address used as sender (e.g. tucorreo@gmail.com)
 *   MAIL_PASS   — Gmail App Password (16-char, no spaces)
 *   MAIL_TO     — Recipient address (your personal email)
 */
export async function sendContactEmail(params: {
    senderName: string;
    senderEmail: string;
    subject: string;
    content: string;
}): Promise<void> {
    const { senderName, senderEmail, subject, content } = params;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
    });

    await transporter.sendMail({
        from: `"Portafolio Contact" <${process.env.MAIL_USER}>`,
        to: process.env.MAIL_TO,
        replyTo: senderEmail,
        subject: `[Portafolio] ${subject}`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e1e4e8; border-radius: 8px;">
                <h2 style="margin-top:0; color:#1a1a2e;">Nuevo mensaje desde tu portafolio</h2>
                <table style="width:100%; border-collapse:collapse; margin-bottom:16px;">
                    <tr>
                        <td style="padding:6px 12px; font-weight:600; color:#555; width:120px;">Nombre</td>
                        <td style="padding:6px 12px; color:#1a1a2e;">${senderName}</td>
                    </tr>
                    <tr style="background:#f6f8fa;">
                        <td style="padding:6px 12px; font-weight:600; color:#555;">Correo</td>
                        <td style="padding:6px 12px;"><a href="mailto:${senderEmail}" style="color:#6366f1;">${senderEmail}</a></td>
                    </tr>
                    <tr>
                        <td style="padding:6px 12px; font-weight:600; color:#555;">Asunto</td>
                        <td style="padding:6px 12px; color:#1a1a2e;">${subject}</td>
                    </tr>
                </table>
                <div style="background:#f6f8fa; border-left:4px solid #6366f1; padding:16px; border-radius:4px; white-space:pre-wrap; color:#1a1a2e;">
                    ${content.replace(/\n/g, '<br/>')}
                </div>
                <p style="font-size:12px; color:#888; margin-top:16px;">
                    Responde directamente a este correo para contactar a ${senderName}.
                </p>
            </div>
        `,
    });
}
