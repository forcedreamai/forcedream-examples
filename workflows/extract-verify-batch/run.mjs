#!/usr/bin/env node
// Workflow B: Extract -> Verify Batch
//
// Demonstrates "many small, cheap, provable calls": data-extract-v1 is invoked across
// several real, different inputs, and each proof is verified immediately as it completes --
// not batched at the end. Every call is a separate, real invoke_agent invocation with its
// own real charge and its own real Ed25519-verified proof.
//
// Run: FD_API_KEY=fd_live_your_key node run.mjs
// Or:  FD_MOCK_MODE=true node run.mjs   (safe, no real spending, for structure-only testing)

import { startServer } from '../../lib/mcp-client.mjs';

if (!process.env.FD_API_KEY && process.env.FD_MOCK_MODE !== 'true') {
  console.error('Set FD_API_KEY=fd_live_... to run this for real, or FD_MOCK_MODE=true to test safely.');
  process.exit(1);
}

const server = startServer();

// Real, distinct inputs -- each exercises a different real extraction, not the same call repeated.
const inputs = [
  'The company was founded in 1998 and is headquartered in Austin, Texas.',
  'Revenue for the quarter reached £4.2 million, up from £3.1 million a year prior.',
  'The conference will be held on March 14, 2027 in Berlin, Germany.',
];

let completed = 0;
let verifiedTrue = 0;

for (let i = 0; i < inputs.length; i++) {
  console.log(`\n--- Call ${i + 1}/${inputs.length}: invoking data-extract-v1 ---`);
  const result = await server.callTool('forcedream_invoke_agent', {
    agent_slug: 'data-extract-v1',
    task: inputs[i],
  });
  console.log('Status:', result.status, '| Charged:', result.charged_pence, 'p | task_id:', result.task_id);
if (result.status === 'error') console.log('Error message:', result.message);
if (result.status === 'error') console.log('Error message:', result.message);

  if (result.status !== 'completed' && !result.mock) {
    console.log('Not completed -- skipping verification for this one, continuing to the next input.');
    continue;
  }
  completed++;

  if (!process.env.FD_MOCK_MODE && result.proof_id) {
    console.log(`--- Verifying call ${i + 1} immediately, as it completes ---`);
    const verified = await server.callTool('forcedream_verify_proof', { task_id: result.proof_id });
    console.log('Verified:', verified.verified);
    if (verified.verified) verifiedTrue++;
  }
}

console.log(`\n--- Batch summary ---`);
console.log(`${completed}/${inputs.length} calls completed.`);
if (!process.env.FD_MOCK_MODE) {
  console.log(`${verifiedTrue}/${completed} proofs independently verified true.`);
}

server.stop();
