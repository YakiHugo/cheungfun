import * as fs from "node:fs";
import * as path from "node:path";
import { registerTool } from "./registry.js";

// Read file
registerTool(
  {
    name: "read_file",
    description: "Read a text file and return its contents with line numbers",
    parameters: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Absolute or relative path to the file",
        },
        offset: {
          type: "number",
          description: "Line number to start reading from (1-indexed)",
        },
        limit: {
          type: "number",
          description: "Maximum number of lines to read",
        },
      },
      required: ["path"],
    },
  },
  (args) => {
    const filePath = path.resolve(args.path as string);
    if (!fs.existsSync(filePath)) {
      return JSON.stringify({ error: `File not found: ${filePath}` });
    }
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");
    const offset = Math.max(1, (args.offset as number) || 1) - 1;
    const limit = (args.limit as number) || 500;
    const slice = lines.slice(offset, offset + limit);

    const numbered = slice
      .map((line, i) => `${offset + i + 1}|${line}`)
      .join("\n");

    return JSON.stringify({
      content: numbered,
      total_lines: lines.length,
    });
  }
);

// Write file
registerTool(
  {
    name: "write_file",
    description: "Write content to a file, creating directories as needed",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", description: "File path to write" },
        content: { type: "string", description: "Content to write" },
      },
      required: ["path", "content"],
    },
  },
  (args) => {
    const filePath = path.resolve(args.path as string);
    const dir = path.dirname(filePath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, args.content as string, "utf-8");
    return JSON.stringify({ success: true, path: filePath });
  }
);

// Edit file (find and replace)
registerTool(
  {
    name: "edit_file",
    description: "Find and replace text in a file",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", description: "File path to edit" },
        old_string: { type: "string", description: "Text to find" },
        new_string: { type: "string", description: "Replacement text" },
      },
      required: ["path", "old_string", "new_string"],
    },
  },
  (args) => {
    const filePath = path.resolve(args.path as string);
    if (!fs.existsSync(filePath)) {
      return JSON.stringify({ error: `File not found: ${filePath}` });
    }
    const content = fs.readFileSync(filePath, "utf-8");
    const oldStr = args.old_string as string;
    const newStr = args.new_string as string;

    if (!content.includes(oldStr)) {
      return JSON.stringify({ error: "old_string not found in file" });
    }

    const updated = content.replace(oldStr, newStr);
    fs.writeFileSync(filePath, updated, "utf-8");
    return JSON.stringify({ success: true });
  }
);

// List directory
registerTool(
  {
    name: "list_directory",
    description: "List files and directories at a given path",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", description: "Directory path" },
      },
      required: ["path"],
    },
  },
  (args) => {
    const dirPath = path.resolve(args.path as string);
    if (!fs.existsSync(dirPath)) {
      return JSON.stringify({ error: `Directory not found: ${dirPath}` });
    }
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const listing = entries.map((e) => ({
      name: e.name,
      type: e.isDirectory() ? "directory" : "file",
    }));
    return JSON.stringify({ entries: listing });
  }
);
