import tmi from "tmi.js"
import ENV from "./env"
import MessageQueue from "./msg_queue"

const client = new tmi.client({
    identity: {
        username: ENV.BOT_USERNAME,
        password: ENV.OAUTH_TOKEN
    },
    channels: [ENV.CHANNEL_NAME]
});

const msgQueue = new MessageQueue(client, {
    interval: 1000
});

const log = (what: any) => {
    console.log("[log]", what);
}

const messageLogger = (_channel: string, userstate: tmi.ChatUserstate, message: string, _self: boolean) => {
    const time = new Date().toLocaleString("cs-CZ", {
        second: "2-digit",
        minute: "2-digit",
        hour: "2-digit",
    });
    const origin = typeof userstate.username !== "string" ? "<unknown_user>" :
        `${userstate.mod || userstate.username === "syyyr" ? "@" : ""}${userstate.username}`;
    console.log(`${time} ${origin.padStart(15)}: ${message}`);
};

const exclCommandHandlers: {[key in string]: () => void} = {
    "!bot": () => {
        msgQueue.push(`AHOJ! Já jsem ${ENV.BOT_USERNAME} a jsem bot na tomto kanálu. :^)`);
    }
}

const exclCommand = (_channel: string, userstate: tmi.ChatUserstate, message: string, self: boolean) => {
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
            exclCommandHandlers[message]();
        } else {
            log(`Got unknown command "${message}".`);
            msgQueue.push(`${userstate.username}: Sorry, ${message} ještě neumim. :<`);
        }
    }
};

const AHOJcooldown = 30000;
let AHOJlast = Date.now() - AHOJcooldown;
const AHOJSender = (_channel: string, _userstate: tmi.ChatUserstate, message: string, self: boolean) => {
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

client.on("message", messageLogger);
client.on("message", exclCommand);
client.on("message", AHOJSender);

client.connect().then(() => {
    log("Bot connected.");
    msgQueue.push("AHOJ");
});
