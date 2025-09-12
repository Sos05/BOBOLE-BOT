const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Expulse un utilisateur du serveur')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur à expulser')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('raison')
                .setDescription('La raison de l\'expulsion')
                .setRequired(false)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            await interaction.reply({ content: 'Vous n\'avez pas la permission d\'expulser des membres.', ephemeral: true });
            return;
        }

        const user = interaction.options.getUser('utilisateur');
        const reason = interaction.options.getString('raison') || 'Aucune raison fournie';

        const member = interaction.guild.members.cache.get(user.id);
        if (member) {
            try {
                await member.kick(reason);

                const kickEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('Expulsion d\'un membre')
                    .setDescription(`**${user.tag}** a été expulsé du serveur.`)
                    .addFields(
                        { name: 'Raison', value: reason, inline: true },
                        { name: 'Expulsé par', value: `${interaction.user.tag}`, inline: true }
                    )
                    .setTimestamp()
                    .setFooter({ text: 'Expulsion réalisée avec succès', iconURL: interaction.client.user.displayAvatarURL() });

                await interaction.reply({ embeds: [kickEmbed] });
            } catch (error) {
                console.error('Erreur lors de l\'expulsion de l\'utilisateur :', error);
                await interaction.reply({ content: 'Erreur lors de l\'expulsion de l\'utilisateur.', ephemeral: true });
            }
        } else {
            await interaction.reply({ content: 'Utilisateur non trouvé.', ephemeral: true });
        }
    },
};
