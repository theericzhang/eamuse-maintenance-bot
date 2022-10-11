import { TwitterApi } from "twitter-api-v2";
import express from "express";
import "dotenv/config";

const app = express();
const port = 5000;

// expeccting json
app.use(express.json());

app.get("/", (req, res) => {
    res.send("twitter-eamuse-warn");
});

// create a Twitter client with bearer token
const clientMain = new TwitterApi(
    { 
        appKey: process.env.TWITTER_API_KEY, 
        appSecret: process.env.TWITTER_API_SECRET, 
        accessToken: process.env.TWITTER_ACCESS_TOKEN, 
        accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET
    }
);

// these key values will set to true once time conditions are met
// with these "use once" flags, we can make sure we are posting a tweet once during a monthly lifecycle
// once all values are true, we know to reset the object back to its original state
let postFlags = {
    posted3DayWarning : false,
    posted24HourWarning : false,
    posted2HourWarning : false,
    postedBeginsWarning : false,
    postedEndsIn1HourNotice : false,
    postedEndedNotice : false
};

// helper function to post tweetBody
async function postTweet(tweetBody) {
    await clientMain.v1.tweet(tweetBody);
    console.log('Posted! - ', tweetBody);
}

async function dateObserver() {
    let tweetBody = ``;

    const firstTuesdayDate = new Date();
    firstTuesdayDate.setDate(1);

    while (firstTuesdayDate.getDay() !== 1) {
        firstTuesdayDate.setDate(firstTuesdayDate.getDate() + 1);
    }

    let thirdMonday = new Date(firstTuesdayDate);
    thirdMonday.setUTCDate(firstTuesdayDate.getDate() + 14);
    thirdMonday.setUTCHours(20, 0, 0, 0);

    const currentDate = new Date();
    // test date
    // const currentDate = new Date('October 17, 2022 16:00:00');
    console.log(currentDate);
    const isTodayMaintenance = thirdMonday.getUTCFullYear() === currentDate.getUTCFullYear() 
                            && thirdMonday.getUTCMonth() === currentDate.getUTCMonth() 
                            && thirdMonday.getUTCDate() === currentDate.getUTCDate();
    const is3DaysBeforeMaintenance = thirdMonday.getUTCFullYear() === currentDate.getUTCFullYear() 
                                  && thirdMonday.getUTCMonth() === currentDate.getUTCMonth() 
                                  && (thirdMonday.getUTCDate() - currentDate.getUTCDate() === 3);
    const is1DayBeforeMaintenance = thirdMonday.getUTCFullYear() === currentDate.getUTCFullYear() 
                                  && thirdMonday.getUTCMonth() === currentDate.getUTCMonth() 
                                  && (thirdMonday.getUTCDate() - currentDate.getUTCDate() === 1);
    const is2HoursBeforeMaintenance = isTodayMaintenance && (thirdMonday.getUTCHours() - currentDate.getUTCHours() === 2);
    const isMaintenance = isTodayMaintenance && (thirdMonday.getUTCHours() === currentDate.getUTCHours());
    const is1HourBeforeMaintenanceEnds = isTodayMaintenance && (thirdMonday.getUTCHours() + 1 === currentDate.getUTCHours());
    const isMaintenanceOver = isTodayMaintenance && (thirdMonday.getUTCHours() + 2 === currentDate.getUTCHours());
    // isTodayMaintenance 

    const thirdMondayMaintenanceEndDate = new Date(thirdMonday);
    thirdMondayMaintenanceEndDate.setUTCHours(thirdMonday.getUTCHours() + 2);

    if (is3DaysBeforeMaintenance) {
        tweetBody = `⚠️ Warning - In THREE days, the eAmusement Service will be undergoing extended maintenance, beginning ${thirdMonday.toLocaleString()} ET and ending ${thirdMondayMaintenanceEndDate.toLocaleString()} ET`;
        // post tweetBody if postedFlag value is false
        !postFlags.posted3DayWarning && postTweet(tweetBody);
        postFlags.posted3DayWarning = true;
    } else if (is1DayBeforeMaintenance) {
        tweetBody = `⚠️ Warning - The eAmusement Service will be undergoing extended maintenance beginning TOMORROW, ${thirdMonday.toLocaleString()} ET and ending ${thirdMondayMaintenanceEndDate.toLocaleString()} ET`;
        // post tweetBody if postedFlag value is false
        !postFlags.posted24HourWarning && postTweet(tweetBody);
        postFlags.posted24HourWarning = true;
    } else if (is2HoursBeforeMaintenance) {
        tweetBody = `🚨 Alert - In TWO hours, the eAmusement Service will be undergoing extended maintenance, beginning ${thirdMonday.toLocaleTimeString()} ET and ending ${thirdMondayMaintenanceEndDate.toLocaleTimeString()} ET`;
        // post tweetBody if postedFlag value is false
        !postFlags.posted2HourWarning && postTweet(tweetBody);
        postFlags.posted2HourWarning = true;
    } else if (isMaintenance) {
        tweetBody = `🚨 Alert - The eAmusement Service has started extended maintenance. eAmusement is expected to be back online at ${thirdMondayMaintenanceEndDate.toLocaleTimeString()} ET`;
        // post tweetBody if postedFlag value is false
        !postFlags.postedBeginsWarning && postTweet(tweetBody);
        postFlags.postedBeginsWarning = true;
    } else if (is1HourBeforeMaintenanceEnds) {
        tweetBody = `⚠️ Notice - The eAmusement Service is expected to be back online in ONE hour, at ${thirdMondayMaintenanceEndDate.toLocaleTimeString()} ET`;
        // post tweetBody if postedFlag value is false
        !postFlags.postedEndsIn1HourNotice && postTweet(tweetBody);
        postFlags.postedEndsIn1HourNotice = true;
    } else if (isMaintenanceOver) {
        tweetBody = `✅ Notice - The eAmusement Service is expected to be back online now`;
        // post tweetBody if postedFlag value is false
        !postFlags.postedEndedNotice && postTweet(tweetBody);
        postFlags.postedEndedNotice = true;
    }
    
    // to-do - prepare values for the next month.
    const readyToBeReset = Object.values(postFlags).every((flagValue) => {
        return flagValue === true;
    });


    return;
}

const dateCheckingHandler = setInterval(() => dateObserver(), 10000);