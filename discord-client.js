/* eslint-disable import/extensions */
import * as dotenv from 'dotenv';
import {
    Client,
    GatewayIntentBits,
    REST,
    Routes,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
} from 'discord.js';
// import dateCheckingHandler from './helper-functions/observer/eamuse-observer.js';
import ExtendedMaintenanceObserver from './helper-functions/observer/eamuse-observer-class.js';
import generateICS from './helper-functions/ics-generator/ics-generator.js';

dotenv.config();
const TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const GUILD_ID = process.env.DISCORD_GUILD_ID;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const rest = new REST({ version: '10' }).setToken(TOKEN);

// log in and put the bot online. create an instance of the ExtendedMaintenanceObserver.
client.login(TOKEN);
const myObserver = new ExtendedMaintenanceObserver();

function globalPostAllServers(messagePayload) {
    // TODO: figure out how to get next maintenance date AFTER current has passed. e.g. EM on 2/20/23, EM concludes, user does /getnextmaintenancedate, how do we get the march date?
    const icsFilePath = generateICS(myObserver.nextMaintenanceDate);
    const embedReply = new EmbedBuilder();
    if (messagePayload.format === 'AS-IS') {
        embedReply.setTitle(messagePayload.message);
        embedReply.addFields(
            { name: 'Date', value: myObserver.nextMaintenanceDate.date },
            { name: 'Begin time', value: myObserver.nextMaintenanceDate.start, inline: true },
            { name: 'End time', value: myObserver.nextMaintenanceDate.end, inline: true },
        );
        embedReply.setTimestamp();
        embedReply.setFooter({ text: 'created by @anericzhang', iconURL: 'https://pbs.twimg.com/profile_images/1582126074384760856/EoddMKBj_x96.jpg' });
    } else if (messagePayload.format === 'ONLY-MESSAGE') {
        embedReply.setTitle(messagePayload.message);
        embedReply.setTimestamp();
        embedReply.setFooter({ text: 'created by @anericzhang', iconURL: 'https://pbs.twimg.com/profile_images/1582126074384760856/EoddMKBj_x96.jpg' });
    }

    // find a channel called maintenance-reminders and send a test message
    client.guilds.cache.forEach((guild) => {
        const targetChannel = guild.channels.cache.find((channel) => channel.name === 'maintenance-reminders');
        // targetChannel.send(messagePayload.message);
        // eslint-disable-next-line no-unused-expressions
        messagePayload.attachICS
            ? targetChannel.send({ embeds: [embedReply], files: [icsFilePath] })
            : targetChannel.send({ embeds: [embedReply] });
    });
}

// start observer function
// eslint-disable-next-line no-unused-vars
const interval = setInterval(() => myObserver.extendedMaintenanceObserver(globalPostAllServers), 1000);

// function to fire after the bot has logged in
client.on('ready', () => {
    console.log(`${client.user.tag} has logged in`);
    // globalPostAllServers(`number of servers this bot is in: ${client.guilds.cache.size}`);
});

// function to fire any time a message is created
client.on('messageCreate', (message) => {
    console.log(message.content);
});

const sendCalendarReminder = new ButtonBuilder()
    .setCustomId('primary')
    .setLabel('Send me a calendar reminder!')
    .setStyle(ButtonStyle.Primary);
const actionRow = new ActionRowBuilder()
    .addComponents(sendCalendarReminder);

// respond to button click
client.on('interactionCreate', (interaction) => {
    if (!interaction.isButton()) return;
    console.log(interaction);
    const icsFilePath = generateICS(myObserver.nextMaintenanceDate);
    interaction.reply({ files: [icsFilePath], ephemeral: true });
});

client.on('interactionCreate', (interaction) => {
    if (!interaction.isChatInputCommand()) {
        return;
    }

    const inputCommand = interaction.commandName;
    const embedReply = new EmbedBuilder();

    if (inputCommand === 'getnextmaintenance') {
        // get the next maintenance period
        // const icsFilePath = generateICS(myObserver.nextMaintenanceDate);
        embedReply.setTitle('📅 Next Extended Maintenance Date: ');
        embedReply.addFields(
            { name: 'Date', value: myObserver.nextMaintenanceDate.date },
            { name: 'Begin time', value: myObserver.nextMaintenanceDate.start, inline: true },
            { name: 'End time', value: myObserver.nextMaintenanceDate.end, inline: true },
        );
        embedReply.setTimestamp();
        embedReply.setFooter({ text: 'created by @anericzhang', iconURL: 'https://pbs.twimg.com/profile_images/1582126074384760856/EoddMKBj_x96.jpg' });
        interaction.reply({ embeds: [embedReply], components: [actionRow], ephemeral: true });
    }
});

const arrayOfGuilds = client.guilds.cache;
console.log(arrayOfGuilds);

async function main() {
    const commands = [
        {
            name: 'getnextmaintenance',
            description: 'Returns the date and time of the NEXT e-amusement extended maintenance period.',
        },
        {
            name: 'doessomethingelse',
            description: 'Does something else.',
        },
    ];

    try {
        console.log('Started refreshing application (/) commands.');
        // use guild specific version when testing, and global version when ready for production
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
            body: commands,
        });
        // await rest.put(Routes.applicationCommands(CLIENT_ID), {
        //     body: commands,
        // });
    } catch (e) {
        console.error(e);
    }
}

main();
