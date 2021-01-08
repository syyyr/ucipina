import MessageQueue from "./msg_queue";
import log from "./log"

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

export default (msgQueue: MessageQueue, options: {interval: number}) => {
    global.setInterval(() => {
        log("Sending presence.");
        msgQueue.push(stash[Math.floor((stash.length * Math.random()))]);
    }, options.interval);
};
