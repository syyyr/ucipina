import MessageQueue from "./msg_queue";
import {log} from "./log"

const stash = [
    "(* ^ ω ^)",
    "(o^▽^o)",
    "(o･ω･o)",
    "(υ･ω･υ)",
    "(^人^)",
    "(≧◡≦)",
    "(o´∀`o)",
    "(´ ω `)",
    "(＾▽＾)",
    "(⌒ω⌒)",
    "(─‿‿─)",
    "(.❛ ᴗ ❛.)",
];

export default (msgQueue: MessageQueue, options: {intervalFrom: number, intervalTo: number}) => {
    const calcNext = () => {
        const res = options.intervalFrom + Math.floor(Math.random() * (options.intervalTo - options.intervalFrom));
        log(`New presence will be sent in ${Math.floor(res / 1000)} seconds.`);
        return res;
    };

    const post = () => {
        log("Sending presence.");
        msgQueue.push(`${stash[Math.floor((stash.length * Math.random()))]}`, {
            cursive: true
        });
        global.setTimeout(post, calcNext());
    };

    global.setTimeout(post, calcNext());
};
