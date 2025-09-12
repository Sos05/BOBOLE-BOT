const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Supprime un nombre de messages dans le salon actuel')
        .addIntegerOption(option =>
            option.setName('nombre')
                .setDescription('Nombre de messages à supprimer (max 100)')
                .setRequired(true)),

    async execute(interaction) {
        const amount = interaction.options.getInteger('nombre');

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({
                content: '❌ Vous n\'avez pas la permission de gérer les messages.',
                flags: MessageFlags.Ephemeral
            });
        }

        if (amount < 1 || amount > 100) {
            return interaction.reply({
                content: '⚠️ Vous devez spécifier un nombre entre 1 et 100.',
                flags: MessageFlags.Ephemeral
            });
        }

        try {
            const messages = await interaction.channel.bulkDelete(amount, true);
            await interaction.reply({
                content: `✅ ${messages.size} messages supprimés.`,
                flags: MessageFlags.Ephemeral
            });
        } catch (error) {
            console.error('Erreur lors de la suppression des messages :', error);
            await interaction.reply({
                content: '❌ Une erreur est survenue lors de la suppression des messages.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
