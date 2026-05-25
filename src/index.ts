import { Agent } from "./agent.js";
import { loadConfig } from "./config.js";

async function main() {
  const config = loadConfig();
  const agent = new Agent(config);

  const args = process.argv.slice(2);

  if (args.length === 0) {
    // Interactive mode
    await agent.startInteractive();
  } else {
    // One-shot mode
    const prompt = args.join(" ");
    const result = await agent.run(prompt);
    console.log(result);
  }
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
