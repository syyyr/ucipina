import tmi from "tmi.js"
import { ApiClient } from 'twitch';
import ENV from "./env"
import MessageQueue from "./msg_queue";
import {log} from "./log"
import wrapHandler from "./wrap_handler";

const startTime = Date.now();

const secondsInDay = 3600 * 24;
const secondsInHour = 3600;
const secondsInMinute = 60;

const exclCommandHandlers: {[key in string]: (msgQueue: MessageQueue) => void} = {
    "!commands": (msgQueue: MessageQueue) => {
        msgQueue.push(`Příkazy: ${Object.keys(exclCommandHandlers).sort().join(" ")}`);
    },
    "!bot": (msgQueue: MessageQueue) => {
        msgQueue.push(`AHOJ! Já jsem ${ENV.BOT_USERNAME} a jsem bot na kanálu ${ENV.CHANNEL_NAME}. :^)`);
    },
    "!youtube": (msgQueue: MessageQueue) => {
        msgQueue.push("Bot podporuje YouTube linky. Stačí je poslat do chatu (klidně i víc najednou.");
    },
    "!bot-uptime": (msgQueue: MessageQueue) => {
        let upTimeSec = Math.floor((Date.now() - startTime) / 1000);
        const days = Math.floor(upTimeSec / secondsInDay);
        upTimeSec = upTimeSec - (days * secondsInDay);
        const hours = Math.floor(upTimeSec / secondsInHour);
        upTimeSec = upTimeSec - (hours * secondsInHour);
        const minutes = Math.floor(upTimeSec / secondsInMinute);
        upTimeSec = upTimeSec - (minutes * secondsInMinute);

        msgQueue.push(`Už běžím ${days}d${hours}h${minutes}m${upTimeSec}s.`);
    },
    "!title": (msgQueue: MessageQueue) => {

    }
}

const exclCommand = (msgQueue: MessageQueue, _channel: string, userstate: tmi.ChatUserstate, _api: ApiClient, message: string) => {
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

export default wrapHandler(exclCommand);
