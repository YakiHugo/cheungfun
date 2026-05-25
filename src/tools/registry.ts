import type { Tool } from "../provider.js";

export type ToolHandler = (
  args: Record<string, unknown>
) => Promise<string> | string;

interface RegisteredTool {
  definition: Tool;
  handler: ToolHandler;
}

const tools = new Map<string, RegisteredTool>();

export function registerTool(definition: Tool, handler: ToolHandler): void {
  tools.set(definition.name, { definition, handler });
}

export function getToolDefinitions(): Tool[] {
  return Array.from(tools.values()).map((t) => t.definition);
}

export async function executeTool(
  name: string,
  args: Record<string, unknown>
): Promise<string> {
  const tool = tools.get(name);
  if (!tool) {
    return JSON.stringify({ error: `Unknown tool: ${name}` });
  }

  try {
    return await tool.handler(args);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return JSON.stringify({ error: message });
  }
}
