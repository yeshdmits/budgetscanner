import { Schema, model, Document } from 'mongoose';

export interface ISettings extends Document {
  key: string;
  userFullName: string;
  createdAt: Date;
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>({
  key: { type: String, required: true, unique: true, default: 'default' },
  userFullName: { type: String, default: 'Yeshenko Dmytro' }
}, {
  timestamps: true
});

export const Settings = model<ISettings>('Settings', settingsSchema);
