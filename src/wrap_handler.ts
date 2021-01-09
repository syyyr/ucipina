import tmi from "tmi.js"
import MessageQueue from "./msg_queue";

const wrapHandler =
    (toWrap: (msgQueue: MessageQueue, channel: string, userstate: tmi.ChatUserstate, message: string) => void) =>
    (msgQueue: MessageQueue) =>
    (channel: string, userstate: tmi.ChatUserstate, message: string, self: boolean) => {
        if (self) {
            return;
        }
        toWrap(msgQueue, channel, userstate, message);
    };

export default wrapHandler;
