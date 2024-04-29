import { By, Builder, } from "selenium-webdriver";
import { model, messages } from "../prompt.js";
import "chromedriver";
import fs from "fs";
import runPromptOnData from "../index.js";
import openaiTokenCounter from 'openai-gpt-token-counter';

class Logger {

  constructor(file) {
    this.file = file;
    fs.writeFile(this.file, "", (err, data) => {});
  }

  async log(line) {
    fs.appendFile(this.file, line + '\n', (err, data) => {});
  }

};

async function wait(seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

const scrape = async () => {
  let driver = await new Builder().forBrowser("chrome").build();
  const url = "https://innovation.ised-isde.canada.ca/s/list-liste?language=en_CA&token=a0BOG000001Ukcl2AC";
  
  let logger = new Logger("logs.txt");
  await driver.get(url);

  // Setting a 10 second wait to allow all grants to load in
  await wait(10);
  await logger.log("Beginning Scrape.");

  let grants = [];
  let found = true;
  let i = 0;

  while (found) {

    let expandButtons = await driver.findElements(By.css("div.expand-target"));

    for (let index = i; index < expandButtons.length; ++index) {
      await expandButtons[index].click();
      await wait(3); // 3 second wait to allow current accordian to fully open

      let grantButtons = await driver.findElements(By.css("a.btn-yellow"));
      let grantButtonsLength = grantButtons.length;
      let currentGrantButton = grantButtons[grantButtonsLength - 1];

      const grantURL = await currentGrantButton.getAttribute("href");

      let driver2 = await new Builder().forBrowser("chrome").build();
      await driver2.get(grantURL);

      const grantTitle = await driver2.getTitle();
      const htmlTag = await driver2.findElement(By.tagName("html"));
      const grantInfo = await htmlTag.getText();

      await logger.log(`[${i}] : Scraped - ${grantTitle}`);

      const tokenCount = openaiTokenCounter.chat([...messages, {role : "user", content : grantInfo}], model);
      
      // 20481 is the maximum number of tokens we can spend for gpt-3.5-turbo-1106.
      // If the scraped data exceeds this number, then we should just skip this grant
      if (tokenCount > 20481) {
        logger.log(`${grantTitle}'s page requires ${tokenCount} > 20481 tokens. Skipping it for now.`);
        logger.log(`[ SKIPPED ] - ${grantTitle} - ${grantURL}`);
        ++i;
        continue;
      };

      // Running GPT on the grant page's contents
      let extractedGrantInfo = await runPromptOnData(grantInfo);
      try {
        extractedGrantInfo['Link'] = grantURL;
      } catch {
        // if the gpt output is not JSON:
        logger.log(`${grantTitle}'s page was not outputted in valid JSON. Skipping it for now.`);
        logger.log(`[ SKIPPED ] - ${grantTitle} - ${grantURL}`);
        console.log(extractedGrantInfo);
        ++i;
        continue;

      }

      await logger.log(`[${i}] : Extracted Information - ${grantTitle}`);

      await wait(4);

      grants.push(extractedGrantInfo);
      fs.writeFile("./ExtractedGrants.txt", JSON.stringify(grants), (err, data) => {});
      ++i;

      setTimeout(() => {
        driver2.quit();
      }, 3000)
    }

    await driver.findElement(By.css("button#moreBtn")).click();
    await wait(3);
    found = (await driver.findElements(By.css("button#moreBtn"))).length != 0;
  }


  console.log(grants);
};

scrape();
