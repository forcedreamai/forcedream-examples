#!/usr/bin/env node
// Workflow A: Research -> Summarize
//
// A real "research brief" pattern: atlas-research-v1 gathers grounded findings on a real
// question, then summarization-v1 condenses them. Two separate, sequential invoke_agent
// calls -- there is no chain API yet (invoke_chain is blocked on an account-key vs
// billing-key auth design decision). Each step is its own real charge, its own real proof,
// verified independently. This is the real shape of multi-step workflows on ForceDream
// today, not a simulation of one.
//
// Run: FD_API_KEY=fd_live_your_key node run.mjs
// Or:  FD_MOCK_MODE=true node run.mjs   (safe, no real spending, for structure-only testing)

import { startServer } from '../../lib/mcp-client.mjs';

if (!process.env.FD_API_KEY && process.env.FD_MOCK_MODE !== 'true') {
  console.error('Set FD_API_KEY=fd_live_... to run this for real, or FD_MOCK_MODE=true to test safely.');
  process.exit(1);
}

const server = startServer();

console.log('--- Step 1: atlas-research-v1 gathers real, grounded findings ---');
const research = await server.callTool('forcedream_invoke_agent', {
  agent_slug: 'atlas-research-v1',
  task: 'What is the Model Context Protocol (MCP) and who introduced it?',
});
console.log(JSON.stringify(research, null, 2));

if (!(research.mock || research.status === 'completed')) {
  console.log('\nStep 1 did not complete -- stopping rather than summarizing incomplete or absent research.');
  server.stop();
  process.exit(1);
}

console.log('\n--- Step 2: summarization-v1 condenses the real research output ---');
const summary = await server.callTool('forcedream_invoke_agent', {
  agent_slug: 'summarization-v1',
  task: `Summarize this research finding in 2-3 sentences: ${JSON.stringify(research.output ?? research)}`,
});
console.log(JSON.stringify(summary, null, 2));

console.log('\n--- Real proofs from this workflow ---');
if (research.proof_id) console.log(`Research step:      ${research.proof_id}`);
if (summary.proof_id) console.log(`Summarization step: ${summary.proof_id}`);

if (!process.env.FD_MOCK_MODE && research.proof_id) {
  console.log('\n--- Verifying step 1 (research) ---');
  const v1 = await server.callTool('forcedream_verify_proof', { task_id: research.proof_id });
  console.log('Verified:', v1.verified);
}
if (!process.env.FD_MOCK_MODE && summary.proof_id) {
  console.log('\n--- Verifying step 2 (summarization) ---');
  const v2 = await server.callTool('forcedream_verify_proof', { task_id: summary.proof_id });
  console.log('Verified:', v2.verified);
}

server.stop();
