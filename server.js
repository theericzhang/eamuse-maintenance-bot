import { TwitterApi } from "twitter-api-v2";
import express from "express";
import "dotenv/config";

const app = express();

// expecting json
app.use(express.json());

app.get("/", (req, res) => {
    res.send("twitter-eamuse-warn");
});

app.listen(process.env.PORT || 5000, () => {
    console.log(`App listening`);
})

// create a Twitter client with apikey+secret & accesstoken+secret
// twitter account with elevated developer permissions is REQUIRED to use v1.tweet() functions
// https://developer.twitter.com/en/docs/twitter-api/v1/tweets/post-and-engage/api-reference/post-statuses-update
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
    Object.keys(extendedMaintenancePostedFlags).forEach((flag) => extendedMaintenancePostedFlags[flag] = false);
}

// helper function to post tweetBody
// postTweet() is called when timing conditions are met
async function postTweet(tweetBody) {
    await clientMain.v1.tweet(tweetBody);
    console.log('Posted! - ', tweetBody);
}

// key observer function that handles date + time checking for extended maintenance periods
async function extendedMaintenanceObserver() {
    let tweetBody = '';
    const referenceDate = new Date();
    const timezoneOffsetJapanUTC = 9;

    // adding 9 to hour count to reflect JST
    referenceDate.setUTCHours(referenceDate.getUTCHours() + timezoneOffsetJapanUTC);
    // console.log(referenceDate);
    referenceDate.setUTCDate(1);
    console.log('reference date before finding tuesday - expected to be the 1st every time: ' ,referenceDate);

    // finds first tuesday and sets referenceDate to it
    while (referenceDate.getUTCDay() !== 2) {
        console.log('should set here');
        referenceDate.setUTCDate(referenceDate.getUTCDate() + 1);
    }
    console.log('reference date after finding tuesday - expected to be the first tuesday every time: ',referenceDate);
    // getting extended maintenance day, which is the third tuesday in Japan. Just add 14 to our recently set referenceDate
    const extendedMaintenanceDay = new Date(referenceDate.setUTCDate(referenceDate.getUTCDate() + 14));
    console.log('extended ',extendedMaintenanceDay);

    // create new time object representing current time in JST
    const currentDate = new Date();
    currentDate.setHours(currentDate.getHours() + timezoneOffsetJapanUTC);
    console.log('current ', currentDate);

    // begin date comparisons - Because our extendedMaintenanceDay date object is set on the third tuesday, we can reference our currentDate object to post warnings
    // when getting values, it is mandatory to getUTC__, otherwise it will show in UTC +0 values
    // calling getUTC__ will provide us with time local to Japan, UTC +9
    const is3DaysBeforeExtendedMaintenance = extendedMaintenanceDay.getUTCFullYear() === currentDate.getUTCFullYear() 
                                          && extendedMaintenanceDay.getUTCMonth() === currentDate.getUTCMonth() 
                                          && (extendedMaintenanceDay.getUTCDate() - currentDate.getUTCDate() === 3);
    const is1DayBeforeExtendedMaintenance = extendedMaintenanceDay.getUTCFullYear() === currentDate.getUTCFullYear() 
                                          && extendedMaintenanceDay.getUTCMonth() === currentDate.getUTCMonth() 
                                          && (extendedMaintenanceDay.getUTCDate() - currentDate.getUTCDate() === 1);
    const isTodayExtendedMaintenance = extendedMaintenanceDay.getUTCFullYear() === currentDate.getUTCFullYear() 
                                    && extendedMaintenanceDay.getUTCMonth() === currentDate.getUTCMonth() 
                                    && extendedMaintenanceDay.getUTCDate() === currentDate.getUTCDate();
    
    // begin time comparisons - Because the time portion to extendedMaintenanceDay is set in JST, we can manually check to see if the hours fall on maintenance times
    // extended maintenance happens from 2am-7am JST
    // an additional condition, isPastExtendedMaintenance is needed to determine if all the flags are safe to reset
    // flags are used to guard the postTweet() function. if a tweet has not been posted yet, its flag value will be false. 
    // after a tweet has been posted, the flag value will be set to true.
    // the next time the extendedMaintenanceObserver() will be run, postTweet() will not be run again.
    const is2HoursBeforeExtendedMaintenance = isTodayExtendedMaintenance && (extendedMaintenanceDay.getUTCHours() === 0);
    const isExactlyExtendedMaintenance = isTodayExtendedMaintenance && (extendedMaintenanceDay.getUTCHours() === 2);
    const is1HourBeforeExtendedMaintenanceEnds = isTodayExtendedMaintenance && (extendedMaintenanceDay.getUTCHours() === 6);
    const extendedMaintenanceEnds = isTodayExtendedMaintenance && (extendedMaintenanceDay.getUTCHours() === 7 && extendedMaintenanceDay.getUTCMinutes() < 1);
    const isPastExtendedMaintenance = isTodayExtendedMaintenance && (extendedMaintenanceDay.getUTCHours() === 7 && extendedMaintenanceDay.getUTCMinutes() >= 1);
    
    const extendedMaintenanceDayTimeStart = new Date(extendedMaintenanceDay);
    // 1PM ET
    extendedMaintenanceDayTimeStart.setUTCHours(17, 0, 0, 0);

    console.log('maintenance starts: ', extendedMaintenanceDayTimeStart.toLocaleString('en-US', { timeZone: 'America/New_York', year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'}));

    const extendedMaintenanceDayTimeEnd = new Date(extendedMaintenanceDay);
    // 6PM ET
    extendedMaintenanceDayTimeEnd.setUTCHours(22, 0, 0, 0);

    console.log('maintenance ends: ', extendedMaintenanceDayTimeEnd.toLocaleString('en-US', { timeZone: 'America/New_York', year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'}));

    extendedMaintenanceDayTimeStart.setDate(extendedMaintenanceDayTimeEnd.getDate() - 1);
    extendedMaintenanceDayTimeEnd.setDate(extendedMaintenanceDayTimeEnd.getDate() - 1);

    // checking if conditions we set are true. if they are, set the tweetBody, postTweet, and set the flags to true.
    if (is3DaysBeforeExtendedMaintenance) {
        tweetBody = `⚠️ Warning - In THREE days, the eAmusement Service will be undergoing extended maintenance, beginning Monday ${extendedMaintenanceDayTimeStart.toLocaleString('en-US', { timeZone: 'America/New_York', year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'})} ET and ending at ${extendedMaintenanceDayTimeEnd.toLocaleTimeString('en-US', { timeZone: 'America/New_York'})} ET`;
        // post tweetBody if postedFlag value is false
        !extendedMaintenancePostedFlags.posted3DayWarning && postTweet(tweetBody);
        extendedMaintenancePostedFlags.posted3DayWarning = true;
    } else if (is1DayBeforeExtendedMaintenance) {
        tweetBody = `⚠️ Warning - The eAmusement Service will be undergoing extended maintenance beginning TOMORROW, Monday ${extendedMaintenanceDayTimeStart.toLocaleString('en-US', { timeZone: 'America/New_York', year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'})} ET and ending at ${extendedMaintenanceDayTimeEnd.toLocaleTimeString('en-US', { timeZone: 'America/New_York'})} ET`;
        // post tweetBody if postedFlag value is false
        !extendedMaintenancePostedFlags.posted24HourWarning && postTweet(tweetBody);
        extendedMaintenancePostedFlags.posted24HourWarning = true;
    } else if (is2HoursBeforeExtendedMaintenance) {
        tweetBody = `🚨 Alert - In TWO hours, the eAmusement Service will be starting extended maintenance, beginning at ${extendedMaintenanceDayTimeStart.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit',
        minute: '2-digit'})} ET and ending at ${extendedMaintenanceDayTimeEnd.toLocaleTimeString('en-US', { timeZone: 'America/New_York'})} ET`;
        // post tweetBody if postedFlag value is false
        !extendedMaintenancePostedFlags.posted2HourWarning && postTweet(tweetBody);
        extendedMaintenancePostedFlags.posted2HourWarning = true;
    } else if (isExactlyExtendedMaintenance) {
        tweetBody = `🚨 Alert - The eAmusement Service has started extended maintenance. eAmusement is expected to be back online at ${extendedMaintenanceDayTimeEnd.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit',
        minute: '2-digit'})} ET`;
        // post tweetBody if postedFlag value is false
        !extendedMaintenancePostedFlags.postedBeginsWarning && postTweet(tweetBody);
        extendedMaintenancePostedFlags.postedBeginsWarning = true;
    } else if (is1HourBeforeExtendedMaintenanceEnds) {
        tweetBody = `⚠️ Notice - The eAmusement Service is expected to be back online in ONE hour, at ${extendedMaintenanceDayTimeEnd.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit',
        minute: '2-digit'})} ET`;
        // post tweetBody if postedFlag value is false
        !extendedMaintenancePostedFlags.postedEndsIn1HourNotice && postTweet(tweetBody);
        extendedMaintenancePostedFlags.postedEndsIn1HourNotice = true;
    } else if (extendedMaintenanceEnds) {
        tweetBody = `✅ Notice - The eAmusement Service is expected to be back online now`;
        // post tweetBody if postedFlag value is false
        !extendedMaintenancePostedFlags.postedEndedNotice && !isPastExtendedMaintenance && postTweet(tweetBody);
        extendedMaintenancePostedFlags.postedEndedNotice = true;
    }

    // check that all flags are true. this will signal that flags are ready to be reset.
    const readyToBeReset = Object.values(extendedMaintenancePostedFlags).every((flagValue) => {
        return flagValue === true;
    });

    // reset the flags, making sure to also check that it's past maintenance. 
    // why? there is an edge case that it is 7:00am JST and 
    readyToBeReset && isPastExtendedMaintenance && resetFlags();
    console.log('\n');
    return;
}

const dateCheckingHandler = setInterval(() => extendedMaintenanceObserver(), 6000);