import * as fs from "node:fs";
import * as path from "node:path";
import { registerTool } from "./registry.js";

registerTool(
  {
    name: "search_files",
    description: "Search for a pattern in files using regex",
    parameters: {
      type: "object",
      properties: {
        pattern: { type: "string", description: "Regex pattern to search" },
        path: {
          type: "string",
          description: "Directory or file to search in",
        },
        glob: {
          type: "string",
          description: "File glob filter (e.g. '*.ts')",
        },
        limit: {
          type: "number",
          description: "Max results to return (default 30)",
        },
      },
      required: ["pattern"],
    },
  },
  (args) => {
    const searchPath = (args.path as string) || ".";
    const pattern = new RegExp(args.pattern as string, "g");
    const globFilter = args.glob as string | undefined;
    const limit = (args.limit as number) || 30;

    const results: Array<{ file: string; line: number; match: string }> = [];

    function searchDir(dir: string) {
      if (results.length >= limit) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        if (results.length >= limit) break;
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          if (
            entry.name === "node_modules" ||
            entry.name === ".git" ||
            entry.name === "dist"
          )
            continue;
          searchDir(fullPath);
        } else if (entry.isFile()) {
          if (globFilter && !matchGlob(entry.name, globFilter)) continue;

          try {
            const content = fs.readFileSync(fullPath, "utf-8");
            const lines = content.split("\n");
            for (let i = 0; i < lines.length; i++) {
              if (results.length >= limit) break;
              pattern.lastIndex = 0;
              if (pattern.test(lines[i])) {
                results.push({
                  file: fullPath,
                  line: i + 1,
                  match: lines[i].trim().slice(0, 200),
                });
              }
            }
          } catch {
            // skip binary files
          }
        }
      }
    }

    searchDir(path.resolve(searchPath));
    return JSON.stringify({ matches: results });
  }
);

function matchGlob(filename: string, glob: string): boolean {
  if (glob.startsWith("*.")) {
    return filename.endsWith(glob.slice(1));
  }
  return filename === glob;
}
