const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('image')
        .setDescription('Génère une image à partir d\'une description.')
        .addStringOption(option =>
            option.setName('description')
                .setDescription('Description de l\'image à générer.')
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply();
        
        const prompt = interaction.options.getString('description');
        const encodedPrompt = encodeURIComponent(prompt);
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?nologo=true&seed=${Date.now()}`;

        try {
            const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data, 'binary');
            const attachment = new AttachmentBuilder(buffer, { name: 'image_generee.png' });

            const embed = new EmbedBuilder()
                .setColor('#4285F4')
                .setAuthor({ name: `Demande de ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTitle(`✨ Image générée : ${prompt.substring(0, 100)}`)
                .setImage('attachment://image_generee.png')
                .setFooter({ text: 'Généré via Pollinations.ai' })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed], files: [attachment] });
        } catch (error) {
            console.error('Erreur génération image:', error.message);
            await interaction.editReply({ content: '❌ Une erreur est survenue lors de la génération de l\'image.' });
        }
    }
};
