import axios from 'axios';
import { env } from '../../config/env';
import { security } from '../../config/security';
import { reserveContactEmail } from '../database/prisma/reserveContactEmail';

export type ContactNotificationStatus = 'accepted' | 'failed' | 'disabled';

const RESEND_EMAILS_URL = 'https://api.resend.com/emails';
const SEND_TIMEOUT_MS = 5000;

export async function sendContactEmail(messageId: string): Promise<ContactNotificationStatus> {
    const { RESEND_API_KEY, RESEND_FROM, MAIL_TO } = env;
    if (!RESEND_API_KEY || !RESEND_FROM || !MAIL_TO) {
        if (RESEND_API_KEY || RESEND_FROM || MAIL_TO) {
            console.warn('[EmailService] Resend configuration incomplete', { messageId });
        }
        return 'disabled';
    }

    try {
        if (!await reserveContactEmail(security.contactEmailDailyLimit)) return 'disabled';
    } catch {
        // Keep the saved message available if the notification budget cannot be confirmed.
        console.warn('[EmailService] Notification budget unavailable', { messageId });
        return 'failed';
    }

    const email = {
        from: `Portafolio <${RESEND_FROM}>`,
        to: [MAIL_TO],
        subject: '[Portafolio] Nuevo mensaje',
        text: `Tienes un mensaje nuevo en el portafolio. Léelo en el panel: ${security.dashboardUrl}`,
    };

    const signal = AbortSignal.timeout(SEND_TIMEOUT_MS);
    try {
        const { data } = await axios.post<{ id?: unknown }>(RESEND_EMAILS_URL, email, {
            headers: {
                Authorization: `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
                'User-Agent': 'CrisV2/1.0',
                'Idempotency-Key': `portfolio-contact/${messageId}`,
            },
            maxRedirects: 0,
            maxContentLength: 64 * 1024,
            signal,
        });
        if (typeof data?.id !== 'string' || !data.id) {
            console.warn('[EmailService] Resend response missing an email ID', { messageId });
            return 'failed';
        }
        return 'accepted';
    } catch (error) {
        console.warn('[EmailService] Resend notification failed', {
            messageId,
            status: axios.isAxiosError(error) ? error.response?.status : undefined,
            timedOut: signal.aborted,
        });
        return 'failed';
    }
}
