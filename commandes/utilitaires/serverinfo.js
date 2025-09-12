const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Affiche des informations sur le serveur'),
    async execute(interaction) {
        const { guild } = interaction;

        const emojis = guild.emojis.cache;
        const staticEmojis = emojis.filter(e => !e.animated);
        const animatedEmojis = emojis.filter(e => e.animated);
        
        const emojisList = staticEmojis.map(e => e.toString()).slice(0, 30).join(' ') || 'Aucun emoji';
        const animatedEmojisList = animatedEmojis.map(e => e.toString()).slice(0, 30).join(' ') || 'Aucun emoji animé';
        
        const roles = guild.roles.cache
            .sort((a, b) => b.position - a.position)
            .filter(role => role.name !== '@everyone')
            .map(role => role.toString())
            .slice(0, 30)
            .join(' ') || 'Aucun rôle';

        const boosts = guild.premiumSubscriptionCount;
        const boostLevel = guild.premiumTier;
        const boostStatus = `${boosts} (${boostLevel === 1 ? '`Niveau 1`' : boostLevel === 2 ? '`Niveau 2`' : boostLevel === 3 ? '`Niveau 3`' : '`Niveau 0`'})`;

        const embed = new EmbedBuilder()
            .setTitle(`📊 Informations sur ${guild.name}`)
            .setThumbnail(guild.iconURL({ dynamic: true, size: 512 }))
            .setColor('#00AAFF')
            .addFields(
                { name: '👑 Propriétaire', value: `<@${guild.ownerId}>`, inline: true },
                { name: '🆔 ID du serveur', value: guild.id, inline: true },
                { name: '📅 Créé le', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: false },
                { name: '👥 Membres', value: `${guild.memberCount}`, inline: true },
                { name: '💬 Salons', value: `${guild.channels.cache.size}`, inline: true },
                { name: '🚀 Boosts', value: boostStatus, inline: false },
                { name: `🧩 Rôles (${guild.roles.cache.size - 1})`, value: roles, inline: false },
                { name: `😄 Emojis (${staticEmojis.size})`, value: emojisList, inline: false },
                { name: `🤩 Emojis animés (${animatedEmojis.size})`, value: animatedEmojisList, inline: false }
            )
            .setFooter({ text: `Demandé par ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        if (guild.bannerURL()) {
            embed.setImage(guild.bannerURL({ size: 512 }));
        }

        await interaction.reply({ embeds: [embed] });
    }
};