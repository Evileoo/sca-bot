import { REST, Routes } from 'discord.js';
import fs from 'fs';

refresh();

// Deploy commands
async function refresh(){
    const commands = [];
    const commandFiles = fs.readdirSync(`./src/commands`).filter(file => file.endsWith(`.js`));

    for(const file of commandFiles){
        const command = await import(`./commands/${file}`);
        commands.push(command.command.data.toJSON());
    }

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    
    // Load commands on Skillcamp Ambition
    try{

        console.log(`Deleting all applications (/) commands on Skillcamp Ambition.`);

        await rest.put(Routes.applicationGuildCommands(process.env.APPID, process.env.GUILD), { body: [] })
	    .then(() => console.log('Successfully deleted all guild commands on Skillcamp Ambition.'))
	    .catch(console.error);

        console.log(`Refreshing ${commands.length} applications (/) commands on Skillcamp Ambition.`);

        const data = await rest.put(
            Routes.applicationGuildCommands(process.env.APPID, process.env.GUILD),
            { body: commands }
        );

        console.log(`Successfully loaded ${data.length} applications (/) commands on Skillcamp Ambition.`);
    } catch(err){
        console.error(err);
    }
}