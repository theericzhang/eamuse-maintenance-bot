// import 'dotenv/config';
// import { REST } from '@discordjs/rest';
// import { Routes } from 'discord-api-types/v9';
// import { Client, Intents, Collection } from 'discord.js';
// import * as fs from 'fs';
// import * as path from 'path';

// const client = new Client({
//     intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
// });

// const commands = [];
// client.commands = new Collection();

// const commandsPath = path.join(__dirname, 'commands');
// const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

// for (const file of commandFiles) {
//     const filePath = path.join(commandsPath, file);
//     const command = filePath;

//     client.commands.set(command.padStart.name,)
// }

import * as dotenv from 'dotenv';
import { Client } from 'discord.js';
import express from 'express';

dotenv.config();

const client = new Client({
    intents: ['Guilds', 'GuildMessages'],
});

client.login(process.env.DISCORD_BOT_TOKEN);
