const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Vérifie la vitesse de réponse du bot.'),
    async execute(interaction) {
        const botLatency = Math.round(interaction.client.ws.ping);
        
        let color;
        let health;
        if (botLatency < 200) {
            color = '#2ecc71';
            health = 'Excellente';
        } else if (botLatency < 400) {
            color = '#f1c40f';
            health = 'Moyenne';
        } else {
            color = '#e74c3c';
            health = 'Lente';
        }
        
        const pingEmbed = new EmbedBuilder()
            .setColor(color)
            .setTitle('🏓 Pong!')
            .setDescription(`La latence du bot est de **${botLatency} ms**.`)
            .setFooter({ text: `État de la connexion : ${health}` });

        try {
            await interaction.reply({ embeds: [pingEmbed] });
        } catch (error) {
            console.error('Impossible d\'envoyer le message de ping (Interaction expirée ou invalide) :', error.message);
        }
    },
};
