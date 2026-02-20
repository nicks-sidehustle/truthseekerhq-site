# TruthSeekerHQ Dynamic Content System

This site now uses a dynamic content system to manage articles instead of hardcoding them in HTML files.

## How It Works

- **Article Data**: All article metadata is stored in `data/articles.json`
- **Dynamic Loading**: JavaScript (`js/articles.js`) loads this data and renders articles dynamically
- **Existing HTML**: All individual article HTML files remain unchanged - only the listing pages are dynamic

## Adding New Articles

### 1. Create the Article HTML File

Create your new article HTML file in the `articles/` directory (e.g., `articles/my-new-investigation.html`).

### 2. Add Article Metadata

Edit `data/articles.json` and add your new article to the `articles` array:

```json
{
  "slug": "my-new-investigation",
  "title": "My New Investigation: The Truth Behind X",
  "category": "investigation",
  "tags": ["new", "investigation"],
  "excerpt": "A compelling one-sentence description that hooks readers...",
  "publishDate": "February 20, 2026",
  "readTime": "12 min read",
  "imageUrl": "https://images.unsplash.com/photo-XXXXXX?w=800",
  "featured": false,
  "url": "articles/my-new-investigation.html"
}
```

### 3. Category & Tag Options

**Categories**: investigation, theory, hidden-history, surveillance, world-order, classified, space-mystery, ufo-military

**Common Tags**: featured, investigation, breaking-theory, hidden-history, surveillance, world-order, classified, space-mystery, ufo-military, new

### 4. Featured Articles

To make an article featured:
- Set `"featured": true` in the article data
- Only one article should be featured at a time
- Featured articles appear in the special homepage section and get prominent placement

## File Structure

```
/
├── data/
│   └── articles.json          # Article metadata
├── js/
│   └── articles.js           # Dynamic loading logic
├── articles/
│   ├── index.html           # Dynamic articles listing page
│   ├── article-name.html    # Individual article files
│   └── ...
└── index.html               # Homepage with dynamic featured section
```

## For Automated Content Creation

If you're creating articles programmatically or via cron jobs:

1. **Update the JSON**: Always update `data/articles.json` when you add a new article
2. **Create the HTML**: Generate the full article HTML file in the `articles/` directory
3. **Image URLs**: Use Unsplash or other reliable image hosting for consistency
4. **Date Format**: Use "Month DD, YYYY" format for publishDate
5. **Sorting**: Articles are automatically sorted by date (newest first)

## Testing

After adding new articles:
1. Open the homepage - the featured article should update if you marked one as featured
2. Open the articles page - your new article should appear in the grid
3. Verify all links work and images load

## Backward Compatibility

- All existing article HTML files continue to work unchanged
- All existing links remain valid
- Only the listing/index pages are dynamic
- No changes needed to individual article content