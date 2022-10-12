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

// create a Twitter client with apikey+secret & accesstoken+secret
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
let extendedMaintenancePostedFlags = {
    posted3DayWarning : false,
    posted24HourWarning : false,
    posted2HourWarning : false,
    postedBeginsWarning : false,
    postedEndsIn1HourNotice : false,
    postedEndedNotice : false
};

function resetFlags() {
    Object.keys(extendedMaintenancePostedFlags).forEach((flag) => extendedMaintenancePostedFlags[flag] = true);
}

// helper function to post tweetBody
async function postTweet(tweetBody) {
    await clientMain.v1.tweet(tweetBody);
    console.log('Posted! - ', tweetBody);
}

async function dateObserverExtendedMaintenance() {
    let tweetBody = ``;

    const firstTuesdayDate = new Date();
    // console.log(firstTuesdayDate);
    firstTuesdayDate.setUTCDate(1);

    // 
    while (firstTuesdayDate.getDay() !== 2) {
        firstTuesdayDate.setDate(firstTuesdayDate.getDate() + 1);
    }

    let thirdTuesday = new Date(firstTuesdayDate);
    thirdTuesday.setUTCDate(firstTuesdayDate.getDate() + 14);
    thirdTuesday.setUTCHours(20, 0, 0, 0);

    const currentDate = new Date();
    // test date
    // const currentDate = new Date('October 17, 2022 18:00:00');
    // console.log(currentDate);
    const isTodayMaintenance = thirdTuesday.getUTCFullYear() === currentDate.getUTCFullYear() 
                            && thirdTuesday.getUTCMonth() === currentDate.getUTCMonth() 
                            && thirdTuesday.getUTCDate() === currentDate.getUTCDate();
    const is3DaysBeforeMaintenance = thirdTuesday.getUTCFullYear() === currentDate.getUTCFullYear() 
                                  && thirdTuesday.getUTCMonth() === currentDate.getUTCMonth() 
                                  && (thirdTuesday.getUTCDate() - currentDate.getUTCDate() === 3);
    const is1DayBeforeMaintenance = thirdTuesday.getUTCFullYear() === currentDate.getUTCFullYear() 
                                  && thirdTuesday.getUTCMonth() === currentDate.getUTCMonth() 
                                  && (thirdTuesday.getUTCDate() - currentDate.getUTCDate() === 1);
    const is2HoursBeforeMaintenance = isTodayMaintenance && (thirdTuesday.getUTCHours() - currentDate.getUTCHours() === 2);
    const isMaintenance = isTodayMaintenance && (thirdTuesday.getUTCHours() === currentDate.getUTCHours());
    const is1HourBeforeMaintenanceEnds = isTodayMaintenance && (thirdTuesday.getUTCHours() + 1 === currentDate.getUTCHours());
    const isMaintenanceOver = isTodayMaintenance && (thirdTuesday.getUTCHours() + 2 === currentDate.getUTCHours());
    // isTodayMaintenance 

    const thirdTuesdayMaintenanceEndDate = new Date(thirdTuesday);
    thirdTuesdayMaintenanceEndDate.setUTCHours(thirdTuesday.getUTCHours() + 2);

    if (is3DaysBeforeMaintenance) {
        tweetBody = `⚠️ Warning - In THREE days, the eAmusement Service will be undergoing extended maintenance, beginning ${thirdTuesday.toLocaleString()} ET and ending ${thirdTuesdayMaintenanceEndDate.toLocaleString()} ET`;
        // post tweetBody if postedFlag value is false
        !extendedMaintenancePostedFlags.posted3DayWarning && postTweet(tweetBody);
        extendedMaintenancePostedFlags.posted3DayWarning = true;
    } else if (is1DayBeforeMaintenance) {
        tweetBody = `⚠️ Warning - The eAmusement Service will be undergoing extended maintenance beginning TOMORROW, ${thirdTuesday.toLocaleString()} ET and ending ${thirdTuesdayMaintenanceEndDate.toLocaleString()} ET`;
        // post tweetBody if postedFlag value is false
        !extendedMaintenancePostedFlags.posted24HourWarning && postTweet(tweetBody);
        extendedMaintenancePostedFlags.posted24HourWarning = true;
    } else if (is2HoursBeforeMaintenance) {
        tweetBody = `🚨 Alert - In TWO hours, the eAmusement Service will be undergoing extended maintenance, beginning ${thirdTuesday.toLocaleTimeString()} ET and ending ${thirdTuesdayMaintenanceEndDate.toLocaleTimeString()} ET`;
        // post tweetBody if postedFlag value is false
        !extendedMaintenancePostedFlags.posted2HourWarning && postTweet(tweetBody);
        extendedMaintenancePostedFlags.posted2HourWarning = true;
    } else if (isMaintenance) {
        tweetBody = `🚨 Alert - The eAmusement Service has started extended maintenance. eAmusement is expected to be back online at ${thirdTuesdayMaintenanceEndDate.toLocaleTimeString()} ET`;
        // post tweetBody if postedFlag value is false
        !extendedMaintenancePostedFlags.postedBeginsWarning && postTweet(tweetBody);
        extendedMaintenancePostedFlags.postedBeginsWarning = true;
    } else if (is1HourBeforeMaintenanceEnds) {
        tweetBody = `⚠️ Notice - The eAmusement Service is expected to be back online in ONE hour, at ${thirdTuesdayMaintenanceEndDate.toLocaleTimeString()} ET`;
        // post tweetBody if postedFlag value is false
        !extendedMaintenancePostedFlags.postedEndsIn1HourNotice && postTweet(tweetBody);
        extendedMaintenancePostedFlags.postedEndsIn1HourNotice = true;
    } else if (isMaintenanceOver) {
        tweetBody = `✅ Notice - The eAmusement Service is expected to be back online now`;
        // post tweetBody if postedFlag value is false
        !extendedMaintenancePostedFlags.postedEndedNotice && postTweet(tweetBody);
        extendedMaintenancePostedFlags.postedEndedNotice = true;
    }
    
    // to-do - prepare values for the next month.
    const readyToBeReset = Object.values(extendedMaintenancePostedFlags).every((flagValue) => {
        return flagValue === true;
    });


    return;
}

