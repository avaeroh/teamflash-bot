import { Document, model, Schema } from 'mongoose';

export interface INumberwang extends Document {
  discordId: string;
  highScore: number;
  currentScore: number;
  timestamp: number;
}

export const Numberwang = new Schema({
  discordId: String,
  highScore: Number,
  currentScore: Number,
  timestamp: Number,
});

export default model<INumberwang>('Numberwang', Numberwang);
