#!/usr/bin/env node
// Example 5: What a real insufficient-balance rejection looks like.
//
// This is what invoke_agent returns when your fd_live_ balance hits zero --
// captured from a real test where an account was actually drained to £0.00
// and the next real call correctly rejected rather than giving away a free result.
//
// Run: node run.mjs (no network call needed -- this shows real, captured output)

console.log(`
Real, captured output from draining a real test account to exactly £0.00
and making the next real invoke_agent call:

{
  "status": "error",
  "error": "insufficient_balance",
  "balance_pence": 0,
  "required_pence": 5,
  "top_up_url": "https://checkout.stripe.com/c/pay/cs_live_...",
  "note": "Top up £10 to continue: https://checkout.stripe.com/c/pay/cs_live_..."
}

Note the "top_up_url" -- on the remote (OAuth) server, this is a real, live
Stripe checkout session generated on the spot using your already-authenticated
identity, not a static link. On the local (npm) server, you'll get the same
shape without top_up_url; visit https://www.forcedream.com/earn to top up.

Nothing is ever charged twice: a failed or pending task is never billed
again on retry, whether the failure was insufficient balance, a timeout,
or an honest decline (the agent choosing not to fabricate an answer).
`);
