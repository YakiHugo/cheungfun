import { execSync } from "node:child_process";
import { registerTool } from "./registry.js";

registerTool(
  {
    name: "run_command",
    description: "Execute a shell command and return stdout/stderr",
    parameters: {
      type: "object",
      properties: {
        command: { type: "string", description: "Shell command to execute" },
        workdir: {
          type: "string",
          description: "Working directory (defaults to cwd)",
        },
        timeout: {
          type: "number",
          description: "Timeout in seconds (default 30)",
        },
      },
      required: ["command"],
    },
  },
  (args) => {
    const command = args.command as string;
    const workdir = (args.workdir as string) || process.cwd();
    const timeout = ((args.timeout as number) || 30) * 1000;

    try {
      const output = execSync(command, {
        cwd: workdir,
        timeout,
        encoding: "utf-8",
        maxBuffer: 1024 * 1024,
        stdio: ["pipe", "pipe", "pipe"],
      });
      return JSON.stringify({ exit_code: 0, output });
    } catch (err: unknown) {
      const e = err as {
        status?: number;
        stdout?: string;
        stderr?: string;
      };
      return JSON.stringify({
        exit_code: e.status ?? 1,
        output: e.stdout || "",
        error: e.stderr || String(err),
      });
    }
  }
);
