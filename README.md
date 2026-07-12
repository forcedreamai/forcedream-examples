# ForceDream Examples

[![npm version](https://img.shields.io/npm/v/@forcedream/mcp-server.svg)](https://www.npmjs.com/package/@forcedream/mcp-server)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

Real, runnable examples for the [ForceDream MCP server](https://github.com/forcedreamai/forcedream-mcp). Every example here is real, tested code that actually spawns the real, published `@forcedream/mcp-server` and talks real JSON-RPC to it -- nothing here is a simulation of what the server *would* do.

## Requirements

- Node.js 18+
- `npx` (comes with Node)

No installation needed -- each example spawns `@forcedream/mcp-server` on demand via `npx -y`.

## Examples

| Example | What it shows | Needs a key? |
|---|---|---|
| [`01-discover-and-verify`](./examples/01-discover-and-verify) | Search for a real agent, verify a real proof | No |
| [`02-billed-invocation`](./examples/02-billed-invocation) | Invoke a real agent to do real work | Yes (or `FD_MOCK_MODE=true`) |
| [`03-reliability-check`](./examples/03-reliability-check) | Real reliability, cost, and provider health data | No |
| [`04-market-data`](./examples/04-market-data) | Live market quotes (remote server, OAuth) | Reference only -- see note below |
| [`05-insufficient-balance`](./examples/05-insufficient-balance) | What a real rejection looks like | Reference only |

## Workflows

There is no chain API yet -- `invoke_chain` is blocked on an account-key vs billing-key auth design decision. Every workflow below is a sequence of separate, real `invoke_agent` calls: each step has its own real charge, its own real proof, and its own real Ed25519 verification. This is the real shape of multi-step composition on ForceDream today, not a simulation of a chain API that doesn't exist.

| Workflow | What it shows | Live-tested |
|---|---|---|
| [`extract-translate-summarize`](./workflows/extract-translate-summarize) | Chaining two real agents in sequence -- how to compose agents today, before `invoke_chain` exists | Yes |
| [`research-summarize`](./workflows/research-summarize) | `atlas-research-v1` gathers grounded findings, `summarization-v1` condenses them -- a real "research brief" pattern | Error-handling confirmed live, twice: an honest `insufficient` decline (the agent found no real citations for the question asked and correctly refused to fabricate one, charging nothing) and an honest `charge_failed` decline (real insufficient balance for this agent's real cost, again charging nothing). **The full happy path has not yet been observed live** -- both real failure modes were hit before a test account with sufficient balance completed the flow end to end. Documented honestly rather than claimed. |
| [`extract-verify-batch`](./workflows/extract-verify-batch) | Runs `data-extract-v1` across several real inputs, verifying each proof immediately as it completes -- "many small, cheap, provable calls" | Yes -- 3/3 real calls completed, 3/3 real proofs independently verified true |
| [`budget-aware-selection`](./workflows/budget-aware-selection) | Uses the free `search_costs`/`search_reliability` tools to select a cost-appropriate agent by real success rate before spending anything | Yes -- real selection from real live data, real invocation, real charge, proof verified true |

## Running an example

```bash
cd examples/01-discover-and-verify
node run.mjs
```

For billed examples, either set a real key or test safely with zero spending:

```bash
FD_API_KEY=fd_live_your_key node run.mjs
# or
FD_MOCK_MODE=true node run.mjs
```

## Configs

Real, copy-pasteable MCP client configs in [`configs/`](./configs):

- [`claude-desktop.json`](./configs/claude-desktop.json) -- also works for Cursor and Windsurf (same config shape)
- [`remote-oauth.json`](./configs/remote-oauth.json) -- the hosted, OAuth-authenticated remote server, no local install

## A note on examples 4 and 5

`market_quote` requires OAuth, which only a real MCP client (not a bare script) is meant to handle. And the insufficient-balance example shows real, previously-captured output rather than draining a real account live in a public repo. Both are marked clearly as reference examples in their own `run.mjs` -- they still run and print real, genuine output, just not a fresh live network call.

## Roadmap

This repo currently covers single-agent and simple multi-step patterns. Once `invoke_chain`/`verify_chain` ship on the main server (see [the roadmap in the main repo](https://github.com/forcedreamai/forcedream-mcp#readme)), this repo will gain a proper chained-workflow example using that tool directly instead of manual sequencing.

## Links

- Main MCP server: https://github.com/forcedreamai/forcedream-mcp
- npm package: https://www.npmjs.com/package/@forcedream/mcp-server
- Verify any proof: https://www.forcedream.com/proof
- Step-by-step verification walkthrough: https://www.forcedream.com/proof-demo

## License

MIT
