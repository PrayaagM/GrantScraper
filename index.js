import OpenAI from "openai";
import { messages, model } from "./prompt.js";

const openai = new OpenAI({
  apiKey: "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",
});

const runPromptOnData = async (data) => {

  const chatCompletion = await openai.chat.completions.create({
    model: model,
    response_format : {type : "json_object"},
    messages: [...messages, {role : "user", content: data}]
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

export default runPromptOnData;
