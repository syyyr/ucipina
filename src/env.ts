if (typeof process.env.OAUTH_TOKEN !== "string") {
    throw new Error("OAUTH_TOKEN not defined");
}

export default {
    BOT_USERNAME: "ucipina",
    CHANNEL_NAME: "syyyr",
    OAUTH_TOKEN: process.env.OAUTH_TOKEN
};
