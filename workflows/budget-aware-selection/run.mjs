#!/usr/bin/env node
// Workflow C: Budget-Aware Selection Before Spend
//
// Demonstrates a real pattern: use the free, keyless tools (forcedream_search_costs,
// forcedream_search_reliability) to select a cost-appropriate agent BEFORE spending
// anything, rather than invoking blindly. Selection rule: among agents at or under a
// real budget threshold, prefer the one with the best known real success_rate; fall back
// to cheapest if no reliability data exists yet for any candidate.
//
// Run: FD_API_KEY=fd_live_your_key node run.mjs
// Or:  FD_MOCK_MODE=true node run.mjs   (safe, no real spending, for structure-only testing)

import { startServer } from '../../lib/mcp-client.mjs';

const BUDGET_PENCE = 15;

if (!process.env.FD_API_KEY && process.env.FD_MOCK_MODE !== 'true') {
  console.error('Set FD_API_KEY=fd_live_... to run this for real, or FD_MOCK_MODE=true to test safely.');
  process.exit(1);
}

const server = startServer();

console.log(`--- Step 1: real, free cost search -- agents at or under ${BUDGET_PENCE}p ---`);
const costs = await server.callTool('forcedream_search_costs', { max_price_pence: BUDGET_PENCE });
console.log(`Found ${costs.count} candidate(s) within budget.`);

if (costs.count === 0) {
  console.log('No agents within budget -- stopping rather than invoking something unaffordable.');
  server.stop();
  process.exit(1);
}

console.log('\n--- Step 2: real, free reliability search -- checking each candidate ---');
const reliability = await server.callTool('forcedream_search_reliability', {});
const reliabilityBySlug = {};
for (const r of (reliability.agents ?? reliability ?? [])) {
  if (r.agent_slug) reliabilityBySlug[r.agent_slug] = r.reliability;
}

console.log('\n--- Step 3: real selection -- best known success_rate among in-budget candidates, cheapest as fallback ---');
let selected = null;
let bestRate = -1;
for (const agent of costs.agents) {
  const rel = reliabilityBySlug[agent.slug];
  const rate = rel && typeof rel.success_rate === 'number' ? rel.success_rate : -1;
  console.log(`  ${agent.slug}: ${agent.price_per_call_pence}p, success_rate=${rate === -1 ? 'unknown' : rate}`);
  if (rate > bestRate) {
    bestRate = rate;
    selected = agent;
  }
}
// Fallback: if nothing had known reliability data, prefer the cheapest in-budget candidate.
if (bestRate === -1) {
  selected = [...costs.agents].sort((a, b) => a.price_per_call_pence - b.price_per_call_pence)[0];
}

console.log(`\nSelected: ${selected.slug} (${selected.price_per_call_pence}p, success_rate=${bestRate === -1 ? 'unknown, cheapest fallback' : bestRate})`);

console.log(`\n--- Step 4: invoking the selected agent for real ---`);
const result = await server.callTool('forcedream_invoke_agent', {
  agent_slug: selected.slug,
  task: 'A short, real test task appropriate for this agent.',
});
console.log('Status:', result.status, '| Charged:', result.charged_pence, 'p | task_id:', result.task_id);
if (result.status === 'error') console.log('Error message:', result.message);
if (result.status === 'error') console.log('Error message:', result.message);

if (!process.env.FD_MOCK_MODE && result.proof_id) {
  console.log('\n--- Verifying the resulting proof ---');
  const verified = await server.callTool('forcedream_verify_proof', { task_id: result.proof_id });
  console.log('Verified:', verified.verified);
}

server.stop();
