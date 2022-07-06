import * as common from '../common/index.mjs';

import assert from 'assert';
import events from 'events';
import http from 'http';
import url from 'url';

assert.strictEqual(typeof globalThis.fetch, 'function');
assert.strictEqual(typeof globalThis.FormData, 'function');
assert.strictEqual(typeof globalThis.Headers, 'function');
assert.strictEqual(typeof globalThis.Request, 'function');
assert.strictEqual(typeof globalThis.Response, 'function');

common.expectWarning(
  'ExperimentalWarning',
  'The Fetch API is an experimental feature. This feature could change at any time'
);

const server = http.createServer((req, res) => {
  // TODO: Remove this once keep-alive behavior can be disabled from the client
  // side.
  res.setHeader('Keep-Alive', 'timeout=0, max=0');

  const queryObject = url.parse(req.url, true).query;

  if(queryObject.redirect) {
    // redirect to the same URL with a different query string
    return res.writeHead(302, {}).end();
  }
  return res.end('Hello world');
});
server.listen(0);
await events.once(server, 'listening');
const port = server.address().port;

let response = await fetch(`http://localhost:${port}`);

assert(response instanceof Response);
assert.strictEqual(response.status, 200);
assert.strictEqual(response.statusText, 'OK');
let body = await response.text();
assert.strictEqual(body, 'Hello world');


response = await fetch(`http://localhost:${port}?redirect=true`);

assert(response instanceof Response);
assert.strictEqual(response.status, 302);
assert.strictEqual(response.statusText, 'Found');
body = await response.text();
assert.strictEqual(body, '');

server.close();
