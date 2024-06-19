import mongoose, { Document, Schema } from "mongoose";

export interface IDivision extends Document {
  guildId: string;
  roleId: string;
  name: string;
  logoUrl?: string;
}

const DivisionSchema: Schema = new Schema({
  guildId: { type: String, required: true },
  roleId: { type: String, required: true },
  name: { type: String, required: true },
  logoUrl: { type: String },
});

export default mongoose.model<IDivision>("divisions", DivisionSchema);
