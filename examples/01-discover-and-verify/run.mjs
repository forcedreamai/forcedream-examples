#!/usr/bin/env node
// Example 1: Discover a real agent, then verify a real, completed proof.
//
// Run: node run.mjs
//
// Uses only keyless tools -- no FD_API_KEY needed. Spends nothing.

import { startServer } from '../../lib/mcp-client.mjs';

const server = startServer();

console.log('--- forcedream_search_agents: discovering real agents matching "data-extract-v1" ---');
const search = await server.callTool('forcedream_search_agents', { query: 'data-extract-v1' });
console.log(JSON.stringify(search, null, 2));

console.log('\n--- forcedream_verify_proof: verifying a real, completed task from that agent ---');
const verify = await server.callTool('forcedream_verify_proof', { task_id: 'wtask_b73a713ee586c884ac3a' });
console.log(JSON.stringify(verify, null, 2));

if (verify.verified) {
  console.log('\n✓ Genuine, unaltered ForceDream output -- checked entirely in this process.');
} else {
  console.log('\n✗ Verification failed -- see output above.');
}

server.stop();
