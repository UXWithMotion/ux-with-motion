import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { NextRequest } = require('next/server');

function load(path, mocks = {}) {
  const output = ts.transpileModule(fs.readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const loadedModule = { exports: {} };
  vm.runInNewContext(output, {
    module: loadedModule, exports: loadedModule.exports,
    require: id => id in mocks ? mocks[id] : require(id),
    process, URL, console,
  }, { filename: path });
  return loadedModule.exports;
}
const paths = load('src/lib/auth/redirect.ts');

test('return paths reject other origins and normalize path traversal', () => {
  for (const value of [null, '', 'https://evil.test', '//evil.test', '/\\evil.test', '/\nevil.test']) {
    assert.equal(paths.safeNextPath(value), '/');
  }
  assert.equal(paths.safeNextPath('/components/email-input?tab=code'), '/components/email-input?tab=code');
  assert.equal(paths.adminNextPath('/admin/components?filter=draft'), '/admin/components?filter=draft');
  for (const value of ['/admin/../login', '/admin/login', '/administrator', '//evil.test']) {
    assert.equal(paths.adminNextPath(value), '/admin');
  }
});

function proxyFixture({ signedIn = false, failure = false, refresh = false } = {}) {
  return load('src/lib/supabase/proxy.ts', {
    '@supabase/ssr': { createServerClient: (_url, _key, { cookies }) => ({
      auth: { getClaims: async () => {
        if (refresh) cookies.setAll([{ name: 'session', value: 'refreshed', options: { httpOnly: true, path: '/' } }], { 'Cache-Control': 'private, no-store' });
        if (failure) throw new Error('Auth unavailable');
        return { data: { claims: signedIn ? { sub: 'verified-user' } : null }, error: null };
      } },
    }) },
  }).updateSession;
}

test('anonymous admin requests preserve their destination and refresh cookies', async () => {
  const response = await proxyFixture({ refresh: true })(new NextRequest('https://app.test/admin/components?filter=draft'));
  const location = new URL(response.headers.get('location'));
  assert.equal(location.pathname, '/admin/login');
  assert.equal(location.searchParams.get('next'), '/admin/components?filter=draft');
  assert.equal(response.cookies.get('session').value, 'refreshed');
  assert.match(response.headers.get('cache-control'), /no-store/);
});

test('public login and library remain reachable; verified admin requests reach server role checks', async () => {
  for (const path of ['/login', '/admin/login', '/components', '/administrator']) {
    const response = await proxyFixture()(new NextRequest(`https://app.test${path}`));
    assert.equal(response.headers.get('location'), null);
  }
  const response = await proxyFixture({ signedIn: true, refresh: true })(new NextRequest('https://app.test/admin/components'));
  assert.equal(response.headers.get('location'), null);
  assert.equal(response.cookies.get('session').value, 'refreshed');
});

test('auth outages fail closed for admin routes', async () => {
  const response = await proxyFixture({ failure: true })(new NextRequest('https://app.test/admin'));
  assert.equal(new URL(response.headers.get('location')).pathname, '/admin/login');
});

function redirect(url) { throw new Error(`REDIRECT ${url}`); }
test('data guard rejects anonymous users and server-confirmed errors', async () => {
  for (const result of [{ data: { user: null }, error: null }, { data: { user: { id: 'u' } }, error: new Error('expired') }]) {
    const { requireUser } = load('src/lib/auth/require-user.ts', {
      'server-only': {}, 'next/navigation': { redirect },
      '@/lib/supabase/server': { createClient: async () => ({ auth: { getUser: async () => result } }) },
      './redirect': paths,
    });
    await assert.rejects(() => requireUser('/admin/components', '/admin/login'), /REDIRECT \/admin\/login\?next=%2Fadmin%2Fcomponents/);
  }
});

test('admin guard rejects ordinary users and role lookup errors', async () => {
  for (const role of [{ data: { role: 'user' }, error: null }, { data: null, error: new Error('offline') }, { data: { role: 'admin' }, error: null }]) {
    const supabase = { from: () => ({ select: () => ({ eq: () => ({ single: async () => role }) }) }) };
    const { requireAdmin } = load('src/lib/supabase/admin.ts', {
      'next/navigation': { redirect },
      '@/lib/auth/require-user': { requireUser: async () => ({ user: { id: 'u' }, supabase }) },
    });
    if (role.data?.role === 'admin') assert.equal((await requireAdmin()).user.id, 'u');
    else await assert.rejects(requireAdmin, /REDIRECT \/admin\/login\?error=unauthorized/);
  }
});

test('OAuth callback ignores forged forwarded hosts and handles failed exchanges', async () => {
  for (const mode of ['success', 'error', 'throw']) {
    const { GET } = load('src/app/auth/callback/route.ts', {
      '@/lib/auth/redirect': paths,
      '@/lib/supabase/server': { createClient: async () => ({ auth: { exchangeCodeForSession: async () => {
        if (mode === 'throw') throw new Error('offline');
        return { error: mode === 'error' ? new Error('bad code') : null };
      } } }) },
    });
    const response = await GET(new Request('https://app.test/auth/callback?code=test&next=//evil.test', { headers: { 'x-forwarded-host': 'evil.vercel.app' } }));
    const location = new URL(response.headers.get('location'));
    assert.equal(location.origin, 'https://app.test');
    assert.equal(location.pathname, mode === 'success' ? '/' : '/login');
  }
});
