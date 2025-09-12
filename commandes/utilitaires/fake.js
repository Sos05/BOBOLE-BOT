const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fake')
        .setDescription('Prendre l\'apparence de quelqu\'un pour envoyer un message.')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur dont il faut prendre l\'apparence.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Le message à envoyer.')
                .setRequired(false))
        .addAttachmentOption(option =>
            option.setName('image')
                .setDescription('L\'image à joindre au message.')
                .setRequired(false)),

    async execute(interaction) {
        const member = interaction.options.getMember('utilisateur');
        const message = interaction.options.getString('message');
        const image = interaction.options.getAttachment('image');

        if (!message && !image) {
            return interaction.reply({
                content: '❌ Vous devez fournir au moins un message ou une image.',
                flags: [MessageFlags.Ephemeral]
            });
        }
        
        if (!member) {
            return interaction.reply({
                content: '❌ Impossible de trouver cet utilisateur sur le serveur.',
                flags: [MessageFlags.Ephemeral]
            });
        }

        try {
            const webhook = await interaction.channel.createWebhook({
                name: member.displayName,
                avatar: member.user.displayAvatarURL({ dynamic: true }),
            });

            const payload = {};
            if (message) payload.content = message;
            if (image) payload.files = [image.url];

            await webhook.send(payload);
            await webhook.delete();

            await interaction.reply({
                content: '✅ Message envoyé avec succès !',
                flags: [MessageFlags.Ephemeral]
            });
        } catch (error) {
            console.error('Erreur lors de la création du webhook ou de l\'envoi du message:', error);
            await interaction.reply({
                content: '❌ Une erreur est survenue. Assurez-vous que j\'ai la permission "Gérer les webhooks" dans ce salon.',
                flags: [MessageFlags.Ephemeral]
            });
        }
    },
};