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
        console.log('Flags - ', this.extendedMaintenancePostedFlags);
    }
}

export default ExtendedMaintenanceObserver;
