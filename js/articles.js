// Dynamic article loading for TruthSeekerHQ
class ArticleRenderer {
    constructor() {
        this.articles = [];
        this.loadArticles();
    }

    async loadArticles() {
        try {
            const response = await fetch('/data/articles.json');
            const data = await response.json();
            this.articles = data.articles;
            return this.articles;
        } catch (error) {
            console.error('Failed to load articles:', error);
            return [];
        }
    }

    // Get all articles sorted by date (newest first)
    getAllArticles() {
        return this.articles.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
    }

    // Get featured article
    getFeaturedArticle() {
        return this.articles.find(article => article.featured) || this.articles[0];
    }

    // Get articles by category
    getArticlesByCategory(category) {
        return this.articles.filter(article => article.category === category);
    }

    // Render featured article section for homepage
    renderFeaturedArticle(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const featured = this.getFeaturedArticle();
        if (!featured) return;

        container.innerHTML = `
            <a href="${featured.url}" class="block bg-gradient-to-r from-yellow-600/20 to-red-600/20 border border-yellow-600/30 rounded-xl p-6 md:p-8 hover:border-yellow-500 transition">
                <div class="flex flex-col md:flex-row md:items-center gap-6">
                    <div class="flex-shrink-0">
                        <span class="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded">FEATURED INVESTIGATION</span>
                    </div>
                    <div class="flex-grow">
                        <h2 class="text-2xl md:text-3xl font-bold mb-2">${featured.title}</h2>
                        <p class="text-gray-400">${featured.excerpt}</p>
                    </div>
                    <div class="flex-shrink-0 text-yellow-500">
                        <i class="fas fa-arrow-right text-2xl"></i>
                    </div>
                </div>
            </a>
        `;
    }

    // Render articles grid for articles page
    renderArticlesGrid(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const articles = this.getAllArticles();
        
        let html = '';
        articles.forEach((article, index) => {
            const tagBadges = article.tags.map(tag => {
                const tagColors = {
                    'featured': 'bg-red-600',
                    'investigation': 'bg-purple-600',
                    'breaking-theory': 'bg-red-600',
                    'hidden-history': 'bg-blue-600',
                    'surveillance': 'bg-purple-600',
                    'world-order': 'bg-green-600',
                    'classified': 'bg-purple-600',
                    'space-mystery': 'bg-indigo-600',
                    'ufo-military': 'bg-red-600',
                    'new': 'bg-yellow-600'
                };
                const colorClass = tagColors[tag] || 'bg-gray-600';
                const displayTag = tag.replace('-', ' ').toUpperCase();
                return `<span class="${colorClass} text-white text-xs px-2 py-1 rounded">${displayTag}</span>`;
            }).join(' ');

            // Featured article gets special layout
            if (article.featured && index === 0) {
                html += `
                    <a href="${article.url}" class="col-span-full bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-yellow-500 transition">
                        <div class="md:flex">
                            <div class="md:w-1/2 h-64 md:h-auto bg-cover bg-center" style="background-image: url('${article.imageUrl}');"></div>
                            <div class="p-8 md:w-1/2">
                                <div class="flex gap-2 mb-3">
                                    ${tagBadges}
                                </div>
                                <h2 class="text-2xl font-bold mb-3">${article.title}</h2>
                                <p class="text-gray-400 mb-4">${article.excerpt}</p>
                                <div class="text-sm text-gray-500">
                                    <span>${article.publishDate}</span> • <span>${article.readTime}</span>
                                </div>
                            </div>
                        </div>
                    </a>
                `;
            } else {
                // Regular article cards
                html += `
                    <a href="${article.url}" class="bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-yellow-500 transition">
                        <div class="h-48 bg-cover bg-center" style="background-image: url('${article.imageUrl}');"></div>
                        <div class="p-6">
                            <div class="flex gap-2 mb-3">
                                ${tagBadges}
                            </div>
                            <h3 class="text-xl font-bold mb-2">${article.title}</h3>
                            <p class="text-gray-400 text-sm mb-4">${article.excerpt}</p>
                            <div class="text-sm text-gray-500">
                                <span>${article.publishDate}</span> • <span>${article.readTime}</span>
                            </div>
                        </div>
                    </a>
                `;
            }
        });

        container.innerHTML = html;
    }

    // Update article count in stats
    updateArticleCount(elementId) {
        const element = document.getElementById(elementId);
        if (element && this.articles.length > 0) {
            element.textContent = this.articles.length;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    const articleRenderer = new ArticleRenderer();
    await articleRenderer.loadArticles();

    // Render different sections based on page
    if (document.getElementById('featured-investigation')) {
        articleRenderer.renderFeaturedArticle('featured-investigation');
    }
    
    if (document.getElementById('articles-grid')) {
        articleRenderer.renderArticlesGrid('articles-grid');
    }

    if (document.getElementById('article-count')) {
        articleRenderer.updateArticleCount('article-count');
    }
});