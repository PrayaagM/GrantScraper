# GrantScraper
Scrapes BBF (Business Benefits Finder) for all grants and outputs them in valid JSON format.

## Getting Started

Clone the repository. Run `npm install`.
Go to [text](https://innovation.ised-isde.canada.ca/s/group-groupe?language=en_CA&token=a0BOG000001cip32AA)

This the page that the scraper will scrape from. Configure options on the page based on your preferences. For example, you can allow for tax credits, filter grants to only one province, and filter grants by industry. Changing these options will provide a new link. To use this new link in the scraper, update the `mainUrl` in `./index.js` to this new link.

The current link allows for all open grants in Canada (no tax-credits or loans). As of 27th April, there are 463 of these.

## Using the Scraper

Once the link is set, we will scrape data from the BBF and parse it. This will take two steps.

##### Step 1) Scraping.
To beign scraping, run command `node ./grantScraper.js`. A chrome page will open and will be still for ~10 seconds. Then, it will begin scraping grants one-by-one on the link specified above. While it scrapes, it will produce logs in realitime. In your project directory, the scraper will produce a file with title such as `logs-1714354072489.txt`. This file has information about which grant it is currently scraping, how many grants it has scraped so far, any grant it has skipped thus far, and any errors the scraper might run into.

The scraper will also produce a file with a name such as `ExtractedGrants-logs-1714354072489.json`. This file contains the scraped and AI-Generated grant information.

NOTE: The scraper takes into account common popups and tries to check for them and close them. However, the BBF updates overtime and includes new popups, which might break the distrupt the scraper. If this happens, then there is a way for you to resume progress by passing in an additional argument to the command to run the scraper.

For example, suppose the scraper is running and has scraped 300 grants so far. Suddenly, it runs into an unexpected popup and terminates. We still want to collect the remaining grants, but we do not want to re-scrape the first 300 because this is a waste of time and tokens. So, instead of re-running the scraper from the start, what we would want to do is run the following command: `node ./grantScraper.js 300`, which will begin scraping at the 300th grant. Then, you can concatenate the resulting JSONs.

##### Step 2) Parsing.

Once you have your JSON, titled something like `ExtractedGrants-logs-1714354072489.json`, run the command `node ./parser.js ExtractedGrants-logs-1714354072489.json`. This will produce a file named `CleanedGrantInfo.json`.

This data in this file will be relativley more clean than the scraped data, as it looks for null values and such.

NOTE: RUNNING THE PARSER COMMAND WILL ALSO OVERWRITE ANY EXISTING FILE NAMED `CleanedGrantInfo.json`.


##### Step 3) Using the JSON.

Given the JSON, ideally we want to convert it to a CSV and then into Airtable. 
One way to convert it to a CSV is to use MS Office Excel's Power Query feature.

In a Blank Workbook, create a Power Query, select the JSON option, and then select the file produced from Step 2. This will put all of your JSON into Excel. By clicking the dropdown on the table created, we can convert the table into a CSV.

Alternatively, there are other steps for importing a JSON into Airtable.
See here: [text](https://community.airtable.com/t5/other-questions/getting-started-with-airtable-importing-json-data-structure/td-p/58619)




At the end of a successful use, your project directory should look like this:
![Image 1](/public/directory.png)

Your files will look something like this (but probably much larger):

![Image 2](/public/cleanedInfo.png)

![Image 3](/public/rawInfo.png)

![Image 4](/public/logs.png)