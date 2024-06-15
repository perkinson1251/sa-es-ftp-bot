import { Document } from "mongoose";

export interface IQueueChannel extends Document {
  guildId: string;
  channelId?: string;
  messageId?: string;
}
