#!/usr/bin/env node
// Example 3: Check real, system-measured reliability before invoking an agent.
//
// Run: node run.mjs
//
// Keyless -- no FD_API_KEY needed. Spends nothing.

import { startServer } from '../../lib/mcp-client.mjs';

const server = startServer();

console.log('--- forcedream_search_reliability: real success rate and latency for data-extract-v1 ---');
const reliability = await server.callTool('forcedream_search_reliability', { agent_slug: 'data-extract-v1' });
console.log(JSON.stringify(reliability, null, 2));

console.log('\n--- forcedream_search_costs: real price per call, capped at 15p ---');
const costs = await server.callTool('forcedream_search_costs', { max_price_pence: 15 });
console.log(`Found ${costs.count} real agents at or under 15p per call.`);

console.log('\n--- forcedream_search_providers: live inference-provider health ---');
const providers = await server.callTool('forcedream_search_providers', {});
console.log(JSON.stringify(providers, null, 2));

console.log('\nAll three of these are the same real, system-measured data the platform\'s own adaptive routing uses internally -- nothing self-reported.');

server.stop();
