// interface IQueue {
//   id: string;
//   mention: string;
//   timestamp: number;
// }

import { Document } from "mongoose";

export interface IQueue extends Document {
  guildId: string;
  userId: string;
  mention: string;
  timestamp: number;
  type: "trainee" | "fto";
}
