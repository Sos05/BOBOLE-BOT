import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

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

const boboles = [
    'https://media1.tenor.com/m/NUhGG3PhYgEAAAAd/bobole-moine.gif',
    'https://media1.tenor.com/m/87qKUd5B2tgAAAAd/bobole-moine-moine-de-boedic.gif',
    "https://i.ibb.co/60ZM6F1X/bust.png",
    "https://i.ibb.co/TxcxrF0f/donkey-kong.png",
    "https://i.ibb.co/wNsp8L62/IMG-20250716-235234.jpg",
    "https://i.ibb.co/Y4wkX70J/skeleton.png",
];

const randomPick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const data = new SlashCommandBuilder()
    .setName('bobole')
    .setDescription('Envoie une bobolerie');

export async function execute(interaction) {
    const [line1, line2] = randomPick(lyrics);

    const embed = new EmbedBuilder()
        .setColor(0x6BD8FF)
        .setTitle('✨ Bobolerie ✨')
        .setDescription(`> 🎶🎤 *${line1}* 🎶🎤\n 🎶🎤 *${line2}* 🎶🎤`)
        .setImage(randomPick(boboles))
        .setFooter({ text: 'Statue posée sous mille cieux..' })
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}
