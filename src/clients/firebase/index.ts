import admin from 'firebase-admin';

import { ErrorObject } from 'src/libs/error-object';
import { ErrorCodes } from 'src/libs/errors';
import { ERoleStatus } from 'src/models/Users';

export class FirebaseAdmin {
    admin: typeof admin;
    db: admin.firestore.Firestore;

    constructor(certFile: object | admin.ServiceAccount) {
        this.admin = admin;
        this.admin.initializeApp({
            credential: admin.credential.cert(certFile)
        });
        this.db = this.admin.firestore();
    }

    async setEmptyRoom(userId: string) {
        const roomDoc = this.db.collection('rooms').doc(userId);
        await roomDoc.set({
            chats: [],
            user_id: userId
        });
    }

    async sendChatForAdmin(userId: string, adminId: string, text: string) {
        const roomDoc = this.db.collection('rooms').doc(userId);
        const doc = await roomDoc.get();
        const data = doc.data();

        if (data) {
            data.chats = [
                ...data.chats,
                {
                    created: new Date(),
                    read_receiver: false,
                    sender_id: adminId,
                    sender_role_status: ERoleStatus.ADMIN,
                    text: text
                }
            ];
            await roomDoc.set(data);
            return data;
        } else {
            await roomDoc.set({
                chats: [
                    {
                        created: new Date(),
                        read_receiver: false,
                        sender_id: adminId,
                        sender_role_status: ERoleStatus.ADMIN,
                        text: text
                    }
                ],
                user_id: userId
            });
        }
    }

    async setNotification(userId: string, text: string) {
        const notificationDoc = this.db.collection('notifications').doc(userId);
        const doc = await notificationDoc.get();
        let data = doc.data();
        if (data && data.unread_admin && data.unread_admin.length) {
            data.unread_admin = [
                ...data.unread_admin,
                {
                    created: new Date(),
                    text
                }
            ];
        } else {
            data = {
                unread_admin: [
                    {
                        created: new Date(),
                        text
                    }
                ]
            };
        }

        data.last_message = new Date();
        return await notificationDoc.set(data);
    }

    async deleteNotification(userId: string) {
        const notificationDoc = this.db.collection('notifications').doc(userId);
        const doc = await notificationDoc.get();
        let data = doc.data();
        if (data) {
            data.unread_admin = [];
            return await notificationDoc.set(data);
        }
    }

    async sendChat(userId: string, text: string, roleStatus: ERoleStatus) {
        try {
            const roomDoc = this.db.collection('rooms').doc(userId);
            const doc = await roomDoc.get();
            const data = doc.data();

            if (roleStatus !== ERoleStatus.ADMIN) {
                await this.setNotification(userId, text);
            }

            if (data) {
                data.chats = [
                    ...data.chats,
                    {
                        created: new Date(),
                        read_receiver: false,
                        sender_id: userId,
                        sender_role_status: roleStatus,
                        text: text
                    }
                ];
                return await roomDoc.set(data);
            } else {
                return await roomDoc.set({
                    chats: [
                        {
                            created: new Date(),
                            read_receiver: false,
                            sender_id: userId,
                            sender_role_status: roleStatus,
                            text: text
                        }
                    ],
                    user_id: userId
                });
            }
        } catch (error) {
            throw new ErrorObject(ErrorCodes.INTERNAL_SERVER_ERROR, 'Maaf terdapat kendala pada fitur chat.', error);
        }
    }

    async readChat(userId: string, userLoginId: string) {
        try {
            console.log('file: index.ts ~ line 142 ~ FirebaseAdmin ~ readChat ~ userId', userId);
            const roomDoc = this.db.collection('rooms').doc(userId);
            const doc = await roomDoc.get();
            const data = doc.data();

            if (doc) {
                let user = 'NON_ADMIN';
                if (data.user_id !== userLoginId) {
                    user = 'ADMIN';
                }

                if (user === 'ADMIN') {
                    await this.deleteNotification(userId);
                }

                data.chats = data.chats.map((chat: any) => {
                    if (user === 'ADMIN' && chat.sender_id === data.user_id) {
                        chat.read_receiver = true;
                    }

                    if (user === 'NON_ADMIN' && data.user_id === userLoginId && chat.sender_id !== userLoginId) {
                        chat.read_receiver = true;
                    }

                    return chat;
                });
                await roomDoc.set(data);
                return data;
            }
        } catch (error) {
            throw new ErrorObject(ErrorCodes.INTERNAL_SERVER_ERROR, 'Maaf terdapat kendala pada fitur chat.', error);
        }
    }
}
