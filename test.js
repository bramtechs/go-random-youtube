const {getRandomVideo, downloadDataIfNeeded, isDataDownloaded} = require("./utils");

const INFO_FILE = "videoInfo.csv";
const LIST_URL = "https://api.sponsor.ajay.app/database/videoInfo.csv";

async function check(count){
    if (!isDataDownloaded()){
        console.warn("Database must be downloaded first. Run npm run start.")
       return false;
    }

    for (let i = 0; i < count; i++){
       const video = await getRandomVideo();
       if (!video.hasOwnProperty("videoID")){
           console.error("Didn't receive video");
           return false;
       }
       const id = video.videoID;
       if(id.length < 11){
           console.error("ID malformed ",id,video);
           return false;
       }
    }
    return true;
}

async function test(){
    const COUNT = 10000;
    if (await check(COUNT)){
        console.log(`✅  Reading ${COUNT} video IDs succeeded.`);
    }else{
        console.error(`❌  Reading ${COUNT} video IDs failed.`);
    }
}

test();