import tmi from "tmi.js"
import ENV from "./env"
class MessageQueue {
    private queue: string[];

    constructor(client: tmi.Client, options: {interval: number}) {
        this.queue = [];
        global.setInterval(() => {
            const toSend = this.queue.shift();
            if (typeof toSend === "string") {
                client.say(ENV.CHANNEL_NAME, toSend).catch((reason) => {
                    console.log("Unable to send message:", reason);
                });
            }
        }, options.interval);
    }

    push(message: string): void {
        this.queue.push(message);
    }
}

export default MessageQueue;
