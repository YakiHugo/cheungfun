import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

export interface Config {
  provider: string;
  model: string;
  apiKey: string;
  baseUrl: string;
  maxTurns: number;
  workingDir: string;
}

export function loadConfig(): Config {
  const home = os.homedir();
  const configDir = path.join(home, ".cheungfun");

  // Load .env if exists
  const envPath = path.join(configDir, ".env");
  if (fs.existsSync(envPath)) {
    const env = fs.readFileSync(envPath, "utf-8");
    for (const line of env.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        process.env[key] = val;
      }
    }
  }

  return {
    provider: process.env.CHEUNGFUN_PROVIDER || "openai-compatible",
    model: process.env.CHEUNGFUN_MODEL || "mimo-v2.5",
    apiKey: process.env.CHEUNGFUN_API_KEY || process.env.OPENAI_API_KEY || "",
    baseUrl:
      process.env.CHEUNGFUN_BASE_URL ||
      process.env.OPENAI_BASE_URL ||
      "https://api.openai.com/v1",
    maxTurns: parseInt(process.env.CHEUNGFUN_MAX_TURNS || "50", 10),
    workingDir: process.cwd(),
  };
}
