import tmi from "tmi.js"
import { ApiClient } from 'twitch';
import { getStreamerAuth } from './auth';
import ENV from "./env"
import AHOJSender from "./AHOJ_sender"
import ExclCommands from "./excl_commands"
import YoutubeScraper from "./youtube"
import MessageQueue from "./msg_queue"
import presence from "./presence"
import {log} from "./log"

const client = new tmi.client({
    identity: {
        username: ENV.BOT_USERNAME,
        password: ENV.OAUTH_TOKEN
    },
    channels: [ENV.CHANNEL_NAME],
    connection: {
        reconnect: true,
        secure: true
    }
});

const msgQueue = new MessageQueue(client, {
    interval: 1000
});

const messageLogger = (_channel: string, userstate: tmi.ChatUserstate, message: string, _self: boolean) => {
    const time = new Date().toLocaleString("cs-CZ", {
        second: "2-digit",
        minute: "2-digit",
        hour: "2-digit",
    });
    const origin = typeof userstate.username !== "string" ? "<unknown_user>" :
        `${userstate.mod || userstate.badges?.broadcaster === "1" ? "@" : ""}${userstate.username}`;
    console.log(`${time} ${origin.padStart(15)}: ${message}`);
};

const signalHandler = async (sig: NodeJS.Signals) => {
    log(`Got ${sig}, exiting...`);

    await client.say(ENV.CHANNEL_NAME, "Odpojuji se.");
    await client.disconnect();
    process.exit();
};

const main = async () => {
    const streamerAuth = await getStreamerAuth();
    const streamerApi = new ApiClient({ authProvider: streamerAuth });

    client.on("message", messageLogger);
    client.on("message", ExclCommands(msgQueue, streamerApi));
    client.on("message", AHOJSender(msgQueue, streamerApi));
    client.on("message", YoutubeScraper(msgQueue, streamerApi));

    client.on("disconnected", (reason) => {
        log(`Disconnected. Reason: ${reason}`);
    });

    client.connect().then(async () => {
        log("Connected.");
        await client.color("HotPink");
        msgQueue.push("AHOJ, jsem online.");
        presence(msgQueue, {
            intervalFrom: 900000,
            intervalTo: 1200000
        });
    });

    process.on("SIGTERM", signalHandler);
    process.on("SIGINT", signalHandler);
};

main();
