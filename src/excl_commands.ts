import tmi from "tmi.js"
import ENV from "./env"
import MessageQueue from "./msg_queue";
import log from "./log"

const exclCommandHandlers: {[key in string]: (msgQueue: MessageQueue) => void} = {
    "!commands": (msgQueue: MessageQueue) => {
        msgQueue.push(`Příkazy: ${Object.keys(exclCommandHandlers).sort().join(" ")}`);
    },
    "!bot": (msgQueue: MessageQueue) => {
        msgQueue.push(`AHOJ! Já jsem ${ENV.BOT_USERNAME} a jsem bot na tomto kanálu. :^)`);
    }
}

const exclCommand = (msgQueue: MessageQueue, _channel: string, userstate: tmi.ChatUserstate, message: string, self: boolean) => {
    if (self) {
        return;
    }
    if (message.charAt(0) === "!") {
        if (typeof userstate.username === "undefined") {
            log("Got a !command from a non-user.");
            return;
        }
        if (typeof exclCommandHandlers[message] === "function") {
            log(`Executing "${message}".`);
            exclCommandHandlers[message](msgQueue);
        } else {
            log(`Got unknown command "${message}".`);
            msgQueue.push(`${userstate.username}: Sorry, ${message} ještě neumim. :<`);
        }
    }
};

export default (msgQueue: MessageQueue) => {
    return (_channel: string, userstate: tmi.ChatUserstate, message: string, self: boolean) => {
        exclCommand(msgQueue, _channel, userstate, message, self);
    }
};
