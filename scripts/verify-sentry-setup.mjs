const token = process.env.SENTRY_AUTH_TOKEN;
const org = process.env.SENTRY_ORG || 'flat-earth-equipment';
const project = process.env.SENTRY_PROJECT || 'javascript-nextjs';
const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN || '';
const testRelease = process.env.VERIFY_SENTRY_TEST_RELEASE === '1' || process.argv.includes('--test-release');

function fail(code, msg){ console.error(msg); process.exit(code); }
function ok(msg){ console.log(msg); }

function validateDsn(s){
  // Loose but useful validation
  const re = /^https:\/\/.+@o\d+\.ingest\.[\w.-]+\.sentry\.io\/\d+$/i;
  return re.test(s);
}

async function api(path, opts={}){
  const r = await fetch(`https://sentry.io${path}`, {
    ...opts,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(opts.headers||{})
    }
  });
  return r;
}

(async()=>{
  if (!token) fail(2, 'Missing SENTRY_AUTH_TOKEN');
  if (!org)   fail(2, 'Missing SENTRY_ORG');
  if (!project) fail(2, 'Missing SENTRY_PROJECT');
  if (!dsn)   fail(2, 'Missing SENTRY_DSN (or NEXT_PUBLIC_SENTRY_DSN)');
  if (!validateDsn(dsn)) fail(3, `DSN format looks wrong: ${dsn}`);

  ok('✓ Env present and DSN looks OK');

  // 1) Can the token list org projects?
  let r = await api(`/api/0/organizations/${org}/projects/`);
  if (!r.ok) fail(4, `Org projects API failed: ${r.status} ${await r.text()}`);
  const projects = await r.json();
  const found = projects.some(p => p.slug === project);
  if (!found) fail(5, `Project slug '${project}' not visible to token (org='${org}')`);
  ok(`✓ Token can access project '${project}' in org '${org}'`);

  // 2) Fetch single project detail
  r = await api(`/api/0/projects/${org}/${project}/`);
  if (!r.ok) fail(5, `Project detail API failed: ${r.status} ${await r.text()}`);
  ok('✓ Project detail accessible');

  // 3) Optional: create+delete a throwaway release to validate permissions
  if (testRelease){
    const version = `verify-${Date.now()}`;
    ok(`Creating test release '${version}' …`);
    let cr = await api(`/api/0/organizations/${org}/releases/`, {
      method: 'POST',
      body: JSON.stringify({ version, projects: [project] })
    });
    if (!cr.ok) fail(6, `Create release failed: ${cr.status} ${await cr.text()}`);
    ok('✓ Release created');

    ok('Deleting test release …');
    const dr = await api(`/api/0/organizations/${org}/releases/${encodeURIComponent(version)}/`, { method: 'DELETE' });
    if (!dr.ok) fail(6, `Delete release failed: ${dr.status} ${await dr.text()}`);
    ok('✓ Release deleted');
  }

  ok('\n✅ Sentry verification PASS');
  process.exit(0);
})().catch(e=> fail(1, e?.message || String(e)));
