import { Events } from 'discord.js';

export const event = {
    name: Events.InteractionCreate,
    async execute(interaction){
		// Check interaction type
        if (interaction.isChatInputCommand()){
			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}

			try {
				await command.execute(interaction);
			} catch (error) {
				console.error(`Error executing ${interaction.commandName}`);
				console.error(error);
			}
		} else if (interaction.isButton()) {

			const buttonData = interaction.customId.split("|||");

			const button = interaction.client.buttons.get(buttonData[0]);

			if(!button) console.error(`No button matching ${interaction.buttonData[0]} was found.`);

			try {
				await button.execute(interaction, buttonData);
			} catch(error) {
				console.error(`Error executing ${interaction.customId}`);
				console.error(error);
			}
		} else {
			interaction.reply({
				content: `I don't know what you did, but this message isn't supposed to be shown`,
				ephemeral: true
			});

			console.error(interaction);

			return;
		}
    }
}