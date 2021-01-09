const log = (what: any) => {
    console.log("[log]", what);
};

const debug = (what: any) => {
    if (process.env.UCIPINA_DEBUG === "1") {
        console.log("[debug]", what);
    }
};

if (process.env.UCIPINA_DEBUG === "1") {
    debug("Debugging enabled.");
}

export {log, debug};
