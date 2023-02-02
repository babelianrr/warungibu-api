/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable class-methods-use-this */
import SendGridMail from '@sendgrid/mail';
import { SENDGRID_API_KEY, FRONTEND_BASE_URL, SENDER_EMAIL } from 'src/config';

interface IVerifyEmail {
    email: string;
    verification_token: string;
    expiry_at?: string;
}

interface ICustomerIdUpdatedEmail {
    email: string;
    customer_id: string;
}

export class SendGrid {
    async sendMail(user: IVerifyEmail) {
        try {
            SendGridMail.setApiKey(SENDGRID_API_KEY);

            const message = {
                to: user.email,
                from: SENDER_EMAIL, // Use the email address or domain you verified above
                subject: 'Kode Verifikasi pendaftaran',
                text: `Kode verifikasi anda adalah ${user.verification_token}`
                // html: '<strong>and easy to do anywhere, even with Node.js</strong>',
            };

            await SendGridMail.send(message);
        } catch (error) {
            console.error(error);

            if (error.response) {
                console.error(error.response.body);
            }
        }
    }

    async sendPasswordResetEmail(user: IVerifyEmail) {
        try {
            SendGridMail.setApiKey(SENDGRID_API_KEY);

            const message = {
                to: user.email,
                from: SENDER_EMAIL, // Use the email address or domain you verified above
                subject: 'Reset Password Link',
                text: `Untuk melakukan reset password, klik link berikut sebelum ${user.expiry_at}.\n\n${FRONTEND_BASE_URL}/reset-password/${user.verification_token}`
                // html: '<strong>and easy to do anywhere, even with Node.js</strong>'
            };

            await SendGridMail.send(message);
        } catch (error) {
            console.error(error);

            if (error.response) {
                console.error(error.response.body);
            }
        }
    }

    async sendCustomerIdUpdatedEmail(data: ICustomerIdUpdatedEmail) {
        try {
            SendGridMail.setApiKey(SENDGRID_API_KEY);

            const message = {
                to: data.email,
                from: SENDER_EMAIL, // Use the email address or domain you verified above
                subject: 'Customer ID anda telah diperbarui',
                text: `Customer ID anda adalah ${data.customer_id}.`
                // html: '<strong>and easy to do anywhere, even with Node.js</strong>'
            };

            await SendGridMail.send(message);
        } catch (error) {
            console.error(error);

            if (error.response) {
                console.error(error.response.body);
            }
        }
    }
}
