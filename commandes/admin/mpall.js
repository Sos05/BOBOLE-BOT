const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mpall')
        .setDescription('Envoyer un message privé à tous les membres du serveur')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Le message à envoyer')
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            await interaction.reply({ content: 'Vous devez être administrateur pour utiliser cette commande.', flags: MessageFlags.Ephemeral });
            return;
        }

        const messageContent = interaction.options.getString('message');

        const promises = [];
        interaction.guild.members.cache.forEach(member => {
            if (!member.user.bot && member.permissions.has(PermissionsBitField.Flags.ViewChannel)) {
                promises.push(
                    member.send(messageContent).then(() => {
                        console.log(`Message envoyé à ${member.user.tag}`);
                    }).catch(error => {
                        console.error(`Impossible d'envoyer un message à ${member.user.tag}. Erreur :`, error);
                    })
                );
            }
        });

        try {
            await Promise.all(promises);
            await interaction.reply({ content: 'Message envoyé à tous les membres du serveur.', flags: MessageFlags.Ephemeral });
        } catch (error) {
            console.error('Erreur lors de l\'envoi des messages aux membres :', error);
            await interaction.reply({ content: 'Une erreur est survenue lors de l\'envoi du message.', flags: MessageFlags.Ephemeral });
        }
    },
};
