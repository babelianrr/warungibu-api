/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable class-methods-use-this */
import { FRONTEND_BASE_URL, SENDER_EMAIL, TRANSPORTER } from 'src/config';

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
            await TRANSPORTER.sendMail({
                to: user.email,
                from: {
                    name: 'Warung Ibu Support',
                    address: SENDER_EMAIL
                },
                subject: 'Kode Verifikasi pendaftaran',
                text: `Kode verifikasi anda adalah ${user.verification_token}`
            });
        } catch (error) {
            console.error(error);

            if (error.response) {
                console.error(error.response.body);
            }
        }
    }

    async sendPasswordResetEmail(user: IVerifyEmail) {
        try {
            await TRANSPORTER.sendMail({
                to: user.email,
                from: {
                    name: 'Warung Ibu Support',
                    address: SENDER_EMAIL
                },
                subject: 'Link Reset Password',
                text: `Untuk melakukan reset password, klik link berikut sebelum ${user.expiry_at}.\n\n${FRONTEND_BASE_URL}/reset-password/${user.verification_token}`
            });
        } catch (error) {
            console.error(error);

            if (error.response) {
                console.error(error.response.body);
            }
        }
    }

    async sendPinResetEmail(user: IVerifyEmail) {
        try {
            await TRANSPORTER.sendMail({
                to: user.email,
                from: {
                    name: 'Warung Ibu Support',
                    address: SENDER_EMAIL
                },
                subject: 'Link Reset PIN',
                text: `Untuk melakukan reset PIN, klik link berikut sebelum ${user.expiry_at}.\n\n${FRONTEND_BASE_URL}/reset-pin/${user.verification_token}`
            });
        } catch (error) {
            console.error(error);

            if (error.response) {
                console.error(error.response.body);
            }
        }
    }

    async sendCustomerIdUpdatedEmail(data: ICustomerIdUpdatedEmail) {
        try {
            await TRANSPORTER.sendMail({
                to: data.email,
                from: {
                    name: 'Warung Ibu Support',
                    address: SENDER_EMAIL
                },
                subject: 'Customer ID anda telah diperbarui',
                text: `Customer ID anda adalah ${data.customer_id}.`
            });
        } catch (error) {
            console.error(error);

            if (error.response) {
                console.error(error.response.body);
            }
        }
    }
}
