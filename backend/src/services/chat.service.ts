import OpenAI from "openai";

import {
  parseSearchProductsInput,
  searchProducts,
} from "../tools/searchProducts.tool";

import type {
  ChatHistoryMessage,
} from "../validators/chat.validator";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = "gpt-4.1-mini";
const MAX_TOOL_ITERATIONS = 5;

const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "search_products",
      description:
        "Search products available to the authenticated company. Use this whenever the user asks about products, prices, categories, recommendations, cheapest items, expensive items, availability or product comparisons.",
      parameters: {
        type: "object",
        properties: {
          search: {
            type: "string",
            description:
              "Optional text used to search product name or description.",
          },
          category: {
            type: "string",
            description:
              "Optional product category.",
          },
          minPrice: {
            type: "number",
            description:
              "Optional minimum product price.",
          },
          maxPrice: {
            type: "number",
            description:
              "Optional maximum product price.",
          },
        },
        additionalProperties: false,
      },
    },
  },
];

export async function chatWithAgent(
  message: string,
  companyId: string,
  history: ChatHistoryMessage[] = []
) {
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `
You are an AI shopping assistant for a multi-tenant SaaS product catalog.

Important rules:
- You only have access to products returned by the available tools.
- Never invent product names, prices, categories or availability.
- Whenever the user asks about products, prices, categories, recommendations, cheapest items, most expensive items, availability or comparisons, use the search_products tool.
- Use the conversation history to understand follow-up questions such as "e o mais barato?", "e abaixo de 200?", or "qual deles você recomenda?".
- If a follow-up question refers to a previous product query, use that context when deciding how to search.
- If the user asks for the cheapest or most expensive product, retrieve the relevant products first and compare the returned prices.
- If the user asks for recommendations, base them only on the returned catalog data.
- If no matching products are found, clearly say that no matching product was found.
- Never mention or infer data from another company.
- The authenticated company is controlled by the server, not by you or the user.
- Answer in the same language as the user.
- Keep answers concise and useful.
      `.trim(),
    },
  ];

  for (const item of history.slice(-20)) {
    messages.push({
      role: item.role,
      content: item.content,
    });
  }

  messages.push({
    role: "user",
    content: message,
  });

  for (
    let iteration = 0;
    iteration < MAX_TOOL_ITERATIONS;
    iteration++
  ) {
    const response =
      await openai.chat.completions.create({
        model: MODEL,
        messages,
        tools,
        tool_choice: "auto",
      });

    const choice = response.choices[0];

    if (!choice) {
      throw new Error("LLM returned no response");
    }

    const assistantMessage = choice.message;

    messages.push(assistantMessage);

    if (!assistantMessage.tool_calls?.length) {
      return (
        assistantMessage.content ??
        "I could not generate a response."
      );
    }

    for (const toolCall of assistantMessage.tool_calls) {
      if (
        toolCall.type !== "function" ||
        toolCall.function.name !== "search_products"
      ) {
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify({
            error: "Unsupported tool",
          }),
        });

        continue;
      }

      let rawArgs: unknown;

      try {
        rawArgs = JSON.parse(
          toolCall.function.arguments || "{}"
        );
      } catch {
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify({
            error: "Invalid JSON arguments",
          }),
        });

        continue;
      }

      const parsedArgs =
        parseSearchProductsInput(rawArgs);

      if (!parsedArgs.success) {
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify({
            error: "Invalid tool arguments",
            details: parsedArgs.error.flatten(),
          }),
        });

        continue;
      }

      try {
        const products = await searchProducts(
          parsedArgs.data,
          companyId
        );

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify({
            count: products.length,
            products,
          }),
        });
      } catch (error) {
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify({
            error:
              error instanceof Error
                ? error.message
                : "Failed to search products",
          }),
        });
      }
    }
  }

  throw new Error(
    "Maximum tool iterations reached"
  );
}