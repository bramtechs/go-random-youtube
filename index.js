const express = require('express');
const app = express();
const fs = require("fs");

const {readFile, getRandomVideo, isDataDownloaded} = require("./utils");

const PORT = 80;

async function main() {
    // check if sponsorblock list downloaded
    if (!isDataDownloaded()){
        console.error("List not downloaded! Run 'npm run fetch' first!");
        return;
    }

    // cache index.html
    const indexHtml = readFile("static/index.html");
    if (indexHtml == null) {
        console.error("Could not find index.html!");
        return false;
    }

    // host the site
    app.use(express.static('static', {index: false}));

    app.get("/", async (req, res) => {
        try {
            const video = await getRandomVideo();
            const index = indexHtml.replaceAll("!ID!", video.videoID)
            res.status(200).send(index);
        } catch (err) {
            console.error(err);
            res.status(400).send(err);
        }
    });

    app.listen(PORT, async () => {
        console.log(`====================== Started ==========================`);
        console.log(`Site running on http://localhost:${PORT}...`);
    });
}

main();
