import { SecureUser } from './database.js';

declare global {
    namespace Express {
        // Inject additional properties on express.Request
        interface Request {
            /**
             * YEEET
             */
            cookies?: { [key: string]: string };

            cid?: string | false;
            user?: SecureUser;

            templateData?: object;
        }
    }
}

export {}