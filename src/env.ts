if (typeof process.env.OAUTH_TOKEN !== "string") {
    throw new Error("OAUTH_TOKEN not defined");
}

export default {
    BOT_USERNAME: process.env.BOT_USERNAME || "ucipina",
    CHANNEL_NAME: process.env.CHANNEL_NAME || "syyyr",
    OAUTH_TOKEN: process.env.OAUTH_TOKEN
};
