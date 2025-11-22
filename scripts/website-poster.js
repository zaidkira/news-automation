const axios = require('axios');

async function postToWebsite(article) {
  const websiteUrl = process.env.WEBSITE_API_URL;
  const token = process.env.WEBSITE_API_TOKEN;
  
  if (!websiteUrl || !token) {
    throw new Error('Website API credentials not configured');
  }
  
  const payload = {
    title: article.title,
    content: formatContent(article),
    excerpt: article.description,
    category: article.category,
    tags: ['auto-news', article.category],
    meta: {
      source: article.source,
      original_url: article.url,
      published_at: article.publishedAt.toISOString()
    },
    status: 'publish'
  };
  
  const response = await axios.post(websiteUrl, payload, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    timeout: 10000 // 10 second timeout
  });
  
  if (response.status >= 200 && response.status < 300) {
    console.log(`   ✅ Successfully posted to website`);
    return response.data;
  } else {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
}

function formatContent(article) {
  return `
    <p>${article.description}</p>
    ${article.imageUrl ? `<img src="${article.imageUrl}" alt="${article.title}" style="max-width: 100%; height: auto;">` : ''}
    <p>${article.content}</p>
    <p><em>Source: <a href="${article.url}" target="_blank">${article.source}</a></em></p>
    <p><small>Article automatiquement importé le ${new Date().toLocaleDateString('fr-FR')}</small></p>
  `.trim();
}

module.exports = {
  postToWebsite
};
