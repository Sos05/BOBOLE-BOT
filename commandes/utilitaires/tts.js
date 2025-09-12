const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, getVoiceConnection } = require('@discordjs/voice');
const gTTS = require('gtts');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tts')
        .setDescription('Dit un message dans un salon vocal.')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Le message à dire.')
                .setRequired(true)
        ),
    async execute(interaction) {
        const voiceChannel = interaction.member.voice.channel;
        const guild = interaction.guild;
        const client = interaction.client;

        if (!voiceChannel) {
            return interaction.reply({ content: '❌ Vous devez être dans un salon vocal pour utiliser cette commande.', flags: [MessageFlags.Ephemeral] });
        }

        const messageToSpeak = interaction.options.getString('message');

        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        const connection = getVoiceConnection(guild.id) || joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
        });

        const player = createAudioPlayer();
        connection.subscribe(player);

        try {
            const gtts = new gTTS(messageToSpeak, 'fr');
            const readableStream = gtts.stream();
            
            const resource = createAudioResource(readableStream);
            player.play(resource);

            await interaction.editReply({ content: `✅ En train de dire : "${messageToSpeak}" dans le salon ${voiceChannel.name}.` });
        } catch (error) {
            console.error('❌ Erreur lors du TTS :', error);
            await interaction.editReply({ content: '❌ Une erreur est survenue lors de la lecture du message.' });
        }
    },
};