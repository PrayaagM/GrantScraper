import OpenAI from "openai";
import { messages, model } from "./prompt.js";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;

const openai = new OpenAI({ apiKey });

const runPromptOnData = async (data) => {
	const chatCompletion = await openai.chat.completions.create({
		model: model,
		response_format: { type: "json_object" },
		messages: [...messages, { role: "user", content: data }],
	});

	let retVal;
	try {
		retVal = await JSON.parse(chatCompletion.choices[0].message.content);
	} catch {
		retVal = chatCompletion.choices[0].message.content;
	} finally {
		return retVal;
	}
};

const mainUrl = "https://innovation.ised-isde.canada.ca/s/group-groupe?language=en_CA&token=a0BOG000001cip32AA";

export default runPromptOnData;
export { mainUrl };
