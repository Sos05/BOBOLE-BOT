const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const path = require('path');
const fs = require('fs');

const lyrics = [
    ["Dans l'étang calme où tout sommeille", "Une statue qui émerveille"],
    ["Le Bobole Moine est planté là", "Sans sourire mais avec éclat"],
    ["Il regarde l'eau et reste sage", "Un vieux mystère sur son visage"],
    ["Pourquoi si drôle sans un sourire", "C'est dans son air qu'on veut mourir"],
    ["Oh Bobole Moine mystérieux", "Statue posée sous mille cieux"],
    ["Un drôle de moine", "On peut rêver"],
    ["Les enfants passent et s'interrogent", "Pourquoi ce moine n'a pas de loge"],
    ["Sous la lumière des nuits d'été", "Il reste là"],
    ["L'esprit sauté", "Est-ce un génie ou bien un fou"],
    ["Il rend l'eau drôle", "C'est un atout"],
    ["Tu ne ris pas mais fais marrer", "Un drôle de moine"],
];

const randomPick = (arr) => arr[Math.floor(Math.random() * arr.length)];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bobole')
        .setDescription('Envoie une bobolerie'),

    async execute(interaction) {
        const imagesDir = path.join(__dirname, '/images');

        const files = fs.readdirSync(imagesDir);
        const selectedFile = randomPick(files);

        const filePath = path.join(imagesDir, selectedFile);
        const attachment = new AttachmentBuilder(filePath, { name: selectedFile });

        const [line1, line2] = randomPick(lyrics);

        const embed = new EmbedBuilder()
            .setColor(0x6BD8FF)
            .setTitle('✨ Bobolerie ✨')
            .setDescription(`> 🎶🎤 *${line1}* 🎶🎤\n> 🎶🎤 *${line2}* 🎶🎤`)
            .setImage(`attachment://${selectedFile}`)
            .setFooter({ text: 'Statue posée sous mille cieux..' })
            .setTimestamp();

        await interaction.reply({
            embeds: [embed],
            files: [attachment]
        });
    }
};
