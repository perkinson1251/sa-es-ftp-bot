import { Schema, model } from "mongoose";

interface IServerSettings {
  guildId: string;
  ftpLogChannelId?: string;
}

const serverSettingsSchema = new Schema<IServerSettings>({
  guildId: { type: String, required: true, unique: true },
  ftpLogChannelId: { type: String, default: null },
});

export default model<IServerSettings>("server_settings", serverSettingsSchema);
