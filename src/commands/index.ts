import * as FtpCommand from "./ftp";
import * as FtpLogChannelCommand from "./ftpLogChannel";

import * as CreateDivisionCommand from "./callout/createDiv";
import * as DeleteDivisionCommand from "./callout/deleteDiv";
import * as DivisionsListCommand from "./callout/divList";

import * as CalloutCommand from "./callout/callout";

export const commands = {
  ftp: FtpCommand,
  ftplogchannel: FtpLogChannelCommand,
  createdivision: CreateDivisionCommand,
  deletedivision: DeleteDivisionCommand,
  divisionslist: DivisionsListCommand,
  callout: CalloutCommand,
};
