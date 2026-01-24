const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, getVoiceConnection, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const googleTTS = require('google-tts-api');

const disconnectTimers = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tts')
        .setDescription('Dit un message dans un salon vocal.')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Le message à dire (max 200 caractères).')
                .setRequired(true)
                .setMaxLength(200)
        ),
    async execute(interaction) {
        const { channel } = interaction.member.voice;

        if (!channel) {
            return interaction.reply({
                content: '❌ Vous devez être dans un salon vocal.',
                flags: [MessageFlags.Ephemeral]
            });
        }

        const messageToSpeak = interaction.options.getString('message');
        const guildId = interaction.guild.id;

        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        try {
            const audioUrl = googleTTS.getAudioUrl(messageToSpeak, {
                lang: 'fr',
                slow: false,
                host: 'https://translate.google.com',
            });

            let connection = getVoiceConnection(guildId);

            if (!connection) {
                connection = joinVoiceChannel({
                    channelId: channel.id,
                    guildId: guildId,
                    adapterCreator: interaction.guild.voiceAdapterCreator,
                });
            }

            if (disconnectTimers.has(guildId)) {
                clearTimeout(disconnectTimers.get(guildId));
            }

            await new Promise((resolve, reject) => {
                if (connection.state.status === VoiceConnectionStatus.Ready) {
                    resolve();
                } else {
                    connection.once(VoiceConnectionStatus.Ready, resolve);
                    connection.once(VoiceConnectionStatus.Disconnected, reject);
                    connection.once(VoiceConnectionStatus.Destroyed, reject);
                    setTimeout(() => reject(new Error('Timeout connexion')), 10000);
                }
            });

            const player = createAudioPlayer();
            const resource = createAudioResource(audioUrl);

            player.on(AudioPlayerStatus.Idle, () => {
                const timer = setTimeout(() => {
                    const conn = getVoiceConnection(guildId);
                    if (conn) {
                        conn.destroy();
                        disconnectTimers.delete(guildId);
                    }
                }, 600000);

                disconnectTimers.set(guildId, timer);
            });

            player.on('error', error => {
                console.error('Erreur player:', error);
            });

            connection.subscribe(player);
            player.play(resource);

            await interaction.editReply({ content: `🗣️ **Dit :** "${messageToSpeak}"` });

        } catch (error) {
            console.error('Erreur TTS:', error);

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ content: '❌ Erreur lors de la synthèse vocale.' });
            } else {
                await interaction.reply({
                    content: '❌ Erreur lors de la synthèse vocale.',
                    flags: [MessageFlags.Ephemeral]
                });
            }
        }
    },
};
