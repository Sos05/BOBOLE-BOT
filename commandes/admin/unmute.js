const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Unmute un utilisateur')
        .addUserOption(option =>
            option.setName('membre')
                .setDescription('Le membre à unmute')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('raison')
                .setDescription('La raison de l\'unmute')
                .setRequired(false)
        ),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
            await interaction.reply({ content: '❌ Vous n\'avez pas la permission de unmute des membres.', flags: 64 });
            return;
        }

        const user = interaction.options.getUser('membre');
        const reason = interaction.options.getString('raison') || 'Aucune raison fournie';

        const member = interaction.guild.members.cache.get(user.id);
        if (!member) {
            await interaction.reply({ content: '❌ Utilisateur introuvable.', flags: 64 });
            return;
        }

        if (!member.isCommunicationDisabled()) {
            await interaction.reply({ content: '❌ Ce membre n\'est pas mute.', flags: 64 });
            return;
        }

        try {
            await member.timeout(null, reason);

            const unmuteEmbed = new EmbedBuilder()
                .setColor('#32CD32')
                .setTitle('🔊 Unmute d\'un membre')
                .setDescription(`**${user.tag}** a été unmute.`)
                .addFields(
                    { name: 'Raison', value: reason, inline: true },
                    { name: 'Unmute par', value: `${interaction.user.tag}`, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Unmute réalisé avec succès', iconURL: interaction.client.user.displayAvatarURL() });

            await interaction.reply({ embeds: [unmuteEmbed] });
        } catch {
            await interaction.reply({ content: '❌ Erreur lors de l\'unmute de l\'utilisateur.', flags: 64 });
        }
    },
};
