import tmi from "tmi.js"
import {ApiClient} from "twitch";
import MessageQueue from "./msg_queue";
import {log} from "./log"
import wrapHandler from "./wrap_handler";

const AHOJcooldown = 30000;
let AHOJlast = Date.now() - AHOJcooldown;
const AHOJSender = (msgQueue: MessageQueue, _channel: string, _userstate: tmi.ChatUserstate, _api: ApiClient, message: string) => {
    if (message.toLowerCase() === "ahoj") {
        if (Date.now() - AHOJlast > AHOJcooldown) {
            log("Sending AHOJ.");
            msgQueue.push("AHOJ");
            AHOJlast = Date.now();
        }
    }
};

export default wrapHandler(AHOJSender);
