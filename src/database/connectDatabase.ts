import { connect } from 'mongoose';

export const connectDatabase = async () => {
  console.log('Connecting to database...');
  await connect(process.env.MONGO_URI!);
  console.log('Database Connected!');
};
