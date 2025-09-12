const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clearuser')
        .setDescription('Supprime un certain nombre de messages d’un utilisateur dans ce salon')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L’utilisateur dont les messages seront supprimés')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('nombre')
                .setDescription('Nombre de messages à supprimer (1 à 100)')
                .setRequired(true)),
    
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({
                content: '❌ Vous n’avez pas la permission de gérer les messages.',
                flags: MessageFlags.Ephemeral
            });
        }

        const user = interaction.options.getUser('utilisateur');
        const amount = interaction.options.getInteger('nombre');

        if (amount < 1 || amount > 100) {
            return interaction.reply({
                content: '❌ Le nombre doit être entre 1 et 100.',
                flags: MessageFlags.Ephemeral
            });
        }

        const channel = interaction.channel;

        try {
            const messages = await channel.messages.fetch({ limit: 100 });

            const userMessages = messages
                .filter(msg => msg.author.id === user.id)
                .first(amount);

            if (userMessages.length === 0) {
                return interaction.reply({
                    content: `❌ Aucun message récent de ${user.tag} trouvé dans ce salon.`,
                    flags: MessageFlags.Ephemeral
                });
            }

            await channel.bulkDelete(userMessages, true);

            return interaction.reply({
                content: `✅ ${userMessages.length} messages de ${user.tag} ont été supprimés.`,
                flags: MessageFlags.Ephemeral
            });

        } catch (error) {
            console.error('Erreur lors de la suppression des messages :', error);
            return interaction.reply({
                content: '⚠️ Une erreur est survenue lors de la suppression des messages.',
                flags: MessageFlags.Ephemeral
            });
        }
    },
};
