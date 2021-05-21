import { RefreshableAuthProvider, StaticAuthProvider } from 'twitch-auth';
import { promises as fs } from "fs";
import ENV from "./env"

const impl = async (tokenFile: string, scopes: string[]) => {
    const tokenData = JSON.parse(await fs.readFile(tokenFile, "utf-8"));
    return new RefreshableAuthProvider(
        new StaticAuthProvider(ENV.CLIENT_ID, tokenData.accessToken, scopes), {
            clientSecret: ENV.CLIENT_SECRET,
            refreshToken: tokenData.refreshToken,
            expiry: tokenData.expiryTimestamp === null ? null : new Date(tokenData.expiryTimestamp),
            onRefresh: async ({ accessToken, refreshToken, expiryDate }) => {
                const newTokenData = {
                    accessToken,
                    refreshToken,
                    expiryTimestamp: expiryDate === null ? null : expiryDate.getTime()
                };
                await fs.writeFile(tokenFile, JSON.stringify(newTokenData, null, 4), "utf-8")
            }
        }
    );
};

const getStreamerAuth = async () => impl("./streamer.json", ["user:edit:broadcast"]);

export { getStreamerAuth };
