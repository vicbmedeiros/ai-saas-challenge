import OpenAI from "openai";
import { searchProducts } from "../tools/searchProducts.tool";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function chatWithAgent(
  message: string,
  companyId: string
) {
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content:
        "Você é um assistente de uma loja. Responda perguntas sobre produtos usando apenas dados retornados pelas ferramentas disponíveis. Nunca invente produtos, preços ou informações.",
    },
    {
      role: "user",
      content: message,
    },
  ];

  const firstResponse = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages,
    tools: [
      {
        type: "function",
        function: {
          name: "search_products",
          description:
            "Busca produtos reais disponíveis para a empresa do usuário autenticado.",
          parameters: {
            type: "object",
            properties: {
              search: {
                type: "string",
                description:
                  "Termo opcional para buscar no nome ou descrição.",
              },
              category: {
                type: "string",
                description: "Categoria do produto.",
              },
              minPrice: {
                type: "number",
              },
              maxPrice: {
                type: "number",
              },
            },
            additionalProperties: false,
          },
        },
      },
    ],
    tool_choice: "auto",
  });

  const assistantMessage = firstResponse.choices[0].message;

  if (!assistantMessage.tool_calls?.length) {
    return assistantMessage.content;
  }

  messages.push(assistantMessage);

  for (const toolCall of assistantMessage.tool_calls) {
    if (toolCall.type !== "function") {
      continue;
    }

    if (toolCall.function.name !== "search_products") {
      continue;
    }

    const args = JSON.parse(toolCall.function.arguments);

    const products = await searchProducts(args, companyId);

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

  return finalResponse.choices[0].message.content;
}