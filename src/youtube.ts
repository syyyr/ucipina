import tmi from "tmi.js"
import youtubedl from "youtube-dl"
import MessageQueue, {Color} from "./msg_queue";
import log from "./log"
import wrapHandler from "./wrap_handler";

type YTInfo = {
    duration: {
        seconds: string;
        minutes?: string;
        hours?: string;
    };
    uploader: string;
    title: string;
    id: string;
};

class Youtube {
    getInfo(url: string): Promise<YTInfo> {
        return new Promise((resolve, reject) => {
            youtubedl.getInfo(url, [], (err, info: any) => {
                if (err) {
                    reject(url);
                    return;
                }

                const splitTime = info.duration.split(":").reverse();

                const res: YTInfo = {
                    title: info.title,
                    uploader: info.uploader,
                    duration: {
                        seconds: splitTime[0],
                        minutes: splitTime[1],
                        hours: splitTime[2]
                    },
                    id: info.display_id
                };

                resolve(res);
            });

        });
    };

    private readonly urlRegex = /(?:(?:https?:)?\/\/)?(?:(?:www|m)\.)?(?:(?:youtube\.com|youtu.be))(?:\/(?:[\w\-]+\?v=|embed\/|v\/)?)(?:[\w\-]+)(\S+)?/g;

    parseUrls(url: string): string[] {
        return url.match(this.urlRegex) || [];
    }
};

const yt = new Youtube();

const youtubeInfoScraper = (msgQueue: MessageQueue, _channel: string, userstate: tmi.ChatUserstate, message: string) => {
    const handleScrapeError = (url: string) => {
        msgQueue.push(`${userstate.username}: ${url} is not a valid YT url. qwq`);
        return undefined;
    };
    const urls = yt.parseUrls(message);
    if (urls.length > 0) {
        log(`Parsed ${urls.length} URLs from ${userstate.username}.`);
    }
    Promise.all(urls.map(yt.getInfo).map((prom) => prom.catch(handleScrapeError))).then((infos: (YTInfo | undefined)[]) => {
        infos.forEach((info: YTInfo | undefined) => {
            if (typeof info === "undefined") {
                return;
            }
            const duration =
                `${info.duration.hours ? info.duration.hours + "h " : ""}${info.duration.minutes ? info.duration.minutes + "m " : ""}${info.duration.seconds + "s"}`;
            msgQueue.push(`/me  ▶️ YouTube ∎ ${info.title} ∎ ${info.uploader} ∎ ${duration} ∎ https://youtu.be/${info.id}`, Color.Red);
        });
    });
}

export default wrapHandler(youtubeInfoScraper);
