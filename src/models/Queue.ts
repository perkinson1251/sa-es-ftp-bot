import { Document, Schema, model } from "mongoose";

interface IQueue extends Document {
  guildId: string;
  userId: string;
  mention: string;
  timestamp: number;
  type: "trainee" | "fto";
}

const queueSchema = new Schema<IQueue>({
  guildId: { type: String, required: true },
  userId: { type: String, required: true },
  mention: { type: String, required: true },
  timestamp: { type: Number, required: true },
  type: { type: String, required: true, enum: ["trainee", "fto"] },
});

export default model<IQueue>("queue", queueSchema);
