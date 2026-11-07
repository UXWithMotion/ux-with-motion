import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

function load(path, mocks = {}, env = {}) {
  const { outputText } = ts.transpileModule(fs.readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  });
  const loaded = { exports: {} };
  vm.runInNewContext(outputText, {
    module: loaded, exports: loaded.exports, process: { env }, console,
    require: id => id in mocks ? mocks[id] : require(id),
  }, { filename: path });
  return loaded.exports;
}

test('payment module imports without credentials or constructing a payment client', () => {
  let constructed = 0;
  const { getRazorpay } = load('src/lib/razorpay.ts', {
    'server-only': {}, razorpay: class { constructor() { constructed++; } },
  });
  assert.equal(constructed, 0);
  assert.equal(getRazorpay(), null);
  assert.equal(constructed, 0);
});

test('both credential fields are required before client initialization', () => {
  for (const env of [{ RAZORPAY_KEY_ID: 'test-id' }, { RAZORPAY_KEY_SECRET: 'test-secret' }]) {
    const { getRazorpay } = load('src/lib/razorpay.ts', {
      'server-only': {}, razorpay: class { constructor() { throw Error('Must not initialize'); } },
    }, env);
    assert.equal(getRazorpay(), null);
  }
  let options;
  const { getRazorpay } = load('src/lib/razorpay.ts', {
    'server-only': {}, razorpay: class { constructor(value) { options = value; } },
  }, { RAZORPAY_KEY_ID: 'test-id', RAZORPAY_KEY_SECRET: 'test-secret' });
  getRazorpay();
  assert.equal(options.key_id, 'test-id');
  assert.equal(options.key_secret, 'test-secret');
});

for (const route of ['create', 'cancel']) {
  test(`${route}: unauthenticated and unconfigured requests make no payment or database mutations`, async () => {
    for (const authenticated of [false, true]) {
      let paymentChecks = 0;
      const { POST } = load(`src/app/api/subscriptions/${route}/route.ts`, {
        '@/lib/supabase/server': { createClient: async () => ({
          auth: { getUser: async () => ({ data: { user: authenticated ? { id: 'test-user' } : null } }) },
          from: () => { throw Error('Must not touch subscription data'); },
        }) },
        '@/lib/supabase/service-role': { createServiceRoleClient: () => { throw Error('Must not use privileged client'); } },
        '@/lib/razorpay': { getRazorpay: () => { paymentChecks++; return null; } },
      }, { RAZORPAY_MONTHLY_PLAN_ID: 'test-plan' });
      const response = await POST(new Request('https://app.test/api/subscriptions/' + route, {
        method: 'POST', body: JSON.stringify({ plan: 'monthly' }), headers: { 'Content-Type': 'application/json' },
      }));
      assert.equal(response.status, authenticated ? 503 : 401);
      assert.equal(paymentChecks, authenticated ? 1 : 0);
    }
  });
}
