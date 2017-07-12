# Scrape Wordpress Plugins

I'm in ur plugins getting ur stats.

### What it Does

Scrapes the wordpress repository for plugins matching a phrase, and exports the title, description, link and install count to a spreadsheet. BONUS POINTS: calculates the mean install amount for a given phrase, and highlights plugins that are installed one standard deviation above the mean. Baller. 

### How to Run This Thing

**Note: Requires Node 7.0 or higher**

1. Download
2. Run `npm install` to install dependencies
3. From the download directory, run `node scrape2.js -q <searchterm>` (Example: `node scrape2.js -q "sitewit"). Note that phrases must be in quotes.
4. The plugin will create a workbook if it doesn't already exist in the source directory. To add to an existing workbook, simply put a workbook in the root, name it `plugins.xlsx` and it'll add to it. Too much work? Just let it make it, then it'll add to it on subsequent queries.
5. PROFIT.


