#!/usr/bin/env node
// Example 2: Invoke a real agent to do real work. Spends your balance.
//
// Run: FD_API_KEY=fd_live_your_key node run.mjs
//
// Set FD_MOCK_MODE=true instead to test with a synthetic, clearly-labeled
// response and zero real network calls or spending.

import { startServer } from '../../lib/mcp-client.mjs';

if (!process.env.FD_API_KEY && process.env.FD_MOCK_MODE !== 'true') {
  console.error('Set FD_API_KEY=fd_live_... to run this for real, or FD_MOCK_MODE=true to test safely with no spending.');
  process.exit(1);
}

const server = startServer();

console.log('--- invoke_agent: data-extract-v1 on a real text input ---');
const result = await server.callTool('invoke_agent', {
  agent_slug: 'data-extract-v1',
  task: "Extract the year from: 'founded in 1998'",
});
console.log(JSON.stringify(result, null, 2));

if (result.mock) {
  console.log('\n✓ Mock mode -- no real charge, no real network call.');
} else if (result.status === 'completed') {
  console.log(`\n✓ Charged ${result.charged_pence}p. Proof: ${result.proof_id}`);
  console.log(`  Verify it with: node ../01-discover-and-verify/run.mjs (edit the task_id first)`);
} else {
  console.log('\n✗ See output above -- likely insufficient balance or a real error.');
}

server.stop();
