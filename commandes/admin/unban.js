const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Débannit un utilisateur du serveur')
        .addStringOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'ID de l\'utilisateur à débannir')
                .setRequired(true)
        ),

    async execute(interaction) {
        if (!interaction.guild) {
            await interaction.reply({
                content: '❌ Cette commande doit être utilisée dans un serveur.',
                flags: 64
            });
            return;
        }

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            await interaction.reply({
                content: '❌ Vous n\'avez pas la permission de débannir des membres.',
                flags: 64
            });
            return;
        }

        const userId = interaction.options.getString('utilisateur');

        try {
            await interaction.guild.members.unban(userId);
            await interaction.reply({
                content: `✅ L'utilisateur avec l'ID **${userId}** a été débanni.`,
                flags: 64
            });
        } catch {
            await interaction.reply({
                content: '❌ Utilisateur non trouvé ou pas banni.',
                flags: 64
            });
        }
    },
};
