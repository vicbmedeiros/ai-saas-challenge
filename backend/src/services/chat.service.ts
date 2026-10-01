import OpenAI from "openai";
import { searchProducts } from "../tools/searchProducts.tool";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type SearchProductsArgs = {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
};

export async function chatWithAgent(
  message: string,
  companyId: string
) {
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content:
        "You are an assistant for an e-commerce company. Use the available tools whenever the user asks about products, prices, categories, availability or product information. Never invent product data.",
    },
    {
      role: "user",
      content: message,
    },
  ];

  const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
    {
      type: "function",
      function: {
        name: "search_products",
        description:
          "Search products available to the authenticated company.",
        parameters: {
          type: "object",
          properties: {
            search: {
              type: "string",
              description:
                "Text used to search product name or description.",
            },
            category: {
              type: "string",
              description: "Product category.",
            },
            minPrice: {
              type: "number",
              description: "Minimum product price.",
            },
            maxPrice: {
              type: "number",
              description: "Maximum product price.",
            },
          },
          additionalProperties: false,
        },
      },
    },
  ];

  const firstResponse = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages,
    tools,
    tool_choice: "auto",
  });

  const firstChoice = firstResponse.choices[0];

  if (!firstChoice) {
    throw new Error("LLM returned no response");
  }

  const assistantMessage = firstChoice.message;

  if (!assistantMessage.tool_calls?.length) {
    return (
      assistantMessage.content ??
      "I could not generate a response."
    );
  }

  messages.push(assistantMessage);

  for (const toolCall of assistantMessage.tool_calls) {
    if (
      toolCall.type !== "function" ||
      toolCall.function.name !== "search_products"
    ) {
      continue;
    }

    let args: SearchProductsArgs;

    try {
      args = JSON.parse(
        toolCall.function.arguments || "{}"
      ) as SearchProductsArgs;
    } catch {
      throw new Error("LLM returned invalid tool arguments");
    }

    const products = await searchProducts(
      args,
      companyId
    );

    messages.push({
      role: "tool",
      tool_call_id: toolCall.id,
      content: JSON.stringify(products),
    });
  }

  const finalResponse = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages,
  });

  const finalChoice = finalResponse.choices[0];

  if (!finalChoice) {
    throw new Error("LLM returned no final response");
  }

  return (
    finalChoice.message.content ??
    "I could not generate a final response."
  );
}