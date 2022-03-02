import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import compression from 'compression';

// Middleware
import { RequestLogger } from './middleware';

// Route or Versioning
import v1 from './routes/v1';

dotenv.config();

function app() {
    const app = express();

    app.use(cors());
    app.use(RequestLogger);
    app.use(compression());
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    app.get('/', (_req, res) => res.sendStatus(200));

    app.use(`/api/v1`, v1);

    return app
}

export default app