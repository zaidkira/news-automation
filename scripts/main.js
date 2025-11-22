const fs = require('fs');
const path = require('path');
const newsFetcher = require('./news-fetcher');
const websitePoster = require('./website-poster');
const duplicateChecker = require('./duplicate-checker');

async function main() {
  console.log('🚀 Starting news automation...');
  
  try {
    // Load configuration
    const configPath = path.join(__dirname, '../config/rss-feeds.json');
    const feeds = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    // Load posted articles
    const postedArticles = duplicateChecker.loadPostedArticles();
    
    const allNewArticles = [];
    
    // Process each topic
    for (const [topic, rssFeeds] of Object.entries(feeds)) {
      console.log(`\n📝 Processing topic: ${topic}`);
      
      try {
        const articles = await newsFetcher.fetchArticlesForTopic(topic, rssFeeds, 4);
        const newArticles = duplicateChecker.filterNewArticles(articles, postedArticles);
        
        console.log(`✅ Found ${newArticles.length} new articles for ${topic}`);
        
        // Post to website
        for (const article of newArticles) {
          try {
            await websitePoster.postToWebsite(article);
            console.log(`📤 Posted: ${article.title}`);
            
            // Mark as posted
            duplicateChecker.markAsPosted(article);
            allNewArticles.push(article);
            
            // Small delay between posts
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (error) {
            console.error(`❌ Failed to post article: ${article.title}`, error.message);
          }
        }
      } catch (error) {
        console.error(`❌ Error processing topic ${topic}:`, error.message);
      }
    }
    
    // Save updated posted articles
    duplicateChecker.savePostedArticles();
    
    console.log(`\n🎉 Automation completed! Processed ${allNewArticles.length} new articles.`);
    
  } catch (error) {
    console.error('💥 Critical error in main process:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = main;
