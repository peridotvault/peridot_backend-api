import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Pasang router di /api DAN root agar panggilan lama tanpa /api tetap jalan
app.use('/api', routes);
app.use('/', routes);

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    const code = err.status || 500;
    res.status(code).json({ error: err.message ?? 'Internal Server Error' });
});

export default app;
