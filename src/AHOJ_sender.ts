import { PrivateMessage } from 'twitch-chat-client';
import {ApiClient} from "twitch";
import MessageQueue from "./msg_queue";
import {log} from "./log"
import wrapHandler from "./wrap_handler";

const AHOJcooldown = 30000;
let AHOJlast = Date.now() - AHOJcooldown;
const AHOJSender = (msgQueue: MessageQueue, _user: string, message: string, _info: PrivateMessage, _api: ApiClient) => {
    if (message.toLowerCase() === "ahoj") {
        if (Date.now() - AHOJlast > AHOJcooldown) {
            log("Sending AHOJ.");
            msgQueue.push("AHOJ");
            AHOJlast = Date.now();
        }
    }
};

export default wrapHandler(AHOJSender);
