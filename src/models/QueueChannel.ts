import { IQueueChannel } from "interfaces/IQueueChannel";
import { Schema, model } from "mongoose";

const queueChannelSchema = new Schema<IQueueChannel>({
  guildId: { type: String, required: true, unique: true },
  channelId: { type: String },
  messageId: { type: String },
});

export default model<IQueueChannel>("queue_channel", queueChannelSchema);
