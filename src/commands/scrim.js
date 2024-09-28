import { SlashCommandBuilder, PermissionsBitField, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, TimestampStyles, time } from 'discord.js';

export const command = {
    data: new SlashCommandBuilder()
    .setName("scrim")
    .setDescription("Gestion des scrims")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .addSubcommand( (subcommand) =>
        subcommand
        .setName("dispo")
        .setDescription("Demande les disponibilités des joueurs pour des horaires donnés")
        .addRoleOption( (option) =>
            option
            .setName("equipe")
            .setDescription("Role de l'équipe à mentionner")
            .setRequired(true)
        )
        .addStringOption( (option) =>
            option
            .setName("horaire1")
            .setDescription("Proposition d'horaire n°1")
            .setRequired(true)
        )
        .addStringOption( (option) =>
            option
            .setName("horaire2")
            .setDescription("Proposition d'horaire n°2")
            .setRequired(false)
        )
        .addStringOption( (option) =>
            option
            .setName("horaire3")
            .setDescription("Proposition d'horaire n°3")
            .setRequired(false)
        )
        .addStringOption( (option) =>
            option
            .setName("horaire4")
            .setDescription("Proposition d'horaire n°4")
            .setRequired(false)
        )
        .addStringOption( (option) =>
            option
            .setName("horaire5")
            .setDescription("Proposition d'horaire n°5")
            .setRequired(false)
        )
        .addStringOption( (option) =>
            option
            .setName("adversaire")
            .setDescription("Nom de l'équipe adverse")
            .setRequired(false)
        )
    )
    , async execute(interaction){

        const team = interaction.options.getRole("equipe");
        const opponent = interaction.options.getString("adversaire");

        let amount = 0
        
        switch(interaction.options.getSubcommand()){
            case "dispo":

                const embed = new EmbedBuilder()
                .setDescription(`${team}`);

                if(opponent) {
                    embed.setTitle(`Nouveau scrim contre ${opponent}`);
                } else {
                    embed.setTitle(`Nouveau scrim`);
                }

                const row = new ActionRowBuilder();

                for(let i = 1; i <= 5; i++){
                    const horaire = interaction.options.getString(`horaire${i}`);
                    if(horaire) {
                        amount++;

                        const datetime = horaire.split(" ");
                        const dmy = datetime[0].split("/");
                        const hm = datetime[1].split("h");

                        if(hm.length = 1) hm.push(0);

                        const scrimDateTime = Math.floor(new Date(dmy[2], dmy[1], dmy[0], hm[0], hm[1]).getTime() / 1000);

                        // Add the field in embed
                        embed.addFields(
                            { name: `Horaire n°${amount} : <t:${scrimDateTime}:f>`, value: `Disponible:\nPas disponible:\nPeut-être:\n` }
                        )

                        // Create the button
                        const button = new ButtonBuilder()
                        .setCustomId(`scrimH|||${amount}`)
                        .setLabel(`Horaire ${amount}`)
                        .setStyle(ButtonStyle.Success);

                        row.addComponents(button);
                    }
                }


                interaction.reply({
                    embeds: [embed],
                    components: [row]
                });
                break;
            default:
                return interaction.reply({
                    content: `Unkown interaction : ${interaction.options.getSubcommand()}`,
                    ephemeral: true
                });
        }
    }
}