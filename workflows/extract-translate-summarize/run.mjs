#!/usr/bin/env node
// Workflow: chain multiple real agents together -- extract, then translate.
//
// This is not a special "chain" tool (invoke_chain doesn't exist yet -- see
// the main README's roadmap section). It's just multiple real invoke_agent
// calls in sequence, which is how you'd compose agents today.
//
// Run: FD_API_KEY=fd_live_your_key node run.mjs
// Or:  FD_MOCK_MODE=true node run.mjs   (safe, no real spending)

import { startServer } from '../../lib/mcp-client.mjs';

if (!process.env.FD_API_KEY && process.env.FD_MOCK_MODE !== 'true') {
  console.error('Set FD_API_KEY=fd_live_... to run this for real, or FD_MOCK_MODE=true to test safely.');
  process.exit(1);
}

const server = startServer();

console.log('Step 1: extract structured fields from raw text (data-extract-v1)');
const extracted = await server.callTool('invoke_agent', {
  agent_slug: 'data-extract-v1',
  task: "Extract the company name and founding year from: 'Acme Corp, founded in 1998'",
});
console.log(JSON.stringify(extracted, null, 2));

if (extracted.mock || extracted.status === 'completed') {
  console.log('\nStep 2: translate the extracted result (translation-v1)');
  const translated = await server.callTool('invoke_agent', {
    agent_slug: 'translation-v1',
    task: `Translate this into Spanish: ${JSON.stringify(extracted.output ?? extracted)}`,
  });
  console.log(JSON.stringify(translated, null, 2));

  console.log('\n--- Real proofs to verify (if not in mock mode) ---');
  if (extracted.proof_id) console.log(`Step 1 proof: ${extracted.proof_id}`);
  if (translated.proof_id) console.log(`Step 2 proof: ${translated.proof_id}`);
} else {
  console.log('\nStep 1 did not complete -- stopping the chain rather than continuing on bad data.');
}

server.stop();
