import { ApiClient } from 'twitch';
import { PrivateMessage } from 'twitch-chat-client';
import MessageQueue from "./msg_queue";
import ENV from "./env"

const wrapHandler =
    (toWrap: (msgQueue: MessageQueue, user: string, message: string, info: PrivateMessage, api: ApiClient) => void) =>
    (msgQueue: MessageQueue, api: ApiClient) =>
    (_channel: string, user: string, message: string, info: PrivateMessage) => {
        if (user === ENV.BOT_USERNAME) {
            return;
        }
        toWrap(msgQueue, user, message, info, api);
    };

export default wrapHandler;
