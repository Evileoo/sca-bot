import { SlashCommandBuilder, PermissionsBitField, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, GuildScheduledEventManager, GuildScheduledEventPrivacyLevel, GuildScheduledEventEntityType, ChannelType } from 'discord.js';

export const command = {
    data: new SlashCommandBuilder()
    .setName("match")
    .setDescription("Gestion des matchs")
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
        .addStringOption( (option) =>
            option
            .setName("type")
            .setDescription("Type de match")
            .addChoices(
                { name: `scrim`, value: `scrim` },
                { name: `showmatch`, value: `showmatch` },
                { name: `tournoi`, value: `tournoi` },
                { name: `match`, value: `match` },
            )
        )
    )
    .addSubcommand( (subcommand) =>
        subcommand
        .setName("date")
        .setDescription("Envoie un message avec les horaires d'un match")
        .addRoleOption( (option) =>
            option
            .setName("equipe")
            .setDescription("Role de l'équipe à mentionner")
            .setRequired(true)
        )
        .addStringOption( (option) =>
            option
            .setName("horaire")
            .setDescription("Heure du match")
            .setRequired(true)
        )
        .addChannelOption( (option) =>
            option
            .setName("channel")
            .setDescription("Channel vocal dans lequel les joueurs ont rendez vous")
            .setRequired(true)
        )
        .addStringOption( (option) =>
            option
            .setName("adversaire")
            .setDescription("Nom de l'équipe adverse")
            .setRequired(false)
        )
        .addStringOption( (option) =>
            option
            .setName("opgg")
            .setDescription("opgg de l'équipe adverse")
            .setRequired(false)
        )
        .addStringOption( (option) =>
            option
            .setName("type")
            .setDescription("Type de match")
            .addChoices(
                { name: `scrim`, value: `scrim` },
                { name: `showmatch`, value: `showmatch` },
                { name: `tournoi`, value: `match de tournoi` },
                { name: `match`, value: `match` },
            )
        )
    )
    , async execute(interaction){

        const team = interaction.options.getRole("equipe");
        const opponent = interaction.options.getString("adversaire");
        const type = (interaction.options.getString("type")) ? interaction.options.getString("type") : `match`;

        const embed = new EmbedBuilder();
        const row = new ActionRowBuilder();
        
        switch(interaction.options.getSubcommand()){
            case "dispo":

                embed.setDescription(`<@&${team.id}>`);

                if(opponent) {
                    embed.setTitle(`Nouveau ${type} contre ${opponent}`);
                } else {
                    embed.setTitle(`Nouveau ${type}`);
                }

                let amount = 0;

                for(let i = 1; i <= 5; i++){
                    const horaire = interaction.options.getString(`horaire${i}`);
                    if(horaire) {
                        amount++;

                        try {
                            const datetime = horaire.split(" ");
                            const dmy = datetime[0].split("/");
                            const hm = datetime[1].split("h");

                            if(hm.length == 1) hm.push(0);

                            const matchDateTime = Math.floor(new Date(dmy[2], dmy[1], dmy[0], hm[0], hm[1]).getTime() / 1000);

                            // Add the field in embed
                            embed.addFields(
                                { name: `Horaire n°${amount} : <t:${matchDateTime}:f>`, value: `Disponible:\nPas disponible:\nPeut-être:\n` }
                            )

                            // Create the button
                            const button = new ButtonBuilder()
                            .setCustomId(`match|||${amount}`)
                            .setLabel(`Horaire ${amount}`)
                            .setStyle(ButtonStyle.Success);

                            row.addComponents(button);
                        } catch(error) {
                            return interaction.reply({
                                content: `date mal saisie.\nLe format de la date doit ressembler à ceci : \`05/06/2023 15h30\``,
                                ephemeral: true
                            });
                        }
                    }
                }

                await interaction.reply({
                    embeds: [embed],
                    components: [row]
                });
                break;
            case "date":

                const horaire = interaction.options.getString("horaire");
                const opgg = interaction.options.getString("opgg");
                const channel = interaction.options.getChannel("channel");

                if(channel.ChannelType != ChannelType.Voice){
                    return interaction.reply({
                        content: `Le channnel fourni n'est pas un channnel vocal`,
                        ephemeral: true
                    });
                }

                const datetime = horaire.split(" ");
                const dmy = datetime[0].split("/");
                const hm = datetime[1].split("h");

                if(hm.length = 1) hm.push(0);

                const matchDateTime1 = new Date(dmy[2], dmy[1], dmy[0], hm[0], hm[1]).getTime();
                const matchDateTime2 = Math.floor(new Date(dmy[2], dmy[1], dmy[0], hm[0], hm[1]).getTime() / 1000);

                embed
                .setDescription(`${team}`)
                .addFields(
                    {name: `${type} le <t:${matchDateTime2}:f>`, value: `Présence en vocal 30 minutes avant le début demandée pour préparer la draft`}
                )

                if(opgg){
                    embed.addFields({name: `opgg des adversaires`, value: `[lien](${opgg})`});

                    const button = new ButtonBuilder()
                    .setCustomId(`opgg|||edit`)
                    .setLabel(`Modifier l'opgg`)
                    .setStyle(ButtonStyle.Secondary);
                
                    row.addComponents(button);
                } else {
                    const button = new ButtonBuilder()
                    .setCustomId(`opgg|||add`)
                    .setLabel(`Ajouter l'opgg`)
                    .setStyle(ButtonStyle.Primary);
                
                    row.addComponents(button);
                }

                console.log(team);

                let eventDescriptionMessage = "";
                if(opponent) {
                    embed.setTitle(`Nouveau ${type} contre ${opponent}`);
                    eventDescriptionMessage = `${type} contre ${opponent}`
                } else {
                    embed.setTitle(`Nouveau ${type}`);
                }

                const event = new GuildScheduledEventManager(interaction.guild);

                const newEvent = await event.create({
                    name: `${type} de ${team.name}`,
                    scheduledStartTime: matchDateTime1,
                    privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
                    entityType: GuildScheduledEventEntityType.Voice,
                    description: `${eventDescriptionMessage}`,
                    channel: channel.id
                });

                console.log(newEvent.id);

                embed.addFields({ name: `Évènement discord`, value: `[lien](https://discord.com/events/${interaction.guild.id}/${newEvent.id})` });

                await interaction.reply({
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