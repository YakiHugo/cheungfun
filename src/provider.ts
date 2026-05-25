import OpenAI from "openai";
import type { Config } from "./config.js";

export interface Message {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_call_id?: string;
  tool_calls?: ToolCall[];
}

export interface ToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

export interface Tool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export class Provider {
  private client: OpenAI;
  private model: string;

  constructor(config: Config) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
    });
    this.model = config.model;
  }

  async chat(
    messages: Message[],
    tools?: Tool[]
  ): Promise<{ message: Message; usage?: { prompt: number; completion: number } }> {
    const params: OpenAI.ChatCompletionCreateParamsNonStreaming = {
      model: this.model,
      messages: messages as OpenAI.ChatCompletionMessageParam[],
    };

    if (tools && tools.length > 0) {
      params.tools = tools.map((t) => ({
        type: "function" as const,
        function: {
          name: t.name,
          description: t.description,
          parameters: t.parameters,
        },
      }));
    }

    const response = await this.client.chat.completions.create(params);
    const choice = response.choices[0];

    return {
      message: {
        role: "assistant",
        content: choice.message.content || "",
        tool_calls: choice.message.tool_calls as ToolCall[] | undefined,
      },
      usage: response.usage
        ? {
            prompt: response.usage.prompt_tokens,
            completion: response.usage.completion_tokens,
          }
        : undefined,
    };
  }
}
