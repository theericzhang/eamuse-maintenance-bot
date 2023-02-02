import * as dotenv from 'dotenv';
import {
    Client, GatewayIntentBits, REST, Routes,
} from 'discord.js';

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

// log in and make the bot online
client.login(TOKEN);

// function to fire after the bot has logged in
client.on('ready', () => {
    console.log(`${client.user.tag} has logged in`);

    // find a channel called maintenance-reminders
    const maintenanceReminderChannel = client.channels.cache.find((channel) => channel.name === 'maintenance-reminders');
    console.log(maintenanceReminderChannel.id);
    maintenanceReminderChannel.send('We launched!');
});

// function to fire any time a message is created
client.on('messageCreate', (message) => {
    console.log(message.content);
});

client.on('interactionCreate', (interaction) => {
    if (interaction.isChatInputCommand()) {
        interaction.reply({ content: 'Wassupp' });
        console.log('Hello World');
    }
});

async function main() {
    const commands = [
        {
            name: 'getnextmaintenance',
            description: 'Returns the date and time of the NEXT e-amusement extended maintenance period',
        },
    ];

    try {
        console.log('Started refreshing application (/) commands.');
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
            body: commands,
        });
    } catch (e) {
        console.error(e);
    }
}

main();
