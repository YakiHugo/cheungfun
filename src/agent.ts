import * as readline from "node:readline";
import type { Config } from "./config.js";
import { Provider, type Message } from "./provider.js";
import { getToolDefinitions, executeTool } from "./tools/registry.js";

// Import tools to register them
import "./tools/file.js";
import "./tools/shell.js";
import "./tools/search.js";

const SYSTEM_PROMPT = `You are Cheungfun, a coding agent.
You help users write, edit, and understand code.
You have access to tools for reading/writing files, running commands, and searching code.

Guidelines:
- Read files before editing them
- Run tests after making changes
- Be concise and precise
- Explain what you're doing before using tools`;

export class Agent {
  private provider: Provider;
  private config: Config;
  private messages: Message[] = [];

  constructor(config: Config) {
    this.config = config;
    this.provider = new Provider(config);
  }

  async run(prompt: string): Promise<string> {
    this.messages.push({ role: "system", content: SYSTEM_PROMPT });
    this.messages.push({ role: "user", content: prompt });

    const tools = getToolDefinitions();

    for (let turn = 0; turn < this.config.maxTurns; turn++) {
      const { message } = await this.provider.chat(this.messages, tools);
      this.messages.push(message);

      // If no tool calls, return the response
      if (!message.tool_calls || message.tool_calls.length === 0) {
        return message.content;
      }

      // Execute tool calls
      for (const toolCall of message.tool_calls) {
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(toolCall.function.arguments);
        } catch {
          // empty args
        }

        const result = await executeTool(toolCall.function.name, args);

        this.messages.push({
          role: "tool",
          content: result,
          tool_call_id: toolCall.id,
        });
      }
    }

    return "Max turns reached.";
  }

  async startInteractive(): Promise<void> {
    console.log("🥟 Cheungfun v0.1.0");
    console.log(`Model: ${this.config.model}`);
    console.log("Type your prompt, or /exit to quit.\n");

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const ask = () => {
      rl.question("❯ ", async (input) => {
        const trimmed = input.trim();
        if (!trimmed) {
          ask();
          return;
        }
        if (trimmed === "/exit") {
          rl.close();
          return;
        }

        try {
          const response = await this.run(trimmed);
          console.log(`\n${response}\n`);
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          console.error(`\nError: ${message}\n`);
        }

        ask();
      });
    };

    ask();
  }
}
