import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose, { connect } from 'mongoose';

import dotenv from 'dotenv';
dotenv.config();

import authRouter from './routers/auth.js';
import feedRouter from './routers/feed.js';
import cartFeedRouter from './routers/cartFeed.js';

const app = express();
const port = process.env.VITE_API_PORT || 8080;

mongoose.set('strictQuery', false);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDb Connected`);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

app.use(cors());
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-User-Id'
  );
  res.setHeader('Content-Type', 'multipart/form-data');
  next();
});

app.use('/auth', authRouter);
app.use('/feed', feedRouter);
app.use('/cartFeed', cartFeedRouter);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.satusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`server running on port ${port}`);
  });
});

// export default app;
