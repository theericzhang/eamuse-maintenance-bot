/* eslint-disable no-unused-expressions */
class ExtendedMaintenanceObserver {
    #toLocaleTimeStringOptionsVerbose;

    #toLocaleTimeStringOptionsShortET;

    #toLocaleTimeStringOptionsShortPT;

    #toLocaleDateStringOptions;

    constructor() {
        this.extendedMaintenancePostedFlags = {
            posted3DayWarning: false,
            posted24HourWarning: false,
            posted2HourWarning: false,
            postedBeginsWarning: false,
            postedEndsIn1HourNotice: false,
            postedEndedNotice: false,
        };
        this.#toLocaleTimeStringOptionsVerbose = {
            timeZone: 'America/New_York',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        };
        this.#toLocaleTimeStringOptionsShortET = {
            timeZone: 'America/New_York',
            hour: '2-digit',
            minute: '2-digit',
        };
        this.#toLocaleTimeStringOptionsShortPT = {
            timeZone: 'America/Los_Angeles',
            hour: '2-digit',
            minute: '2-digit',
        };
        this.#toLocaleDateStringOptions = {
            timeZone: 'America/New_York',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        };
    }

    /**
     * Returns a relevant warning message for the Twitter/Discord Client to post
     * @param {number} index - The message bank contains an array of premade tweets to send. Specify an index to select the message
     * @param {string} dateOfMaintenance - The start date of the maintenance day, passed as a string. must be passed as .toLocaleString('en-US', toLocaleDateStringOptions)
     * @param {Date} timeStart - The time that extended maintenance starts. Must be passed as a pure date object
     * @param {Date} timeEnd - The time that extended maintenance ends. Must be passed as a pure date object
     * @returns {string} - Parsed message that contains the relevant time to the message
     */

    getMessage(index, dateOfMaintenance, timeStart, timeEnd) {
        const messageBodyBank = [
            `⚠️ Warning - In THREE days, the e-amusement Service will be undergoing extended maintenance:\n\nMonday, ${dateOfMaintenance}\nBegins: ${timeStart.toLocaleTimeString('en-US', this.#toLocaleTimeStringOptionsShortET)} ET / ${timeStart.toLocaleTimeString('en-US', this.#toLocaleTimeStringOptionsShortPT)} PT \nEnds: ${timeEnd.toLocaleTimeString('en-US', this.#toLocaleTimeStringOptionsShortET)} ET / ${timeEnd.toLocaleTimeString('en-US', this.#toLocaleTimeStringOptionsShortPT)} PT`,
            `⚠️ Warning - The e-amusement Service will be undergoing extended maintenance TOMORROW:\n\nMonday, ${dateOfMaintenance}\nBegins: ${timeStart.toLocaleTimeString('en-US', this.#toLocaleTimeStringOptionsShortET)} ET / ${timeStart.toLocaleTimeString('en-US', this.#toLocaleTimeStringOptionsShortPT)} PT \nEnds: ${timeEnd.toLocaleTimeString('en-US', this.#toLocaleTimeStringOptionsShortET)} ET / ${timeEnd.toLocaleTimeString('en-US', this.#toLocaleTimeStringOptionsShortPT)} PT`,
            `🚨 Alert - In TWO hours, the e-amusement Service will be starting extended maintenance:\n\nBegins: ${timeStart.toLocaleTimeString('en-US', this.#toLocaleTimeStringOptionsShortET)} ET / ${timeStart.toLocaleTimeString('en-US', this.#toLocaleTimeStringOptionsShortPT)} PT \nEnds: ${timeEnd.toLocaleTimeString('en-US', this.#toLocaleTimeStringOptionsShortET)} ET / ${timeEnd.toLocaleTimeString('en-US', this.#toLocaleTimeStringOptionsShortPT)} PT`,
            `🚨 Alert - The e-amusement Service has started extended maintenance. e-amusement is expected to be back online at ${timeEnd.toLocaleTimeString('en-US', this.#toLocaleTimeStringOptionsShortET)} ET / ${timeEnd.toLocaleTimeString('en-US', this.#toLocaleTimeStringOptionsShortPT)} PT`,
            `⚠️ Notice - The e-amusement Service is expected to be back online in ONE hour, at ${timeEnd.toLocaleTimeString('en-US', this.#toLocaleTimeStringOptionsShortET)} ET / ${timeEnd.toLocaleTimeString('en-US', this.#toLocaleTimeStringOptionsShortPT)} PT`,
            '✅ Notice - The e-amusement Service is expected to be back online now',
        ];
        return messageBodyBank[index];
    }

    /**
     * Helper function to post messageBody. This function is called when all timing conditions are met
     * @param {string} messageBody - The body message to be sent to Twitter
     */

    postMessage(messageBody) {
        // await clientMain.v1.tweet(messageBody);
        console.log('Posted! - ', messageBody);
        console.log('Flags - ', this.this.extendedMaintenancePostedFlags);
    }

    /**
     * Resets all truth flags used to guard the postTweet() function.
     * @returns {void} - all truth flags from extendedMaintenancePostedFlags will be set to false
     */

    resetFlags() {
    // eslint-disable-next-line no-return-assign
        Object.keys(this.extendedMaintenancePostedFlags).forEach((flag) => this.extendedMaintenancePostedFlags[flag] = false);
    }

    /**
     * extendedMaintenanceObserver is called every 6 seconds to create a current Date object to compare to
     * the expected Extended Maintenance day. Extended Maintenance falls on every third Tuesday from 02:00 to 07:00 JST,
     * which falls on the Monday prior from 12:00 - 17:00 EST.
     * @returns {void}. Sends a Tweet to the eamuse_schedule Twitter account.
     */

    extendedMaintenanceObserver() {
        let messageBody = '';
        const referenceDate = new Date();
        const timezoneOffsetJapanUTC = 9;

        // adding 9 to hour count to reflect JST
        referenceDate.setUTCHours(referenceDate.getUTCHours() + timezoneOffsetJapanUTC);
        referenceDate.setUTCDate(1);
        // console.log('reference date before finding tuesday - expected to be the 1st every time: ' ,referenceDate);

        // finds first tuesday and sets referenceDate to it
        while (referenceDate.getUTCDay() !== 2) {
            referenceDate.setUTCDate(referenceDate.getUTCDate() + 1);
        }
        // console.log('reference date after finding tuesday - expected to be the first tuesday every time: ',referenceDate);

        // getting extended maintenance day, which is the third tuesday in Japan. Just add 14 to our recently set referenceDate
        const extendedMaintenanceDay = new Date(referenceDate.setUTCDate(referenceDate.getUTCDate() + 14));
        // console.log('extended maintenance day in JP', extendedMaintenanceDay);

        // create new time object representing current time in JST
        const currentDate = new Date();
        currentDate.setHours(currentDate.getHours() + timezoneOffsetJapanUTC);
        // console.log('current time in JP', currentDate);

        // begin date comparisons - Because our extendedMaintenanceDay date object is set on the third tuesday, we can reference our currentDate object to post warnings
        // when getting values, it is mandatory to getUTC__, otherwise it will show in UTC +0 values
        // calling getUTC__ will provide us with time local to Japan, UTC +9
        const is3DaysBeforeExtendedMaintenance = extendedMaintenanceDay.getUTCFullYear() === currentDate.getUTCFullYear()
                                          && extendedMaintenanceDay.getUTCMonth() === currentDate.getUTCMonth()
                                          && (extendedMaintenanceDay.getUTCDate() - currentDate.getUTCDate() === 3)
                                          && (extendedMaintenanceDay.getUTCHours() === 0)
                                          && (extendedMaintenanceDay.getUTCMinutes() === 0);
        const is1DayBeforeExtendedMaintenance = extendedMaintenanceDay.getUTCFullYear() === currentDate.getUTCFullYear()
                                          && extendedMaintenanceDay.getUTCMonth() === currentDate.getUTCMonth()
                                          && (extendedMaintenanceDay.getUTCDate() - currentDate.getUTCDate() === 1)
                                          && (extendedMaintenanceDay.getUTCHours() === 0)
                                          && (extendedMaintenanceDay.getUTCMinutes() === 0);
        const isTodayExtendedMaintenance = extendedMaintenanceDay.getUTCFullYear() === currentDate.getUTCFullYear()
                                    && extendedMaintenanceDay.getUTCMonth() === currentDate.getUTCMonth()
                                    && extendedMaintenanceDay.getUTCDate() === currentDate.getUTCDate();

        /**
     * begin time comparisons - Because the time portion to extendedMaintenanceDay is set in JST, we can manually check to see if the hours fall on maintenance times
     * extended maintenance happens from 2am-7am JST
     * an additional condition, isPastExtendedMaintenance is needed to determine if all the flags are safe to reset
     * flags are used to guard the postMessage() function. if a tweet has not been posted yet, its flag value will be false.
     * after a tweet has been posted, the flag value will be set to true.
     * the next time the extendedMaintenanceObserver() will be run, postMessage() will not be run again.
     */

        const is2HoursBeforeExtendedMaintenance = isTodayExtendedMaintenance && (extendedMaintenanceDay.getUTCHours() === 0 && extendedMaintenanceDay.getUTCMinutes() === 0);
        const isExactlyExtendedMaintenance = isTodayExtendedMaintenance && (extendedMaintenanceDay.getUTCHours() === 2 && extendedMaintenanceDay.getUTCMinutes() === 0);
        const is1HourBeforeExtendedMaintenanceEnds = isTodayExtendedMaintenance && (extendedMaintenanceDay.getUTCHours() === 6 && extendedMaintenanceDay.getUTCMinutes() === 0);
        const extendedMaintenanceEnds = isTodayExtendedMaintenance && (extendedMaintenanceDay.getUTCHours() === 7 && extendedMaintenanceDay.getUTCMinutes() < 1);
        const isPastExtendedMaintenance = isTodayExtendedMaintenance && (extendedMaintenanceDay.getUTCHours() === 7 && extendedMaintenanceDay.getUTCMinutes() >= 1);

        // Create an extended maintenance day time start object and set it to 02:00 JST (17:00 UTC +0)
        const extendedMaintenanceDayTimeStart = new Date(extendedMaintenanceDay);
        extendedMaintenanceDayTimeStart.setUTCHours(17, 0, 0, 0);

        // Create an extended maintenance day time end object and set it to 07:00 JST (22:00 UTC +0)
        const extendedMaintenanceDayTimeEnd = new Date(extendedMaintenanceDay);
        extendedMaintenanceDayTimeEnd.setUTCHours(22, 0, 0, 0);

        /**
     * Set the date one day behind to reflect the Monday before the third Tuesday.
     * These date objects, containing when extended maintenance will begin and end in the US/NY timezone,
     * will be passed to getMessage(). These will NOT be used to compare extended maintenance dates to current date.
     */

        extendedMaintenanceDayTimeStart.setDate(extendedMaintenanceDayTimeEnd.getDate() - 1);
        extendedMaintenanceDayTimeEnd.setDate(extendedMaintenanceDayTimeEnd.getDate() - 1);

        // checking if conditions we set are true. if they are, set the messageBody, postMessage, and set the flags to true.
        if (is3DaysBeforeExtendedMaintenance) {
            messageBody = this.getMessage(
                0,
                extendedMaintenanceDayTimeStart.toLocaleString('en-US', this.#toLocaleDateStringOptions),
                extendedMaintenanceDayTimeStart,
                extendedMaintenanceDayTimeEnd,
            );
            // post messageBody if postedFlag value is false
            !this.extendedMaintenancePostedFlags.posted3DayWarning && postMessage(messageBody);
            this.extendedMaintenancePostedFlags.posted3DayWarning = true;
        } else if (is1DayBeforeExtendedMaintenance) {
            messageBody = this.getMessage(
                1,
                extendedMaintenanceDayTimeStart.toLocaleString('en-US', this.#toLocaleDateStringOptions),
                extendedMaintenanceDayTimeStart,
                extendedMaintenanceDayTimeEnd,
            );
            // post messageBody if postedFlag value is false
            !this.extendedMaintenancePostedFlags.posted24HourWarning && postMessage(messageBody);
            this.extendedMaintenancePostedFlags.posted24HourWarning = true;
        } else if (is2HoursBeforeExtendedMaintenance) {
            messageBody = this.getMessage(
                2,
                extendedMaintenanceDayTimeStart.toLocaleString('en-US', this.#toLocaleDateStringOptions),
                extendedMaintenanceDayTimeStart,
                extendedMaintenanceDayTimeEnd,
            );
            // post messageBody if postedFlag value is false
            !this.extendedMaintenancePostedFlags.posted2HourWarning && postMessage(messageBody);
            this.extendedMaintenancePostedFlags.posted2HourWarning = true;
        } else if (isExactlyExtendedMaintenance) {
            messageBody = this.getMessage(
                3,
                extendedMaintenanceDayTimeStart.toLocaleString('en-US', this.#toLocaleDateStringOptions),
                extendedMaintenanceDayTimeStart,
                extendedMaintenanceDayTimeEnd,
            );
            // post messageBody if postedFlag value is false
            !this.extendedMaintenancePostedFlags.postedBeginsWarning && postMessage(messageBody);
            this.extendedMaintenancePostedFlags.postedBeginsWarning = true;
        } else if (is1HourBeforeExtendedMaintenanceEnds) {
            messageBody = this.getMessage(
                4,
                extendedMaintenanceDayTimeStart.toLocaleString('en-US', this.#toLocaleDateStringOptions),
                extendedMaintenanceDayTimeStart,
                extendedMaintenanceDayTimeEnd,
            );
            // post messageBody if postedFlag value is false
            !this.extendedMaintenancePostedFlags.postedEndsIn1HourNotice && postMessage(messageBody);
            this.extendedMaintenancePostedFlags.postedEndsIn1HourNotice = true;
        } else if (extendedMaintenanceEnds) {
            messageBody = this.getMessage(
                5,
                extendedMaintenanceDayTimeStart.toLocaleString('en-US', this.#toLocaleDateStringOptions),
                extendedMaintenanceDayTimeStart,
                extendedMaintenanceDayTimeEnd,
            );
            // post messageBody if postedFlag value is false
            !this.extendedMaintenancePostedFlags.postedEndedNotice && !isPastExtendedMaintenance && postMessage(messageBody);
            this.extendedMaintenancePostedFlags.postedEndedNotice = true;
        }

        console.log('maintenance in US/NY starts:', extendedMaintenanceDayTimeStart.toLocaleString('en-US', this.#toLocaleTimeStringOptionsVerbose));
        console.log('maintenance in US/NY ends:', extendedMaintenanceDayTimeEnd.toLocaleString('en-US', this.#toLocaleTimeStringOptionsVerbose));

        console.log('maintenance in JP/TOKYO starts:', extendedMaintenanceDayTimeStart.toLocaleString('en-US', { ...this.#toLocaleTimeStringOptionsVerbose, timeZone: 'Asia/Tokyo' }));
        console.log('maintenance in JP/TOKYO ends:', extendedMaintenanceDayTimeEnd.toLocaleString('en-US', { ...this.#toLocaleTimeStringOptionsVerbose, timeZone: 'Asia/Tokyo' }));
        console.log('\n');

        // check that all flags are true. this will signal that flags are ready to be reset.
        const readyToBeReset = Object.values(this.extendedMaintenancePostedFlags).every((flagValue) => flagValue === true);

        // reset the flags, making sure to also check that it's past maintenance.
        readyToBeReset && isPastExtendedMaintenance && this.resetFlags();
    }
}

export default ExtendedMaintenanceObserver;
