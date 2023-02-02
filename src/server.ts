import dotenv from 'dotenv';

import './module-alias';
import 'source-map-support/register';

import { createApp } from 'src/app';

dotenv.config();

const logAndExitProcess = (exitCode: number) => {
    console.error('Exiting process with exit code: ', exitCode);
    process.exit(exitCode);
};

(async () => {
    try {
        const app = await createApp();
        app.listen(app.get('port'), () => {
            console.log(
                {
                    port_number: app.get('port'),
                    env_string: app.get('env')
                },
                'Started express server'
            );
        });

        process.on('unhandledRejection', (reason: any) => {
            console.error(reason);
            logAndExitProcess(1);
        });

        process.on('unhandledException', (err: Error) => {
            console.error(err);
            logAndExitProcess(1);
        });

        process.on('warning', (warning: Error) => {
            console.warn('Encountered warning: ', warning);
        });
    } catch (err) {
        console.error('error caught in server.ts', err);
        logAndExitProcess(1);
    }
})();
