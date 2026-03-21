const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { geminiApiKey } = require('../../config.json');
const axios = require('axios');

const genAI = new GoogleGenerativeAI(geminiApiKey);
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ia')
        .setDescription('Pose une question à l\'intelligence artificielle Gemini.')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('La question que vous voulez poser.')
                .setRequired(true))
        .addAttachmentOption(option =>
            option.setName('fichier')
                .setDescription('Ajouter une image ou un document.')
                .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply();

        const question = interaction.options.getString('question');
        const attachment = interaction.options.getAttachment('fichier');

        try {
            let promptParts = [question];

            if (attachment) {
                const fileResponse = await axios.get(attachment.url, { responseType: 'arraybuffer' });
                promptParts.push({
                    inlineData: {
                        data: Buffer.from(fileResponse.data).toString('base64'),
                        mimeType: attachment.contentType
                    }
                });
            }

            const result = await model.generateContent(promptParts);
            let text = result.response.text();

            text = text.replace(/^#### (.*$)/gim, '### $1');

            const splitMessage = (str, size) => {
                const chunks = [];
                let currentPos = 0;
                let inCodeBlock = false;
                let codeLanguage = "";

                while (currentPos < str.length) {
                    let chunk = str.substring(currentPos, currentPos + size);

                    const codeBlockMatches = chunk.match(/```/g);
                    const codeBlockCount = codeBlockMatches ? codeBlockMatches.length : 0;

                    if (inCodeBlock) {
                        chunk = "```" + codeLanguage + "\n" + chunk;
                    }

                    const totalCodeBlocks = (inCodeBlock ? 1 : 0) + codeBlockCount;

                    if (totalCodeBlocks % 2 !== 0) {
                        if (!inCodeBlock) {
                            const langMatch = chunk.match(/```(\w+)/);
                            codeLanguage = langMatch ? langMatch[1] : "";
                        }
                        chunk += "\n```";
                        inCodeBlock = true;
                    } else {
                        inCodeBlock = false;
                    }

                    chunks.push(chunk);
                    currentPos += size;
                }
                return chunks;
            };

            const chunks = splitMessage(text, 3900);
            const embeds = chunks.map((chunk, index) => {
                const embed = new EmbedBuilder().setColor('#4285F4').setDescription(chunk);
                if (index === 0) {
                    embed.setAuthor({ name: `Question de ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });
                    embed.setTitle(question.substring(0, 256));
                }
                if (index === chunks.length - 1) {
                    embed.setFooter({ text: 'Propulsé par Google Gemini' }).setTimestamp();
                }
                return embed;
            });

            for (let i = 0; i < embeds.length; i += 10) {
                const batch = embeds.slice(i, i + 10);
                if (i === 0) {
                    await interaction.editReply({ embeds: batch });
                } else {
                    await interaction.followUp({ embeds: batch });
                }
            }

        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: '❌ Une erreur est survenue.' });
        }
    },
};
