if (typeof process.env.CLIENT_ID !== "string") {
    throw new Error("CLIENT_ID not defined");
}

if (typeof process.env.CLIENT_SECRET !== "string") {
    throw new Error("CLIENT_SECRET not defined");
}

export default {
    BOT_USERNAME: process.env.BOT_USERNAME || "ucipina",
    CHANNEL_NAME: process.env.CHANNEL_NAME || "syyyr",
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
};
