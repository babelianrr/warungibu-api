import { createConnection, Connection } from 'typeorm';
import { PostgresDriver } from 'typeorm/driver/postgres/PostgresDriver';
import { Pool } from 'pg';

import { resolveTimeout } from 'src/libs/sleep';
import { OrmConfig } from 'src/libs/database/ormconfig';
import { NODE_ENV } from './config';

// Handles unstable/intermitten connection lost to DB
function connectionGuard(connection: Connection) {
    // Access underlying pg driver
    if (connection.driver instanceof PostgresDriver) {
        const pool = connection.driver.master as Pool;

        // Add handler on pool error event
        pool.on('error', async (err) => {
            console.log('Connection pool erring out, Reconnecting...', err);
            try {
                await connection.close();
            } catch (innerErr) {
                console.log('Failed to close connection', innerErr);
            }
            while (!connection.isConnected) {
                try {
                    await connection.connect(); // eslint-disable-line
                    console.log('Reconnected DB');
                } catch (error) {
                    console.log('Reconnect Error', error);
                }

                if (!connection.isConnected) {
                    // Throttle retry
                    await resolveTimeout(500); // eslint-disable-line
                }
            }
        });
    }
}

export async function connect(): Promise<void> {
    let connection: Connection;
    let isConnected = false;

    console.log('Connecting to DB...');
    while (!isConnected) {
        try {
            connection = await createConnection(OrmConfig); // eslint-disable-line
            isConnected = connection.isConnected;
        } catch (error) {
            console.log('createConnection Error');
            console.log(error);

            if (NODE_ENV === 'test') {
                throw error;
            }
        }

        if (!isConnected) {
            await resolveTimeout(500); // eslint-disable-line
        }
    }

    console.log('Connected to DB');
    connectionGuard(connection);
}
