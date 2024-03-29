import { ChatClient } from 'twitch-chat-client';
import ENV from "./env"

type MessageOptions = {
    color?: Color;
    whom?: string;
    cursive?: boolean
};

class MessageQueue {
    private queue: {
        message: string;
        color?: Color
        cursive?: boolean
    }[];

    constructor(client: ChatClient, options: {interval: number, logger: (message: string) => void}) {
        this.queue = [];
        global.setInterval(async () => {
            const toSend = this.queue.shift();
            if (typeof toSend === "object") {
                if (typeof toSend.color !== "undefined") {
                    await client.changeColor(toSend.color);
                }

                const ret = toSend.cursive === true ?
                    client.action(ENV.CHANNEL_NAME, toSend.message) :
                    client.say(ENV.CHANNEL_NAME, toSend.message);

                await ret.catch((reason) => {
                    console.log("Unable to send message:", reason);
                });

                if (typeof toSend.color !== "undefined") {
                    await client.changeColor(Color.HotPink);
                }

                options.logger(`${toSend.cursive === true ? "/me " : ""}${toSend.message}`);
            }
        }, options.interval);
    }

    push(message: string, options?: MessageOptions): void {
        let formattedMessage =
            (typeof options?.whom !== "undefined" ? "@" + options.whom + " " : "")
            + message;
        this.queue.push({ message: formattedMessage, color: options?.color, cursive: options?.cursive});
    }
}

enum Color {
    Blue = "Blue",
    BlueViolet = "BlueViolet",
    CadetBlue = "CadetBlue",
    Chocolate = "Chocolate",
    Coral = "Coral",
    DodgerBlue = "DodgerBlue",
    Firebrick = "Firebrick",
    GoldenRod = "GoldenRod",
    Green = "Green",
    HotPink = "HotPink",
    OrangeRed = "OrangeRed",
    Red = "Red",
    SeaGreen = "SeaGreen",
    SpringGreen = "SpringGreen",
    YellowGreen = "YellowGreen",
};

export {Color};
export default MessageQueue;
