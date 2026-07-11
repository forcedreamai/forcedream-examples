#!/usr/bin/env node
// Example 4: Live market data via the remote server's market_quote tool.
//
// This tool is remote-server-only -- it requires an OAuth access token, which
// this example does not implement (that's the MCP client's job in real use).
// Shown here for reference; see the README for how OAuth-authenticated tools
// work on the remote server (https://api.forcedream.ai/v1/mcp).
//
// Run: node run.mjs

console.log(`
market_quote is a remote-server-only tool, authenticated via OAuth 2.1 + PKCE.
A real MCP client (Claude Desktop, Cursor, etc.) handles this automatically
when you connect to https://api.forcedream.ai/v1/mcp as a remote server --
you'll be prompted to authorize with your fd_live_ key the first time you
invoke a billed tool.

Real, tested output from this exact tool (captured during development):

{
  "symbol": "AAPL",
  "price": 316.22,
  "change_percent": 0.903,
  "volume": 48124490,
  "day_high": 316.53,
  "day_low": 308.16,
  "liquidity_score": 96,
  "worm_seal": "361b02d720c3c4d68c5a"
}

To try this for real: add the remote server as shown in the main README's
"Quick start (remote, OAuth)" section, then ask your MCP client to
"get a market quote for AAPL".
`);
