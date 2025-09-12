const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pp')
        .setDescription('Affiche la photo de profil d\'un utilisateur')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur dont vous voulez voir la photo de profil')
                .setRequired(false)),

    async execute(interaction) {
        const user = interaction.options.getUser('utilisateur') || interaction.user;

        try {
            const embed = new EmbedBuilder()
                .setTitle(`🖼️ Avatar de ${user.tag}`)
                .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
                .setColor('#1E90FF')
                .setFooter({ text: `Demandé par ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Erreur lors de la récupération de l\'avatar :', error);
            await interaction.reply({ content: '❌ Utilisateur introuvable.', ephemeral: true });
        }
    },
};