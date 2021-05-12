import tmi from "tmi.js"
import { ApiClient } from 'twitch';
import ENV from "./env"
import MessageQueue, {Color} from "./msg_queue";
import {log} from "./log"
import wrapHandler from "./wrap_handler";

const startTime = Date.now();

const secondsInDay = 3600 * 24;
const secondsInHour = 3600;
const secondsInMinute = 60;

type HandlerArgs = {
    api: ApiClient,
    who: string,
    cmdArgs: string[]
};

const commandHandlers = {
    "!commands": (msgQueue: MessageQueue) => {
        msgQueue.push(`Příkazy: ${Object.keys(commandHandlers).sort().join(" ")}`);
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
    "!title": (msgQueue: MessageQueue, handlerArgs: HandlerArgs) => {
        if (handlerArgs.cmdArgs.length === 0) {
            msgQueue.push(`Na co to chceš změnit? (použití: !title <titulek>).`, {
                whom: handlerArgs.who
            });
            return;
        }

        const title = handlerArgs.cmdArgs.join(" ");
        log(`Changing title to ${title}.`);
        handlerArgs.api.helix.users.getUserByName(ENV.CHANNEL_NAME).then((user) => {
            if (user === null) {
                log("Couldn't change the title. (user === null)")
                return;
            }

            handlerArgs.api.helix.channels.updateChannelInfo(user, { title }).then(() => {
                log("Title changed.");
                msgQueue.push(`@${handlerArgs.who} Hotovo.`);
            }).catch((reason) => {
                log("Couldn't change the title:");
                log(reason);
            });
        }).catch((reason) => {
            log("Couldn't get the stream user.");
            log(reason);
        });
    },
} as const;

const modRequired: {[key in keyof typeof commandHandlers]: boolean} = {
    "!bot": false,
    "!title": true,
    "!youtube": false,
    "!commands": false,
    "!bot-uptime": false
};

const isValidCommand = (command: string): command is keyof typeof commandHandlers => {
    return command in commandHandlers;
};

const exclCommand = (msgQueue: MessageQueue, _channel: string, userstate: tmi.ChatUserstate, api: ApiClient, message: string) => {
    if (message.charAt(0) === "!") {
        // Twitch handles double spaces, but let's be sure.
        const [command, ...cmdArgs] = message.replace("  ", " ").split(" ");

        if (typeof userstate.username === "undefined") {
            log("Got a !command from a non-user.");
            return;
        }

        if (!isValidCommand(command)) {
            log(`Got unknown command "${command}".`);
            msgQueue.push(`Sorry, ${command} ještě neumim. :<`, {
                whom: userstate.username
            });
            return;
        }

        if (modRequired[command] && !(userstate.mod === true || userstate.badges?.broadcaster === "1")) {
            log(`Denied execution of "${command}" for "${userstate.username}".`);
            return;
        }

        log(`Executing "${command}".`);
        commandHandlers[command](msgQueue, {cmdArgs, api, who: userstate.username});
    }
};

export default wrapHandler(exclCommand);
