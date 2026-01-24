const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, getVoiceConnection, AudioPlayerStatus } = require('@discordjs/voice');

const radioStations = [
    { label: 'Lofi', description: 'Radio Lofi pour se détendre et étudier.', value: 'http://usa9.fastcast4u.com/proxy/jamz', emoji: '🎧' },
    { label: 'Europe 2', description: 'Le meilleur de la pop, rock et électro.', value: 'http://europe2.lmn.fm/europe2.mp3', emoji: '🎸' },
    { label: 'Chérie FM', description: 'Les plus belles musiques pop et love.', value: 'https://streaming.nrjaudio.fm/ouuku85n3nje?origine=fluxurlradio', emoji: '💕' },
    { label: 'France Inter', description: 'Radio généraliste, culture et débats.', value: 'http://direct.franceinter.fr/live/franceinter-lofi.mp3', emoji: '📻' },
    { label: 'Franceinfo', description: 'L\'actualité en direct, 24h/24.', value: 'http://direct.franceinfo.fr/live/franceinfo-lofi.mp3', emoji: '📰' },
    { label: 'Fun Radio', description: 'Le son dancefloor.', value: 'http://streaming.radio.funradio.fr/fun-1-44-128', emoji: '🎉' },
    { label: 'Mouv\'', description: 'Radio rap, hip-hop et nouvelles cultures.', value: 'http://icecast.radiofrance.fr/mouv-hifi.aac', emoji: '🎤' },
    { label: 'NRJ', description: 'Hit Music Only !', value: 'https://streaming.nrjaudio.fm/oumvmk8fnozc?origine=fluxurlradio', emoji: '🔥' },
    { label: 'RTL', description: 'Première radio généraliste de France.', value: 'http://streaming.radio.rtl.fr/rtl-1-44-128', emoji: '📻' },
    { label: 'Skyrock', description: 'Premier sur le rap.', value: 'http://icecast.skyrock.net/s/natio_mp3_128k', emoji: '🚀' }
];

function createSelectMenu() {
    return new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('radio_select')
            .setPlaceholder('Choisissez une radio dans la liste')
            .addOptions(radioStations.map(radio => ({
                label: radio.label,
                description: radio.description,
                value: radio.value,
                emoji: radio.emoji,
            })))
    );
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('radio')
        .setDescription('Lance le lecteur de radio.'),

    async execute(interaction) {
        const guild = interaction.guild;
        const client = interaction.client;
        const voiceChannel = interaction.member.voice.channel;

        if (interaction.isCommand()) {
            const embed = new EmbedBuilder()
                .setTitle('📻 Radio du serveur')
                .setDescription('Sélectionnez une station dans le menu ci-dessous pour commencer à écouter.')
                .setColor('#3498db')
                .setImage('https://media.discordapp.net/attachments/1258169145145888820/1267862024982630472/standard.gif');

            await interaction.reply({ embeds: [embed], components: [createSelectMenu()], flags: [MessageFlags.Ephemeral] });
            return;
        }

        if (interaction.isStringSelectMenu()) {
            if (!voiceChannel) {
                return interaction.reply({ content: '❌ Vous devez être dans un salon vocal pour utiliser la radio !', flags: [MessageFlags.Ephemeral] });
            }

            const selectedRadioUrl = interaction.values[0];
            const selectedRadio = radioStations.find(r => r.value === selectedRadioUrl);

            await interaction.deferUpdate();

            if (client.timeouts && client.timeouts.has(guild.id)) {
                clearTimeout(client.timeouts.get(guild.id));
                client.timeouts.delete(guild.id);
            }

            try {
                const connection = getVoiceConnection(guild.id) || joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: guild.id,
                    adapterCreator: guild.voiceAdapterCreator,
                    selfDeaf: true,
                    group: 'default'
                });

                const player = createAudioPlayer();

                player.on('stateChange', (oldState, newState) => {
                    console.log(`État radio : ${oldState.status} -> ${newState.status}`);
                });

                player.on('error', error => {
                    console.error('Erreur radio:', error);
                });

                const resource = createAudioResource(selectedRadioUrl);
                connection.subscribe(player);
                player.play(resource);

                player.on(AudioPlayerStatus.Idle, () => {
                    const timeout = setTimeout(() => {
                        if (connection) connection.destroy();
                    }, 300000);
                    if (!client.timeouts) client.timeouts = new Map();
                    client.timeouts.set(guild.id, timeout);
                });

                const embed = new EmbedBuilder()
                    .setTitle(`${selectedRadio.emoji} En cours : ${selectedRadio.label}`)
                    .setDescription(`*${selectedRadio.description}*\n\nBonne écoute !`)
                    .setColor('#2ecc71');

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('radio_stop').setLabel('Arrêter').setStyle(ButtonStyle.Danger),
                    new ButtonBuilder().setCustomId('radio_change').setLabel('Changer de radio').setStyle(ButtonStyle.Primary)
                );

                await interaction.followUp({ embeds: [embed], components: [row], flags: [MessageFlags.Ephemeral] });
            } catch (error) {
                console.error(error);
                await interaction.followUp({ content: '❌ Une erreur est survenue lors de la connexion.', flags: [MessageFlags.Ephemeral] });
            }
        }

        if (interaction.isButton()) {
            await interaction.deferUpdate();

            if (interaction.customId === 'radio_stop') {
                const connection = getVoiceConnection(guild.id);
                if (connection) {
                    connection.destroy();
                    if (client.timeouts && client.timeouts.has(guild.id)) {
                        clearTimeout(client.timeouts.get(guild.id));
                        client.timeouts.delete(guild.id);
                    }
                }

                const stopEmbed = new EmbedBuilder()
                    .setTitle('⏹️ Radio arrêtée')
                    .setDescription(`La session radio a été terminée par ${interaction.user}.`)
                    .setColor('#e74c3c')
                    .setTimestamp();

                await interaction.followUp({ embeds: [stopEmbed], components: [], flags: [MessageFlags.Ephemeral] });
            } else if (interaction.customId === 'radio_change') {
                const embed = new EmbedBuilder()
                    .setTitle('📻 Choisissez votre nouvelle radio')
                    .setColor('#3498db');
                await interaction.editReply({ embeds: [embed], components: [createSelectMenu()] });
            }
        }
    }
};
