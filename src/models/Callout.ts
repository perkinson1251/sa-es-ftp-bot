import { Document, Schema, Types, model } from "mongoose";

export interface ICallout extends Document {
  guildId: string;
  channelId: string;
  userId: string;
  divisionId: Types.ObjectId;
  incidentType: string;
  incidentLocation: string;
  incidentDetails: string;
  incidentTeamspeakChannel: string;
  status: "active" | "closed";
  timestamp: number;
}

const calloutSchema = new Schema<ICallout>({
  guildId: { type: String, required: true },
  channelId: { type: String, required: true },
  userId: { type: String, required: true },
  divisionId: { type: Schema.Types.ObjectId, ref: "divisions", required: true },
  incidentType: { type: String, required: false },
  incidentLocation: { type: String, required: false },
  incidentDetails: { type: String, required: false },
  incidentTeamspeakChannel: { type: String, required: false },
  status: { type: String, enum: ["active", "closed"], default: "active" },
  timestamp: { type: Number, required: true },
});

export default model<ICallout>("callouts", calloutSchema);
