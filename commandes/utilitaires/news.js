const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const NewsAPI = require('newsapi');
const { newsApiKey } = require('../../config.json'); 

const newsapi = new NewsAPI(newsApiKey); 

const ARTICLES_PER_PAGE = 5;
const MAX_PAGES_LIMIT = 20;
const EMBED_COLOR = 0x8A2BE2;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('news')
        .setDescription('Affiche les gros titres récents en français, page par page (Max 20 pages).')
        .addIntegerOption(option =>
            option.setName('page')
                .setDescription('Le numéro de la page d\'articles à afficher (1 à 20 max).')
                .setRequired(false) 
                .setMinValue(1) 
                .setMaxValue(MAX_PAGES_LIMIT)
        ),

    async execute(interaction) {
        await interaction.deferReply(); 

        const pageNumber = interaction.options.getInteger('page') || 1;
        const query = 'actualité';
        
        if (pageNumber > MAX_PAGES_LIMIT) {
             return interaction.editReply({ 
                content: `Désolé, la limite de recherche de NewsAPI est fixée à **${MAX_PAGES_LIMIT}** pages. Veuillez choisir un numéro de page inférieur.`,
                ephemeral: true 
            });
        }
        
        try {
            const response = await newsapi.v2.everything({
                q: query,          
                language: 'fr',     
                sortBy: 'publishedAt',
                pageSize: ARTICLES_PER_PAGE, 
                page: pageNumber             
            });
            
            const articles = response.articles;
            const totalArticles = Math.min(response.totalResults, ARTICLES_PER_PAGE * MAX_PAGES_LIMIT);
            const totalPages = Math.ceil(totalArticles / ARTICLES_PER_PAGE);

            if (response.status !== 'ok' || !articles || articles.length === 0) {
                const message = (pageNumber > totalPages && totalPages > 0) 
                    ? `Désolé, la page **${pageNumber}** n'existe pas. Il n'y a que **${totalPages}** pages de résultats (max. ${MAX_PAGES_LIMIT}).`
                    : "Désolé, l'API n'a trouvé aucun gros titre récent en français. Veuillez réessayer plus tard.";
                return interaction.editReply({ content: message, ephemeral: true });
            }

            const newsEmbed = new EmbedBuilder()
                .setColor(EMBED_COLOR)
                .setTitle(`🇫🇷 🌍 Les Gros Titres Récents (Page ${pageNumber} / ${totalPages} - Max ${MAX_PAGES_LIMIT})`) 
                .setURL('https://newsapi.org/') 
                .setThumbnail(interaction.client.user.displayAvatarURL())
                .setDescription(`Affichage de **${articles.length}** articles pour l'**Actualité en Français**.`)
                .setTimestamp()
                .setFooter({ text: `Requête par ${interaction.user.username} | Source: NewsAPI.org` });
            
            articles.forEach((article, index) => {
                const articleIndex = ((pageNumber - 1) * ARTICLES_PER_PAGE) + index + 1;
                const source = article.source.name || 'Source inconnue';
                const description = article.description || "Cliquez sur le lien pour lire la suite !";
                
                newsEmbed.addFields(
                    {
                        name: `[#${articleIndex}] ${article.title}`, 
                        value: `*Source : **${source}***\n${description.length > 200 ? description.substring(0, 197) + '...' : description}\n[Lire l'article complet ici](${article.url})`,
                        inline: false
                    }
                );
            });

            if (articles[0] && articles[0].urlToImage) {
                newsEmbed.setImage(articles[0].urlToImage);
            }
            
            await interaction.editReply({ embeds: [newsEmbed] });

        } catch (error) {
            console.error('Erreur NewsAPI:', error);
            
            let messageErreur = "Une erreur est survenue lors de la récupération des nouvelles. Veuillez vérifier votre clé NewsAPI dans `config.json`.";

            await interaction.editReply({ 
                content: messageErreur, 
                ephemeral: true 
            });
        }
    },
};