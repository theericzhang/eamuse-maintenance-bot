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

// manual flags to chain?
let postFlags = {
    posted3DayWarning : false,
    posted24HourWarning : false,
    posted2HourWarning : false,
    postedBeginsWarning : false,
    postedEndsIn1HourNotice : false,
    postedEndedNotice : false
};

const daysOfTheWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
]

function dateObserver() {
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
    // const currentDate = new Date('October 18, 2022');
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
        tweetBody = `⚠️Warning - In THREE days, the eAmusement Service will be undergoing extended maintenance, beginning ${thirdMonday.toLocaleString()} ET and ending ${thirdMondayMaintenanceEndDate.toLocaleString()} ET`;
        postFlags.posted3DayWarning = true;
    } else if (is1DayBeforeMaintenance) {
        tweetBody = `⚠️Warning - The eAmusement Service will be undergoing extended maintenance beginning TOMORROW, ${thirdMonday.toLocaleString()} ET and ending ${thirdMondayMaintenanceEndDate.toLocaleString()} ET`;
        postFlags.posted24HourWarning = true;
    } else if (is2HoursBeforeMaintenance) {
        tweetBody = `🚨Alert - In TWO hours, the eAmusement Service will be undergoing extended maintenance, beginning ${thirdMonday.toLocaleTimeString()} ET and ending ${thirdMondayMaintenanceEndDate.toLocaleTimeString()} ET`;
        postFlags.posted2HourWarning = true;
    } else if (isMaintenance) {
        tweetBody = `🚨Alert - The eAmusement Service has started extended maintenance. eAmusement is expected to be back online at ${thirdMondayMaintenanceEndDate.toLocaleTimeString()} ET`;
        postFlags.postedBeginsWarning = true;
    } else if (is1HourBeforeMaintenanceEnds) {
        tweetBody = `⚠️Notice - The eAmusement Service is expected to be back online in ONE hour, at ${thirdMondayMaintenanceEndDate.toLocaleTimeString()} ET`;
        postFlags.postedEndsIn1HourNotice = true;
    } else if (isMaintenanceOver) {
        tweetBody = `✅Notice - The eAmusement Service is expected to be back online now`;
        postFlags.postedEndedNotice = true;
    }
    
    const readyToBeReset = Object.values(postFlags).every((flagValue) => {
        return flagValue === true;
    })

    console.log(readyToBeReset);

    return;
}

const dateCheckingHandler = setInterval(() => dateObserver(), 3000);

// await clientMain.v1.tweet('hello! this is a test');