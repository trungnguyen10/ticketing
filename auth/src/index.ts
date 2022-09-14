import mongoose from 'mongoose';
import { app } from './app';

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be define');
  }

  try {
    await mongoose.connect(`${process.env.DATABASE_URL}`);
  } catch (err) {
    console.log(err);
  }

  console.log('Connected to DB');

  app.listen(3000, () => {
    console.log('Listening on port 3000');
  });
};

start();