async function extendedMaintenanceObserver() {
    let tweetBody = '';
    const referenceDate = new Date();
    const timezoneOffsetJapanUTC = 9;

    // adding 9 to hour count to reflect JST
    referenceDate.setHours(referenceDate.getHours() + timezoneOffsetJapanUTC);
    // console.log(referenceDate);
    referenceDate.setUTCDate(1);
    // console.log(referenceDate);

    while (referenceDate.getDay() !== 2) {
        referenceDate.setDate(referenceDate.getDate() + 1);
    }
    // getting extended maintenance day, which is the third tuesday in Japan. Just add 14 to our current date
    const extendedMaintenanceDay = new Date(referenceDate.setDate(referenceDate.getDate() + 14));
    console.log('extended ',extendedMaintenanceDay);

    const currentDate = new Date();
    currentDate.setHours(currentDate.getHours() + timezoneOffsetJapanUTC);
    console.log('current ', currentDate);

    // when getting values, it is mandatory to getUTC__, because otherwise it will show in UTC +0 values.
    // calling getUTC__ will provide us with time local to Japan, UTC+9

    const is3DaysBeforeExtendedMaintenance = extendedMaintenanceDay.getUTCFullYear() === currentDate.getUTCFullYear() 
                                          && extendedMaintenanceDay.getUTCMonth() === currentDate.getUTCMonth() 
                                          && (extendedMaintenanceDay.getUTCDate() - currentDate.getUTCDate() === 3);
    const is1DayBeforeExtendedMaintenance = extendedMaintenanceDay.getUTCFullYear() === currentDate.getUTCFullYear() 
                                          && extendedMaintenanceDay.getUTCMonth() === currentDate.getUTCMonth() 
                                          && (extendedMaintenanceDay.getUTCDate() - currentDate.getUTCDate() === 1);
    const isTodayExtendedMaintenance = extendedMaintenanceDay.getUTCFullYear() === currentDate.getUTCFullYear() 
                                    && extendedMaintenanceDay.getUTCMonth() === currentDate.getUTCMonth() 
                                    && extendedMaintenanceDay.getUTCDate() === currentDate.getUTCDate();
    // extended maintenance from 2am 7am JST
    const is2HoursBeforeExtendedMaintenance = isTodayExtendedMaintenance && (extendedMaintenanceDay.getUTCHours() === 0);
    const isExactlyExtendedMaintenance = isTodayExtendedMaintenance && (extendedMaintenanceDay.getUTCHours() === 2);
    const is1HourBeforeExtendedMaintenanceEnds = isTodayExtendedMaintenance && (extendedMaintenanceDay.getUTCHours() === 6);
    const extendedMaintenanceEnds = isTodayExtendedMaintenance && (extendedMaintenanceDay.getUTCHours() === 7);
    const isPastExtendedMaintenance = isTodayExtendedMaintenance && (extendedMaintenanceDay.getUTCHours() === 7 && extendedMaintenanceDay.getUTCMinutes() >= 1);
    
    const extendedMaintenanceDayTimeStart = new Date(extendedMaintenanceDay);
    // 1PM ET
    extendedMaintenanceDayTimeStart.setUTCHours(17, 0, 0, 0);

    console.log(extendedMaintenanceDayTimeStart.toLocaleString());

    const extendedMaintenanceDayTimeEnd = new Date(extendedMaintenanceDay);
    // 6PM ET
    extendedMaintenanceDayTimeEnd.setUTCHours(22, 0, 0, 0);

    console.log(extendedMaintenanceDayTimeEnd.toLocaleString());

    if (is3DaysBeforeExtendedMaintenance) {
        tweetBody = `⚠️Warning - In THREE days, the eAmusement Service will be undergoing extended maintenance, beginning ${extendedMaintenanceDayTimeStart.toLocaleString()} ET and ending at ${extendedMaintenanceDayTimeEnd.toLocaleTimeString()} ET`;
        // post tweetBody if postedFlag value is false
        !extendedMaintenancePostedFlags.posted3DayWarning && postTweet(tweetBody);
        extendedMaintenancePostedFlags.posted3DayWarning = true;
    } else if (is1DayBeforeExtendedMaintenance) {
        tweetBody = `⚠️ Warning - The eAmusement Service will be undergoing extended maintenance beginning TOMORROW, ${extendedMaintenanceDayTimeStart.toLocaleString()} ET and ending at ${extendedMaintenanceDayTimeEnd.toLocaleTimeString()} ET`;
        // post tweetBody if postedFlag value is false
        !extendedMaintenancePostedFlags.posted24HourWarning && postTweet(tweetBody);
        extendedMaintenancePostedFlags.posted24HourWarning = true;
    } else if (is2HoursBeforeExtendedMaintenance) {
        tweetBody = `🚨 Alert - In TWO hours, the eAmusement Service will be starting extended maintenance, beginning at ${extendedMaintenanceDayTimeStart.toLocaleTimeString()} ET and ending at ${extendedMaintenanceDayTimeEnd.toLocaleTimeString()} ET`;
        // post tweetBody if postedFlag value is false
        !extendedMaintenancePostedFlags.posted2HourWarning && postTweet(tweetBody);
        extendedMaintenancePostedFlags.posted2HourWarning = true;
    } else if (isExactlyExtendedMaintenance) {
        tweetBody = `🚨 Alert - The eAmusement Service has started extended maintenance. eAmusement is expected to be back online at ${extendedMaintenanceDayTimeEnd.toLocaleTimeString()} ET`;
        // post tweetBody if postedFlag value is false
        !extendedMaintenancePostedFlags.postedBeginsWarning && postTweet(tweetBody);
        extendedMaintenancePostedFlags.postedBeginsWarning = true;
    } else if (is1HourBeforeExtendedMaintenanceEnds) {
        tweetBody = `⚠️ Notice - The eAmusement Service is expected to be back online in ONE hour, at ${extendedMaintenanceDayTimeEnd.toLocaleTimeString()} ET`;
        // post tweetBody if postedFlag value is false
        !extendedMaintenancePostedFlags.postedEndsIn1HourNotice && postTweet(tweetBody);
        extendedMaintenancePostedFlags.postedEndsIn1HourNotice = true;
    } else if (extendedMaintenanceEnds) {
        tweetBody = `✅ Notice - The eAmusement Service is expected to be back online now`;
        // post tweetBody if postedFlag value is false
        !extendedMaintenancePostedFlags.postedEndedNotice && postTweet(tweetBody);
        extendedMaintenancePostedFlags.postedEndedNotice = true;
    }

    // to-do - prepare values for the next month.
    // (once all flags are true) we create a boolean that reflects all flags = true
    const readyToBeReset = Object.values(extendedMaintenancePostedFlags).every((flagValue) => {
        return flagValue === true;
    });

    // if it's ready to be reset, reset the flags. 
    readyToBeReset && isPastExtendedMaintenance && resetFlags();
    return;
}

const dateCheckingHandler = setInterval(() => extendedMaintenanceObserver(), 6000);