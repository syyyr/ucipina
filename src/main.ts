import { ApiClient } from 'twitch';
import { ChatClient, PrivateMessage } from 'twitch-chat-client';
import { getStreamerAuth, getChatAuth } from './auth';
import ENV from "./env"
import AHOJSender from "./AHOJ_sender"
import ExclCommands from "./excl_commands"
import YoutubeScraper from "./youtube"
import MessageQueue from "./msg_queue"
import presence from "./presence"
import {log} from "./log"

const messageLogger = (cursive: boolean) => (_channel: string, user: string, message: string, info: PrivateMessage) => {
    const time = new Date().toLocaleString("cs-CZ", {
        second: "2-digit",
        minute: "2-digit",
        hour: "2-digit",
    });
    const origin = `${info.userInfo.isMod || info.userInfo.isBroadcaster ? "@" : ""}${user}`;
    console.log(`${time} ${origin.padStart(15)}: ${cursive ? "/me " : ""}${message}`);
};

const signalHandler = (client: ChatClient) => async (sig: NodeJS.Signals) => {
    log(`Got ${sig}, exiting...`);

    await client.say(ENV.CHANNEL_NAME, "Odpojuji se.");
    await client.quit();
    process.exit();
};

const main = async () => {
    const streamerApi = new ApiClient({ authProvider: await getStreamerAuth() });
    const chatApi = new ChatClient(await getChatAuth(), {
        channels: [ENV.CHANNEL_NAME],
        isAlwaysMod: true
    });
    const msgQueue = new MessageQueue(chatApi, {
        interval: 1000,
        // Unfortunately, the twitch library doesn't fire events on our own messages, so we have to log them ourselves.
        logger: (message: string) => {
            messageLogger(false)("", ENV.BOT_USERNAME, message, {userInfo: { isMod: true }} as PrivateMessage);
        }
    });

    chatApi.onMessage(messageLogger(false));
    chatApi.onAction(messageLogger(true));
    chatApi.onMessage(ExclCommands(msgQueue, streamerApi));
    chatApi.onMessage(AHOJSender(msgQueue, streamerApi));
    chatApi.onMessage(YoutubeScraper(msgQueue, streamerApi));

    chatApi.onDisconnect((reason) => {
        log(`Disconnected. Reason: ${reason}`);
    });

    await chatApi.connect();
    await chatApi.join(ENV.CHANNEL_NAME);
    await chatApi.changeColor("HotPink");
    log("Connected.");
    msgQueue.push("AHOJ, jsem online.");
    presence(msgQueue, {
        intervalFrom: 900000,
        intervalTo: 1200000
    });

    process.on("SIGTERM", signalHandler(chatApi));
    process.on("SIGINT", signalHandler(chatApi));
};

main();
