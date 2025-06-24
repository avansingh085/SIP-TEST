import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import userRoutes from './routes/user.routes.js';
import { connectDB } from './config/db.js';
import {connection} from './config/mysql.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors({
  origin: 'https://sip-test-zeta.vercel.app', 
  credentials: true
}));
app.use(express.json());
app.use('/api/users', userRoutes);


connectDB();

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

