const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField, EmbedBuilder } = require('discord.js');

function parseDuration(input) {
    if (!input) return null;
    const match = input.match(/^(\d+)(s|m|h|d)$/);
    if (!match) return null;

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
        case 's': return value * 1000;
        case 'm': return value * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        case 'd': return value * 24 * 60 * 60 * 1000;
        default: return null;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mute un utilisateur')
        .addUserOption(option =>
            option.setName('membre')
                .setDescription('Le membre à mute')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('temps')
                .setDescription('Durée du mute (ex: 10m, 2h, 3d)')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('raison')
                .setDescription('La raison du mute')
                .setRequired(false)
        ),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
            await interaction.reply({ content: '❌ Vous n\'avez pas la permission de mute des membres.', flags: 64 });
            return;
        }

        const user = interaction.options.getUser('membre');
        const durationInput = interaction.options.getString('temps');
        const reason = interaction.options.getString('raison') || 'Aucune raison fournie';

        if (!durationInput) {
            await interaction.reply({ content: '❌ Vous devez spécifier une durée pour le mute.', flags: 64 });
            return;
        }

        const duration = parseDuration(durationInput);
        if (!duration) {
            await interaction.reply({ content: '❌ Durée invalide. Utilisez par exemple : 10m, 2h, 3d.', flags: 64 });
            return;
        }

        const member = interaction.guild.members.cache.get(user.id);
        if (!member) {
            await interaction.reply({ content: '❌ Utilisateur introuvable.', flags: 64 });
            return;
        }

        if (member.isCommunicationDisabled()) {
            await interaction.reply({ content: '❌ Ce membre est déjà mute.', flags: 64 });
            return;
        }

        try {
            await member.timeout(duration, reason);

            const muteEmbed = new EmbedBuilder()
                .setColor('#FFA500')
                .setTitle('🔇 Mute d\'un membre')
                .setDescription(`**${user.tag}** a été mute.`)
                .addFields(
                    { name: 'Raison', value: reason, inline: true },
                    { name: 'Muté par', value: `${interaction.user.tag}`, inline: true },
                    { name: 'Durée', value: durationInput, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Mute réalisé avec succès', iconURL: interaction.client.user.displayAvatarURL() });

            await interaction.reply({ embeds: [muteEmbed] });
        } catch {
            await interaction.reply({ content: '❌ Erreur lors du mute de l\'utilisateur.', flags: 64 });
        }
    },
};
