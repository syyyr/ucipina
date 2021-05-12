import tmi from "tmi.js"
import ENV from "./env"
class MessageQueue {
    private queue: {
        message: string;
        color?: Color
    }[];

    constructor(client: tmi.Client, options: {interval: number}) {
        this.queue = [];
        global.setInterval(() => {
            const toSend = this.queue.shift();
            if (typeof toSend === "object") {
                if (typeof toSend.color !== "undefined") {
                    client.color(toSend.color);
                }
                client.say(ENV.CHANNEL_NAME, toSend.message).catch((reason) => {
                    console.log("Unable to send message:", reason);
                });
                if (typeof toSend.color !== "undefined") {
                    client.color(Color.HotPink);
                }
            }
        }, options.interval);
    }

    push(message: string, options?: {color?: Color, whom?: string}): void {
        let formattedMessage = (typeof options?.whom !== "undefined" ? "@" + options.whom + " " : "") + message;
        this.queue.push({ message: formattedMessage, color: options?.color});
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
