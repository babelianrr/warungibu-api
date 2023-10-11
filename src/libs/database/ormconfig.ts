import { ConnectionOptions } from 'typeorm';
import { entities } from 'src/libs/database/entities';
import { migrations } from 'src/libs/database/migrations';

import {
    // Envvars for default database connection
    PGHOST,
    PGPORT,
    PGUSER,
    PGPASSWORD,
    PGDATABASE
} from 'src/config';

export const OrmConfig = {
    synchronize: false,
    logging: false, // loging sql queries
    entities,
    migrations, // put file if any migrations
    cli: {
        entitiesDir: 'src/libs/database/entities',
        migratiosDir: 'src/libs/database/migrations'
    },
    type: 'postgres',
    extra: {
        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 60000,
        statement_timeout: 360000
    },
    // synchronize: true,
    database: PGDATABASE,
    host: PGHOST,
    port: PGPORT,
    username: PGUSER,
    password: PGPASSWORD
} as ConnectionOptions;
