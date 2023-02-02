const admin = require('firebase-admin');
const serviceAccount = require('../dnr-plus-ef0dc-firebase-adminsdk-h1otl-5023effd27.json');
(async() => {
    try {
        const userId = process.env.USER_ID
        const adminId = '55ad9776-769f-4eba-933b-76b78a937b8f'
        admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        });

        const db = admin.firestore();

        const docRef = db.collection('rooms').doc(userId);;

        const a = await docRef.set({
            chats:[{
                created: new Date(),
                read_receiver: false,
                sender_id: userId,
                sender_role_status: 'AJP_USER',
                text: 'halo'
            },{
                created: new Date(),
                read_receiver: false,
                sender_id: adminId,
                sender_role_status: 'ADMIN',
                text: 'halo juga'
            },{
                created: new Date(),
                read_receiver: false,
                sender_id: userId,
                sender_role_status: 'AJP_USER',
                text: 'halo'
            },{
                created: new Date(),
                read_receiver: false,
                sender_id: adminId,
                sender_role_status: 'ADMIN',
                text: 'halo juga'
            },{
                created: new Date(),
                read_receiver: false,
                sender_id: userId,
                sender_role_status: 'AJP_USER',
                text: 'halo'
            },{
                created: new Date(),
                read_receiver: false,
                sender_id: adminId,
                sender_role_status: 'ADMIN',
                text: 'halo juga'
            },{
                created: new Date(),
                read_receiver: false,
                sender_id: userId,
                sender_role_status: 'AJP_USER',
                text: 'halo'
            },{
                created: new Date(),
                read_receiver: false,
                sender_id: adminId,
                sender_role_status: 'ADMIN',
                text: 'halo juga'
            },{
                created: new Date(),
                read_receiver: false,
                sender_id: userId,
                sender_role_status: 'AJP_USER',
                text: 'halo'
            },{
                created: new Date(),
                read_receiver: false,
                sender_id: adminId,
                sender_role_status: 'ADMIN',
                text: 'halo juga'
            },{
                created: new Date(),
                read_receiver: false,
                sender_id: userId,
                sender_role_status: 'AJP_USER',
                text: 'halo'
            },{
                created: new Date(),
                read_receiver: false,
                sender_id: adminId,
                sender_role_status: 'ADMIN',
                text: 'halo juga'
            },{
                created: new Date(),
                read_receiver: false,
                sender_id: userId,
                sender_role_status: 'AJP_USER',
                text: 'halo'
            },{
                created: new Date(),
                read_receiver: false,
                sender_id: adminId,
                sender_role_status: 'ADMIN',
                text: 'halo juga'
            },{
                created: new Date(),
                read_receiver: false,
                sender_id: userId,
                sender_role_status: 'AJP_USER',
                text: 'halo'
            },{
                created: new Date(),
                read_receiver: false,
                sender_id: adminId,
                sender_role_status: 'ADMIN',
                text: 'halo juga'
            },{
                created: new Date(),
                read_receiver: false,
                sender_id: userId,
                sender_role_status: 'AJP_USER',
                text: 'halo'
            },{
                created: new Date(),
                read_receiver: false,
                sender_id: adminId,
                sender_role_status: 'ADMIN',
                text: 'halo juga'
            },{
                created: new Date(),
                read_receiver: false,
                sender_id: userId,
                sender_role_status: 'AJP_USER',
                text: 'halo'
            },{
                created: new Date(),
                read_receiver: false,
                sender_id: adminId,
                sender_role_status: 'ADMIN',
                text: 'halo juga'
            },{
                created: new Date(),
                read_receiver: false,
                sender_id: userId,
                sender_role_status: 'AJP_USER',
                text: 'halo'
            },{
                created: new Date(),
                read_receiver: false,
                sender_id: adminId,
                sender_role_status: 'ADMIN',
                text: 'halo juga'
            },{
                created: new Date(),
                read_receiver: false,
                sender_id: userId,
                sender_role_status: 'AJP_USER',
                text: 'halo'
            },{
                created: new Date(),
                read_receiver: false,
                sender_id: adminId,
                sender_role_status: 'ADMIN',
                text: 'halo juga'
            },{
                created: new Date(),
                read_receiver: false,
                sender_id: userId,
                sender_role_status: 'AJP_USER',
                text: 'halo'
            },{
                created: new Date(),
                read_receiver: false,
                sender_id: adminId,
                sender_role_status: 'ADMIN',
                text: 'halo juga'
            },{
                created: new Date(),
                read_receiver: false,
                sender_id: userId,
                sender_role_status: 'AJP_USER',
                text: 'halo'
            },{
                created: new Date(),
                read_receiver: false,
                sender_id: adminId,
                sender_role_status: 'ADMIN',
                text: 'halo juga'
            },{
                created: new Date(),
                read_receiver: false,
                sender_id: userId,
                sender_role_status: 'AJP_USER',
                text: 'halo'
            },{
                created: new Date(),
                read_receiver: false,
                sender_id: adminId,
                sender_role_status: 'ADMIN',
                text: 'halo juga'
            },{
                created: new Date(),
                read_receiver: false,
                sender_id: userId,
                sender_role_status: 'AJP_USER',
                text: 'halo'
            },{
                created: new Date(),
                read_receiver: false,
                sender_id: adminId,
                sender_role_status: 'ADMIN',
                text: 'halo juga'
            },{
                created: new Date(),
                read_receiver: false,
                sender_id: userId,
                sender_role_status: 'AJP_USER',
                text: 'halo'
            },{
                created: new Date(),
                read_receiver: false,
                sender_id: adminId,
                sender_role_status: 'ADMIN',
                text: 'halo juga'
            },{
                created: new Date(),
                read_receiver: false,
                sender_id: userId,
                sender_role_status: 'AJP_USER',
                text: 'halo'
            },{
                created: new Date(),
                read_receiver: false,
                sender_id: adminId,
                sender_role_status: 'ADMIN',
                text: 'halo juga'
            },{
                created: new Date(),
                read_receiver: false,
                sender_id: userId,
                sender_role_status: 'AJP_USER',
                text: 'halo'
            },{
                created: new Date(),
                read_receiver: false,
                sender_id: adminId,
                sender_role_status: 'ADMIN',
                text: 'halo juga'
            },],
            user_id: userId
        });
        console.log(a);
    } catch (error) {
        console.log(error);
    } finally {
        process.exit();
    }
    
})();