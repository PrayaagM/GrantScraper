import fs from "fs";

const Usage = () => {
    console.log("USAGE: node ./parser.js [FILE NAME]");
    process.exit(1);
}

if (process.argv.length !== 3) {
    Usage();
}

const fileName = process.argv[2];

const data = JSON.parse(fs.readFileSync(fileName, "utf-8"));
let grants = [];

console.log(data[1]);
for (let item of data) {
	let new_item = item;

	if (item.Eligible_Industires) {
		new_item.Eligible_Industries = item.Eligible_Industires;
	} else {
		new_item.Eligible_Industries = item.Eligible_Industries;
	}

    if (typeof new_item.Eligible_Industries === 'object') {
        new_item.Eligible_Industries = new_item.Eligible_Industries.join(',');
    }

    if (typeof new_item.Eligible_Region === 'object') {
        new_item.Eligible_Region = new_item.Eligible_Region.join(', ');
    }

    if (typeof new_item.Amount === 'object') {
        new_item.Amount = new_item.Amount.max;
    }

	grants.push(new_item);
}

fs.writeFileSync("./CleanedGrantInfo.json", JSON.stringify(grants, null, 2), 'utf-8');
