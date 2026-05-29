# Cheungfun 🥟

A coding agent for learning how AI coding agents work.

This is a study project — reading source code from OpenCode, Claude Code, Codex and others, then rebuilding the core ideas from scratch.

## Focus

Currently focused on building a GUI-based coding agent. The terminal CLI is a stepping stone.

## Stack

- TypeScript
- OpenAI-compatible API (MiMo, etc.)

## Project Structure

```
src/
├── index.ts        # Entry point
├── agent.ts        # Agent loop & conversation
├── provider.ts     # LLM provider abstraction
├── config.ts       # Configuration
└── tools/
    ├── registry.ts # Tool registration system
    ├── file.ts     # File read/write/edit
    ├── shell.ts    # Shell command execution
    └── search.ts   # Code search
vendor/             # (gitignored) Reference source code
├── codex/          # OpenAI Codex
├── opencode/       # OpenCode
└── claude-code-source/  # Claude Code (reconstructed)
```

## Quick Start

```bash
npm install
npm run dev -- "your prompt here"
```

## Reference

Source code in `vendor/` is for study only, not part of this project.

## License

MIT
