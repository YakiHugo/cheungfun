# Cheungfun 🥟

A coding agent that writes code like rolling rice noodle sheets — smooth, precise, and layered.

## What is Cheungfun?

Cheungfun is a coding agent built for terminal workflows. It reads your codebase, understands your intent, and executes changes with the precision of a dim sum chef.

## Features

- Terminal-native coding agent
- Multi-model support (MiMo, Claude, GPT, etc.)
- File reading, writing, and editing
- Shell command execution
- Git-aware workflows
- Tool-use architecture

## Quick Start

```bash
npm install
npm run build
npm start
```

## Architecture

```
src/
├── index.ts        # Entry point
├── agent.ts        # Agent loop & conversation management
├── tools/          # Tool implementations
│   ├── registry.ts # Tool registration system
│   ├── file.ts     # File read/write/edit
│   ├── shell.ts    # Shell command execution
│   └── search.ts   # Code search
├── provider.ts     # LLM provider abstraction
└── config.ts       # Configuration
```

## License

MIT
