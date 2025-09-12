const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('banner')
        .setDescription('Affiche la bannière d\'un utilisateur')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur dont vous voulez voir la bannière')
                .setRequired(false)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser('utilisateur') || interaction.user;

        try {
            const fullUser = await interaction.client.users.fetch(user.id, { force: true });

            if (!fullUser.banner) {
                await interaction.reply({
                    content: `❌ ${fullUser.tag} n'a pas de bannière de profil.`,
                    ephemeral: true
                });
                return;
            }

            const bannerURL = fullUser.bannerURL({ dynamic: true, size: 1024 });

            const embed = new EmbedBuilder()
                .setTitle(`🖼️ Bannière de ${fullUser.tag}`)
                .setImage(bannerURL)
                .setColor('#1E90FF')
                .setFooter({
                    text: `Demandé par ${interaction.user.tag}`,
                    iconURL: interaction.user.displayAvatarURL()
                })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Erreur lors de la récupération de la bannière :', error);
            await interaction.reply({
                content: '❌ Utilisateur introuvable ou ID invalide.',
                ephemeral: true
            });
        }
    },
};
