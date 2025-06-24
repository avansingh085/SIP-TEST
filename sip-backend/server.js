import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import userRoutes from './routes/user.routes.js';
import { connectDB } from './config/db.js';
import {connection} from './config/mysql.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/users', userRoutes);

 connection.query(`select* from sipusers`, (error, results) => {
    if (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.error(`❌ SIP user "${name}" already exists.`);
      } else {
        console.error('❌ Error inserting SIP user:', error);
      }
      return;
    }

    console.log('✅ Inserted SIP User:', results);
  });
connectDB();

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

