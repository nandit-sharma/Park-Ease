import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import userRouter from './routes/userRoutes.js';
import parkingRouter from './routes/parkingRoutes.js';
import reservationRouter from './routes/reservationRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import { auth, adminAuth } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) console.error('DB Connection Error:', err);
  else console.log('PostgreSQL connected at:', res.rows[0]);
});

app.use(cors());
app.use(express.json());

app.use('/api/users', userRouter);
app.use('/api/parking', auth, parkingRouter);
app.use('/api/reservations', auth, reservationRouter);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 