import ics from 'ics';
import { writeFileSync, existsSync } from 'fs';

/**
 *
 * @param {Object<Date>} nextMaintenanceDate - The object containing a maintenance date start date, start time, and end time.
 * @returns {string} - An ICS Filepath that will be streamed to the channel.
 */
export default function generateICS(nextMaintenanceDate) {
    const icsCreator = ics;
    const dateStart = nextMaintenanceDate.dateStartUTC;
    const dateEnd = nextMaintenanceDate.dateEndUTC;

    // check to see if ics file has been written already
    if (!existsSync(`${process.cwd()}/eamuse_mtn_${dateStart.toLocaleString('en-US', {
        dateStyle: 'medium',
    })}_reminder.ics`)) {
        icsCreator.createEvent({
            title: 'e-amusement Extended Maintenance',
            description: 'e-amusement Service will be down during this time',
            start: [
                dateStart.getUTCFullYear(),
                dateStart.getUTCMonth() + 1,
                dateStart.getUTCDate(),
                dateStart.getUTCHours(),
                dateStart.getUTCMinutes(),
            ],
            startInputType: 'utc',
            end: [
                dateEnd.getUTCFullYear(),
                dateEnd.getUTCMonth() + 1,
                dateEnd.getUTCDate(),
                dateEnd.getUTCHours(),
                dateEnd.getUTCMinutes(),
            ],
        }, (error, value) => {
            if (error) {
                console.log(error);
            }
            // write file to vm
            writeFileSync(`${process.cwd()}/eamuse_mtn_${dateStart.toLocaleString('en-US', {
                dateStyle: 'medium',
            })}_reminder.ics`, value);
        });
    } else {
        console.log('already made file, returning existing file');
    }
    return `${process.cwd()}/eamuse_mtn_${dateStart.toLocaleString('en-US', {
        dateStyle: 'medium',
    })}_reminder.ics`;
}
