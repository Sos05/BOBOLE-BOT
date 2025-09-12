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

        await interaction.reply({ embeds: [pingEmbed] });
    },
};