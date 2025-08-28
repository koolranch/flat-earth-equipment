import { spawn, execSync } from 'node:child_process';
import http from 'node:http';

// Parse CLI args: --base-url= --learner= --course=
const args = Object.fromEntries(process.argv.slice(2).map(kv => { 
  const [k, v] = kv.split('='); 
  return [k.replace(/^--/, ''), v ?? '']; 
}));

const BASE_URL = args['base-url'] || process.env.BASE_URL || 'http://localhost:3000';
const LEARNER_ID = args['learner'] || process.env.LEARNER_ID || '';
const COURSE_ID = args['course'] || process.env.COURSE_ID || '';

function run(cmd, extraEnv = {}) {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { stdio: 'inherit', env: { ...process.env, ...extraEnv } });
}

function isLocal(url) { 
  return /^(https?:\/\/)(localhost|127\.0\.0\.1)(:|\/|$)/i.test(url); 
}

function waitForServer(url, timeoutMs = 120000) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const tryOnce = () => {
      const req = http.get(url, res => { 
        res.resume(); 
        resolve(true); 
      }).on('error', () => {
        if (Date.now() - started > timeoutMs) {
          reject(new Error('Server did not start in time'));
        } else {
          setTimeout(tryOnce, 800);
        }
      });
      req.setTimeout(3000, () => { 
        try { req.destroy(); } catch {} 
        setTimeout(tryOnce, 800); 
      });
    };
    tryOnce();
  });
}

console.log('\n🧪 QA Runner — build → (auto-start) → qa:all');
console.log('--------------------------------------------------');
console.log('BASE_URL   =', BASE_URL);
if (!LEARNER_ID || !COURSE_ID) {
  console.log('ℹ️  LEARNER_ID/COURSE_ID not set — your cert E2E may skip or fail depending on your qa:all.');
  console.log('    Pass via CLI: --learner=<uuid> --course=<uuid>');
}

let serverProc = null;

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⚠️  Received SIGINT, cleaning up...');
  if (serverProc) {
    try { 
      serverProc.kill('SIGINT'); 
      console.log('✅ Server process terminated');
    } catch (e) {
      console.log('⚠️  Error terminating server:', e.message);
    }
  }
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n⚠️  Received SIGTERM, cleaning up...');
  if (serverProc) {
    try { 
      serverProc.kill('SIGTERM'); 
      console.log('✅ Server process terminated');
    } catch (e) {
      console.log('⚠️  Error terminating server:', e.message);
    }
  }
  process.exit(1);
});

try {
  // 1) Build (triggers postbuild security scanner)
  console.log('\n🏗️  Step 1: Building application...');
  run('npm run build');
  console.log('✅ Build completed successfully');

  // 2) Start Next server automatically for localhost targets
  const local = isLocal(BASE_URL);
  if (local) {
    console.log('\n▶️  Step 2: Starting Next server (npm start)…');
    const isWindows = /^win/.test(process.platform);
    const npmCmd = isWindows ? 'npm.cmd' : 'npm';
    
    serverProc = spawn(npmCmd, ['run', 'start'], { 
      stdio: 'inherit', 
      env: process.env,
      detached: false
    });
    
    // Handle server process errors
    serverProc.on('error', (error) => {
      console.error('❌ Failed to start server:', error.message);
      throw error;
    });
    
    serverProc.on('exit', (code, signal) => {
      if (code !== 0 && signal !== 'SIGINT' && signal !== 'SIGTERM') {
        console.error(`❌ Server exited unexpectedly with code ${code}, signal ${signal}`);
      }
    });
    
    console.log('⏳ Waiting for server to be ready...');
    await waitForServer(BASE_URL);
    console.log('✅ Server is up and ready at', BASE_URL);
  } else {
    console.log('\n🌐 Step 2: Remote target detected — skipping local server boot');
    console.log('   Assuming server is already running at', BASE_URL);
  }

  // 3) Run QA bundle
  console.log('\n🧪 Step 3: Running QA suite...');
  run('npm run qa:all', { BASE_URL, LEARNER_ID, COURSE_ID });

  console.log('\n🎉 QA Runner completed successfully!');
  console.log('--------------------------------------------------');
  console.log('✅ Build: Success');
  console.log('✅ Server:', local ? 'Started and ready' : 'Remote target used');
  console.log('✅ QA Suite: All tests passed');

} catch (e) {
  console.error('\n❌ QA Runner failed');
  console.error('--------------------------------------------------');
  console.error('Error:', e?.message || e);
  console.error('');
  console.error('🔍 Troubleshooting:');
  console.error('   1. Check if all dependencies are installed: npm install');
  console.error('   2. Verify environment variables are set correctly');
  console.error('   3. Ensure server can start on the specified port');
  console.error('   4. Check individual QA commands work: npm run qa:i18n, npm run qa:cert');
  
  process.exitCode = 1;
} finally {
  if (serverProc) {
    console.log('\n⏹  Stopping Next server…');
    try { 
      // Send SIGINT for graceful shutdown
      serverProc.kill('SIGINT');
      
      // Wait a moment for graceful shutdown
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Force kill if still running
      if (!serverProc.killed) {
        serverProc.kill('SIGKILL');
      }
      
      console.log('✅ Server stopped successfully');
    } catch (e) {
      console.log('⚠️  Error stopping server:', e.message);
    }
  }
  
  console.log('\n👋 QA Runner finished');
}
