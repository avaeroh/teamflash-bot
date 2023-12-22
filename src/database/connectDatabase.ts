import { connect } from 'mongoose';

export const connectDatabase = async () => {
  console.log('Connecting to database...');
  connect(process.env.MONGO_URI!)
    .then(() => {
      console.log('Database Connected!');
    })
    .catch((error) => {
      console.error('DB Connection failed: \n' + error);
      if (error instanceof Error) {
        console.error(error.message);
      }
    });
};
