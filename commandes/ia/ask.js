const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { geminiApiKey } = require('../../config.json');

const genAI = new GoogleGenerativeAI(geminiApiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ia')
        .setDescription('Pose une question à l\'intelligence artificielle Gemini.')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('La question que vous voulez poser.')
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply();

        const question = interaction.options.getString('question');

        try {
            const result = await model.generateContent(question);
            const response = await result.response;
            const text = response.text();

            const responseText = text.length > 4096 ? text.substring(0, 4093) + "..." : text;

            const embed = new EmbedBuilder()
                .setColor('#4285F4')
                .setAuthor({ name: `Question de ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTitle(question.substring(0, 256))
                .setDescription(responseText)
                .setTimestamp()
                .setFooter({ text: 'Propulsé par Google Gemini' });
            
            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error("Erreur avec l'API Gemini:", error);
            await interaction.editReply({ content: '❌ Une erreur est survenue en contactant l\'IA. Le sujet est peut-être sensible ou l\'API est indisponible.' });
        }
    },

};
