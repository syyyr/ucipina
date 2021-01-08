import tmi from "tmi.js"
import MessageQueue from "./msg_queue";
import log from "./log"

const AHOJcooldown = 30000;
let AHOJlast = Date.now() - AHOJcooldown;
const AHOJSender = (msgQueue: MessageQueue, _channel: string, _userstate: tmi.ChatUserstate, message: string, self: boolean) => {
    if (self) {
        return;
    }
    if (message.toLowerCase() === "ahoj") {
        if (Date.now() - AHOJlast > AHOJcooldown) {
            log("Sending AHOJ.");
            msgQueue.push("AHOJ");
            AHOJlast = Date.now();
        }
    }
};

export default (msgQueue: MessageQueue) => {
    return (_channel: string, userstate: tmi.ChatUserstate, message: string, self: boolean) => {
        AHOJSender(msgQueue, _channel, userstate, message, self);
    }
};
