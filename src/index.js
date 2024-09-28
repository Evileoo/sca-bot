import { Client, GatewayIntentBits, Collection } from 'discord.js';
import fs from 'fs';

// Create client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});

// Create commands collection
client.commands = new Collection();
const commands = fs.readdirSync("./src/commands").filter(file => file.endsWith(".js"));
for(let command of commands){
    const commandFile = await import(`./commands/${command}`);
    client.commands.set(commandFile.command.data.name, commandFile.command);
}

// Create buttons collection
client.buttons = new Collection();
const buttons = fs.readdirSync("./src/buttons").filter(file => file.endsWith(".js"));
for(let button of buttons){
    const buttonFile = await import(`./buttons/${button}`);
    client.buttons.set(button.split(".")[0], buttonFile.button);
}

// Create modals collection
client.modals = new Collection();
const modals = fs.readdirSync("./src/modals").filter(file => file.endsWith(".js"));
for(let modal of modals){
    const modalFile = await import(`./modals/${modal}`);
    client.modals.set(modal.split(".")[0], modalFile.modal);
}

// Read events
const events = fs.readdirSync("./src/events").filter(file => file.endsWith(".js"));
for(let event of events){
    const eventFile = await import(`./events/${event}`);
    if(eventFile.event.once){
        client.once(eventFile.event.name, (...args) => {
            eventFile.event.execute(...args);
        });
    } else {
        client.on(eventFile.event.name, (...args) => {
            eventFile.event.execute(...args);
        });
    }
}

client.on('error', (error) => {
    console.error('Erreur détectée:', error);
});

client.on('shardError', (error) => {
    console.error('Erreur de Shard:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Rejection non gérée à:', promise, 'raison:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Exception non gérée:', error);
    process.exit(1); // Restart the bot if necessary
});

client.on('disconnect', () => {
    console.warn('Le bot a été déconnecté.');
});

client.on('reconnecting', () => {
    console.info('Le bot se reconnecte...');
});

// Login
await client.login(process.env.TOKEN);