// lib/mcp-client.mjs
// A minimal, real MCP stdio client -- spawns the actual, published @forcedream/mcp-server
// via npx and talks real JSON-RPC over stdin/stdout. This is not a mock or a simulation:
// every example in this repo runs through this exact same code path, which is the same
// thing any real MCP client (Claude Desktop, Cursor, etc.) does under the hood.

import { spawn } from 'node:child_process';

export function startServer(env = {}) {
  const child = spawn('npx', ['-y', '@forcedream/mcp-server'], {
    env: { ...process.env, ...env },
    stdio: ['pipe', 'pipe', 'inherit'],
  });

  let buffer = '';
  const pending = new Map();
  let nextId = 1;

  child.stdout.on('data', (chunk) => {
    buffer += chunk.toString();
    let idx;
    while ((idx = buffer.indexOf('\n')) !== -1) {
      const line = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 1);
      if (!line) continue;
      let msg;
      try {
        msg = JSON.parse(line);
      } catch {
        continue;
      }
      if (msg.id !== undefined && pending.has(msg.id)) {
        pending.get(msg.id)(msg);
        pending.delete(msg.id);
      }
    }
  });

  function send(method, params = {}) {
    const id = nextId++;
    const req = { jsonrpc: '2.0', id, method, params };
    return new Promise((resolve) => {
      pending.set(id, resolve);
      child.stdin.write(JSON.stringify(req) + '\n');
    });
  }

  async function callTool(name, args = {}) {
    const res = await send('tools/call', { name, arguments: args });
    if (res.error) return { isError: true, error: res.error };
    const text = res.result?.content?.[0]?.text;
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  async function listTools() {
    const res = await send('tools/list', {});
    return res.result?.tools ?? [];
  }

  function stop() {
    child.stdin.end();
    child.kill();
  }

  return { callTool, listTools, stop };
}
