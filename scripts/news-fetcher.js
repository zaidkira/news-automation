const Parser = require('rss-parser');
const parser = new Parser();

async function fetchArticlesForTopic(topic, rssFeeds, maxArticles = 4) {
  const allArticles = [];
  
  for (const feedUrl of rssFeeds) {
    try {
      console.log(`   Fetching from: ${feedUrl}`);
      const feed = await parser.parseURL(feedUrl);
      
      const articles = feed.items.slice(0, maxArticles).map(item => ({
        id: generateArticleId(item),
        title: item.title || 'No title',
        description: item.contentSnippet || item.description || 'No description',
        content: item.content || item.description || 'No content',
        url: item.link || '#',
        imageUrl: getImageFromContent(item),
        category: topic,
        source: feed.title || 'Unknown source',
        publishedAt: new Date(item.pubDate || Date.now()),
        fetchedAt: new Date()
      }));
      
      allArticles.push(...articles);
      
      // If we have enough articles, break early
      if (allArticles.length >= maxArticles * 2) break;
      
    } catch (error) {
      console.log(`   ❌ Failed to fetch from ${feedUrl}:`, error.message);
    }
  }
  
  // Remove duplicates and return requested number
  return removeDuplicates(allArticles).slice(0, maxArticles);
}

function generateArticleId(article) {
  const crypto = require('crypto');
  const str = article.link + article.title;
  return crypto.createHash('md5').update(str).digest('hex');
}

function getImageFromContent(item) {
  // Simple image extraction from content
  if (item.content && item.content.includes('<img')) {
    const match = item.content.match(/<img[^>]+src="([^">]+)"/);
    if (match) return match[1];
  }
  return null;
}

function removeDuplicates(articles) {
  const seen = new Set();
  return articles.filter(article => {
    if (seen.has(article.id)) return false;
    seen.add(article.id);
    return true;
  });
}

module.exports = {
  fetchArticlesForTopic
};
