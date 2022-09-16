const https = require('https');
const fs = require('fs');
const ab2str = require('arraybuffer-to-string')

const INFO_FILE = "videoInfo.csv";
const LIST_URL = "https://api.sponsor.ajay.app/database/videoInfo.csv";

function readFile(path) {
    try {
        const data = fs.readFileSync(path, 'utf8');
        return data;
    } catch (err) {
        console.error(err);
        return null;
    }
}

function isDataDownloaded(){
    return fs.existsSync(INFO_FILE);
}

async function downloadDataIfNeeded(){
    if (isDataDownloaded()) {
        //file exists
        console.log("Video list already downloaded");
    } else {
        await downloadFile(LIST_URL, INFO_FILE)
            .then(res => console.log(res))
            .catch(err => console.log(err));
        console.log("Video list downloaded!");
    }
}

async function downloadFile(url, fileFullPath) {
    console.info('Downloading list from url: ' + url)
    return new Promise((resolve, reject) => {
        https.get(url, (resp) => {

            // chunk received from the server
            resp.on('data', (chunk) => {
                fs.appendFileSync(fileFullPath, chunk);
            });

            // last chunk received, we are done
            resp.on('end', () => {
                resolve('File downloaded and stored at: ' + fileFullPath);
            });

        }).on("error", (err) => {
            reject(new Error(err.message))
        });
    })
}

// This is a naive but fast approach of getting a random line
// from the huge csv file by taking a bite/peak into the file
// at a random position.
async function getRandomVideo() {
    const PEEK_SIZE = 1000;
    const count = fs.statSync(INFO_FILE).size;
    const marker = Math.floor(Math.random()*(count-PEEK_SIZE-1));

    // example
    let video = null;
    const stream = fs.createReadStream(INFO_FILE,{start: marker, end: marker+PEEK_SIZE});
    for await (const buffer of stream){
        const strip = ab2str(buffer);
        const lines = strip.split("\n");
        const line = lines[Math.floor(lines.length/2)];
        const words = line.split(",");
        video = {
            videoID: words[0],
            channelID: words[1],
            title: words[2],
            published: words[3],
        };

        // TODO don't skip bad data (tiny chance)
        if (video.videoID == "\"" || video.channelID == undefined || video.videoID.length < 11){
            console.warn("recursion!");
            return getRandomVideo();
        }
        break;
    }
    stream.close();
    return video;
}

module.exports = {
    readFile,
    getRandomVideo,
    downloadDataIfNeeded,
    isDataDownloaded
};