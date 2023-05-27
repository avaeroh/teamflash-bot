import { connect } from 'mongoose';
import { type } from 'os';

export const connectDatabase = async () => {
  console.log('Connecting to database...');
  await connect(process.env.MONGO_URI!)
    .then(() => {
      console.log('Database Connected!');
    })
    .catch((error) => {
      console.error('DB Connection failed:' + error);
      if (error instanceof Error) {
        console.error(error.message);
      }
    });
};
