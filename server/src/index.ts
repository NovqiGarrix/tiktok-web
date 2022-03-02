import mongoose from 'mongoose';

import server from './server';
import logger from './config/logger';

const app = server();
const PORT = +process.env.PORT! || 3001
const MONGODB_URL = process.env.MONGODB_URL as string

const NAMESPACE = 'Initialize Server';
mongoose.connect(MONGODB_URL).then(() => {
    logger.info(NAMESPACE, `Mongodb Connected!`)
    app.listen(PORT, () => logger.info(NAMESPACE, `Server running at port: ${PORT}`));
}).catch((err) => logger.error(NAMESPACE, err.message));

process.on('unhandledRejection', () => {
    mongoose.connection.close();
    mongoose.disconnect();
    process.exit();
});