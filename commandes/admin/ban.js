const { SlashCommandBuilder } = require('discord.js');
const { PermissionsBitField, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bannir un utilisateur du serveur')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur à bannir')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('raison')
                .setDescription('La raison du bannissement')
                .setRequired(false)),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            await interaction.reply({ content: '❌ Vous n\'avez pas la permission de bannir des membres.', flags: [MessageFlags.Ephemeral] });
            return;
        }

        const user = interaction.options.getUser('utilisateur');
        const raison = interaction.options.getString('raison') || 'Aucune raison fournie.';
        const member = interaction.guild.members.cache.get(user.id);

        if (member) {
            try {
                await member.ban({ reason: raison });
                
                const embed = new EmbedBuilder()
                    .setTitle('🚫 Bannissement réussi')
                    .setDescription(`L'utilisateur **${user.tag}** a été banni avec succès. 🛑`)
                    .addFields(
                        { name: '⏳ Date du bannissement', value: new Date().toLocaleString(), inline: true },
                        { name: '⚠️ Raison', value: raison, inline: true }
                    )
                    .setColor('#FF0000')
                    .setThumbnail(user.displayAvatarURL())
                    .setFooter({ text: 'Action effectuée par ' + interaction.user.tag, iconURL: interaction.user.displayAvatarURL() });

                await interaction.reply({ embeds: [embed] });
            } catch (error) {
                console.error('Erreur lors du bannissement de l\'utilisateur :', error);
                await interaction.reply({ content: '⚠️ Une erreur est survenue lors du bannissement de cet utilisateur.', flags: [MessageFlags.Ephemeral] });
            }
        } else {
            await interaction.reply({ content: '❌ Utilisateur non trouvé ou l\'utilisateur n\'est pas dans le serveur.', flags: [MessageFlags.Ephemeral] });
        }
    },
};