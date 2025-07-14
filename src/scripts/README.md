# Scripts Documentation

## Tag Analytics Generation

The `generate-tag-analytics.ts` script automatically fetches all articles from your Storyblok CMS and analyzes the popularity of tags used across your content.

### How it works

1. **Fetches articles**: Retrieves all articles from the "articles/" folder with content type "article"
2. **Extracts tags**: Parses the `articleTags` field from each article (comma-separated format)
3. **Analyzes frequency**: Counts how many times each tag appears across all articles
4. **Generates statistics**: Calculates percentages and sorts tags by popularity
5. **Saves results**: Outputs a JSON file to `public/tag-analytics.json`

### Usage

#### Automatic (Recommended)

The script runs automatically during every build process:

```bash
npm run build              # Runs tag analytics + build
npm run build:production   # Runs tag analytics + production build
npm run build:preview      # Runs tag analytics + preview build
```

#### Manual

You can also run the script manually:

```bash
npm run generate:tag-analytics    # Generate tag analytics only
tsx src/scripts/test-tag-analytics.ts  # Run with test wrapper
```

### Output Format

The script generates `public/tag-analytics.json` with this structure:

```json
{
  "totalTags": 24,
  "totalArticles": 8,
  "tags": [
    {
      "name": "Sustainability",
      "count": 5,
      "percentage": 20.83
    },
    {
      "name": "MaterialProcessing",
      "count": 3,
      "percentage": 12.5
    }
  ],
  "generatedAt": "2024-01-15T10:30:00.000Z"
}
```

### Integration with Menu Component

The tag analytics are automatically consumed by the **Articles Menu** variant (`src/storyblok/Menu/Articles.astro`):

- **Top 4 tags** are displayed as clickable badges
- **Remaining tags** are available in a searchable combobox (powered by shadcn/ui)
- **Real-time search** allows users to quickly find topics
- **Article counts** are shown for each tag
- **Navigation** directs to `/articles?tag=${tagName}`

### Tag Format

Tags should be formatted as comma-separated values in the `articleTags` field:

```
PlasticRecycling,MaterialProcessing,Degassing,ProductionEfficiency,CircularEconomy
```

### Requirements

- Valid Storyblok access tokens in environment variables
- Articles must be in the "articles/" folder
- Articles must have content type "article"
- Tags should be in the `articleTags` field as a comma-separated string

### Configuration

If you have more than 100 articles, update the `per_page` parameter in the `fetchArticles()` function or implement pagination.
