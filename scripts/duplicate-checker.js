const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/posted-articles.json');

let postedArticles = {
  lastUpdated: new Date().toISOString(),
  articles: []
};

// Load existing data
function loadPostedArticles() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      postedArticles = JSON.parse(data);
    }
  } catch (error) {
    console.log('No existing posted articles file, starting fresh.');
  }
  return postedArticles;
}

// Filter out already posted articles
function filterNewArticles(articles, postedData) {
  const postedIds = new Set(postedData.articles.map(article => article.id));
  return articles.filter(article => !postedIds.has(article.id));
}

// Mark article as posted
function markAsPosted(article) {
  postedArticles.articles.push({
    id: article.id,
    title: article.title,
    url: article.url,
    category: article.category,
    postedAt: new Date().toISOString()
  });
  
  // Keep only last 1000 articles to prevent file from growing too large
  if (postedArticles.articles.length > 1000) {
    postedArticles.articles = postedArticles.articles.slice(-500);
  }
  
  postedArticles.lastUpdated = new Date().toISOString();
}

// Save to file
function savePostedArticles() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(postedArticles, null, 2));
    console.log('💾 Saved posted articles data');
  } catch (error) {
    console.error('❌ Failed to save posted articles:', error.message);
  }
}

module.exports = {
  loadPostedArticles,
  filterNewArticles,
  markAsPosted,
  savePostedArticles
};
