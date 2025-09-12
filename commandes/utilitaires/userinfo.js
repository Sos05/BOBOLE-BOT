const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Affiche des informations sur l\'utilisateur')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur dont vous voulez les informations')
                .setRequired(false)),
    async execute(interaction) {
        const user = interaction.options.getUser('utilisateur') || interaction.user;
        const member = interaction.guild.members.cache.get(user.id);
        
        const createdAt = `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`;
        
        const embed = new EmbedBuilder()
            .setColor('#2E86C1')
            .setTitle(`👤 Informations sur ${user.username}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: '✨ Nom d\'utilisateur', value: user.username, inline: true },
                { name: '🆔 ID', value: user.id, inline: true },
                { name: '📅 Compte créé le', value: createdAt, inline: false },
            )
            .setTimestamp()
            .setFooter({ text: 'Informations utilisateur', iconURL: interaction.client.user.displayAvatarURL() });

        if (member) {
            const joinedAt = `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`;
            const memberRoles = member.roles.cache.filter(role => role.name !== '@everyone').map(role => role.toString()).join(', ') || 'Aucun rôle';

            embed.addFields(
                { name: '📥 Serveur rejoint le', value: joinedAt, inline: false },
                { name: `🎭 Rôles (${member.roles.cache.size - 1})`, value: memberRoles, inline: false }
            );

            if (member.premiumSince) {
                const boostedSince = `<t:${Math.floor(member.premiumSinceTimestamp / 1000)}:F>`;
                embed.addFields({ name: '💎 Statut de Boost', value: `✨ Boost depuis le ${boostedSince}`, inline: false });
            } else {
                embed.addFields({ name: '💎 Statut de Boost', value: '❌', inline: false });
            }
        }

        await interaction.reply({ embeds: [embed] });
    },
};