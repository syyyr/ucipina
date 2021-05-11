import tmi from "tmi.js"
import { ApiClient } from 'twitch';
import MessageQueue from "./msg_queue";

const wrapHandler =
    (toWrap: (msgQueue: MessageQueue, channel: string, userstate: tmi.ChatUserstate, _api: ApiClient, message: string) => void) =>
    (msgQueue: MessageQueue, api: ApiClient) =>
    (channel: string, userstate: tmi.ChatUserstate, message: string, self: boolean) => {
        if (self) {
            return;
        }
        toWrap(msgQueue, channel, userstate, api, message);
    };

export default wrapHandler;
