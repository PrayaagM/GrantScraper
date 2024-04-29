import { By, Builder } from "selenium-webdriver";
import "chromedriver";
import fs from "fs";
import openaiTokenCounter from "openai-gpt-token-counter";
import { model, messages } from "./prompt.js";
import runPromptOnData, {mainUrl as url} from "./index.js";

class Logger {
	constructor(file) {
		this.file = file;
		fs.writeFile(this.file, "", (err, data) => {});
	}

	async log(line) {
		fs.appendFile(this.file, line + "\n", (err, data) => {});
	}
}

const wait = async (seconds) => {
	return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
};

// Checks for popups and closes if found.
const checkPopup = async (driver) => {
	let popUps = await driver.findElements(By.css("button.offer-close-button"));
	if (popUps.length != 0) {
		await popUps[0].click();
		await logger.log("Popup averted!");
	}
};

const scrape = async () => {

	const currentTime = Date.now().toString();

	let logger = new Logger(`logs-${currentTime}.txt`);
	
	const startingValue = process.argv.length > 2 ? (parseInt(process.argv[2]) - 1) : 0;
	if (isNaN(startingValue)) {
		await logger.log("Bad starting value. Quitting Script. Please enter a value greater than 1, lesser than ~670");
		return;
	}
	await logger.log(`Starting Value : ${startingValue}`);

	let driver = await new Builder().forBrowser("chrome").build();

	await driver.get(url);

	// Setting a 10 second wait to allow all grants to load in
	await wait(10);
	await logger.log("Beginning Scrape.");

	// closing the bottom section
	// let closeOtherResults = await driver.findElement(By.css("[aria-label='More results for you - 62 Results']"));
	// await closeOtherResults.click();

	let grants = [];
	let found = true;
	let i = startingValue;

	while (found) {

		let expandButtons = await driver.findElements(By.css(`div[data-targetid='dov-Funding-${i}']`));
		
		if (expandButtons.length != 0) {
			
			await checkPopup(driver);
			await expandButtons[0].click();
			await wait(3); // 3 second wait to allow current accordian to fully open

			let grantButtons = await driver.findElements(By.css("a.btn-yellow"));
			let grantDiv = await driver.findElement(By.css("div.callout-dov"));
			
			let currentGrantButton = grantButtons[grantButtons.length - 1];

			const grantURL = await currentGrantButton.getAttribute("href");

			let driver2 = await new Builder().forBrowser("chrome").build();
			await driver2.get(grantURL);

			const grantTitle = await driver2.getTitle();
			const htmlTag = await driver2.findElement(By.tagName("html"));
			const grantInfo = (await grantDiv.getText()) + (await htmlTag.getText());
			console.log(grantInfo);

			await logger.log(`[${i}] : Scraped - ${grantTitle}`);

			const tokenCount = openaiTokenCounter.chat([...messages, { role: "user", content: grantInfo }], model);

			// 20481 is the maximum number of tokens we can spend for gpt-3.5-turbo-1106.
			// If the scraped data exceeds this number, then we should just skip this grant
			if (tokenCount > 20481) {
				logger.log(`${grantTitle}'s page requires ${tokenCount} > 20481 tokens. Skipping it for now.`);
				logger.log(`[ SKIPPED ] - ${grantTitle} - ${grantURL}`);
				++i;
				continue;
			}

			// Running GPT on the grant page's contents
			let extractedGrantInfo = await runPromptOnData(grantInfo);
			try {
				extractedGrantInfo["Link"] = grantURL;
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
			await checkPopup(driver);
			await expandButtons[0].click();
			await wait(2);

			grants.push(extractedGrantInfo);
			fs.writeFile(`./ExtractedGrants-${currentTime}.json`, JSON.stringify(grants), (err, data) => {});
			++i;

			setTimeout(() => {
				driver2.quit();
			}, 3000);
		} else {
			found = (await driver.findElements(By.css("div.more-drop"))).length != 0;
			found && (await driver.findElement(By.css("div.more-drop")).click());
		}


	}

	console.log(grants);
};

scrape();
