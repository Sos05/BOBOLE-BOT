const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');

function parseDuration(durationString) {
    const timeRegex = /^(\d+)([smh])$/;
    const match = durationString.toLowerCase().match(timeRegex);
    if (!match) return null;
    const value = parseInt(match[1]);
    const unit = match[2];
    switch (unit) {
        case 's': return value * 1000;
        case 'm': return value * 1000 * 60;
        case 'h': return value * 1000 * 60 * 60;
        default: return null;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('selfdeco')
        .setDescription('Vous déconnecte du salon vocal après une durée définie.')
        .addStringOption(option =>
            option.setName('duree')
                .setDescription('La durée avant la déconnexion (ex: 10s, 5m, 2h).')
                .setRequired(true)),

    async execute(interaction) {
        if (interaction.isButton()) {
            if (interaction.customId === 'selfdeco_cancel') {
                const timer = interaction.client.timeouts.get(interaction.user.id);
                if (timer) {
                    clearTimeout(timer);
                    interaction.client.timeouts.delete(interaction.user.id);

                    const embed = new EmbedBuilder()
                        .setColor('#e74c3c')
                        .setTitle('⏱️ Déconnexion Annulée')
                        .setDescription('La déconnexion programmée a bien été annulée.');
                    
                    await interaction.update({ embeds: [embed], components: [] });
                } else {
                    await interaction.update({ content: 'Le timer a déjà expiré ou a été annulé.', components: [] });
                }
            }
            return;
        }

        const { member, guild, user, client } = interaction;
        const durationString = interaction.options.getString('duree');

        const voiceChannel = member.voice.channel;
        if (!voiceChannel) {
            return interaction.reply({ content: '❌ Vous devez être dans un salon vocal.', flags: [MessageFlags.Ephemeral] });
        }

        const durationMs = parseDuration(durationString);
        if (!durationMs) {
            return interaction.reply({ content: '❌ Format de durée invalide (ex: `30m`).', flags: [MessageFlags.Ephemeral] });
        }
        if (durationMs > 2147483647) {
            return interaction.reply({ content: '❌ La durée est trop longue !', flags: [MessageFlags.Ephemeral] });
        }

        const timer = setTimeout(async () => {
            const currentMember = await guild.members.fetch(user.id).catch(() => null);
            if (currentMember && currentMember.voice.channelId === voiceChannel.id) {
                await currentMember.voice.setChannel(null, 'Déconnexion programmée.');
                await user.send(`👋 Vous avez été déconnecté(e) du salon **${voiceChannel.name}** comme demandé.`).catch(() => {});
            }
            client.timeouts.delete(user.id);
        }, durationMs);

        client.timeouts.set(user.id, timer);

        const disconnectTime = Math.floor((Date.now() + durationMs) / 1000);
        const embed = new EmbedBuilder()
            .setColor('#2ecc71')
            .setTitle('⏱️ Déconnexion Programmée')
            .setDescription(`Je vous déconnecterai du salon **${voiceChannel.name}** dans **${durationString}** (<t:${disconnectTime}:R>).`);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('selfdeco_cancel')
                .setLabel('Annuler')
                .setStyle(ButtonStyle.Danger)
        );

        await interaction.reply({ embeds: [embed], components: [row], flags: [MessageFlags.Ephemeral] });
    },
};