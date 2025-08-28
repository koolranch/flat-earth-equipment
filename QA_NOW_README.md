# QA Now Runner - One-Shot Build & Test

A comprehensive one-command solution for building and testing your Next.js application with automatic server management.

## 🚀 Quick Start

```bash
# Local development (auto-starts server)
npm run qa:now

# With environment variables
npm run qa:now -- --base-url=http://localhost:3000 --learner=uuid --course=uuid

# Production testing (no server start)
npm run qa:now -- --base-url=https://www.flatearthequipment.com --learner=uuid --course=uuid
```

## 🎯 What It Does

The `qa:now` command orchestrates a complete build and QA pipeline:

1. **🏗️ Build Phase**
   - Runs `npm run build`
   - Triggers postbuild security scanner
   - Validates TypeScript compilation
   - Generates static pages and assets

2. **🖥️ Server Management** (Local Only)
   - Detects if BASE_URL is localhost/127.0.0.1
   - Automatically starts Next.js server (`npm start`)
   - Waits for server readiness (up to 2 minutes)
   - Gracefully shuts down server after QA completion

3. **🧪 QA Suite**
   - **i18n Scan**: Validates internationalization setup
   - **Cert E2E**: Tests certificate generation and PDF creation
   - **Playwright Tests**: Runs full end-to-end test suite

## 📋 Command Reference

### Basic Usage

```bash
npm run qa:now
```
- Uses default localhost:3000
- Auto-starts local server
- Runs complete QA suite

### With CLI Arguments

```bash
npm run qa:now -- --base-url=URL --learner=UUID --course=UUID
```

**Arguments:**
- `--base-url`: Target server URL (default: http://localhost:3000)
- `--learner`: Learner ID for cert testing (optional)
- `--course`: Course ID for cert testing (optional)

### Environment Detection

**Local Targets** (auto-server start):
- `http://localhost:3000`
- `http://127.0.0.1:3000`
- Any localhost/127.0.0.1 URL

**Remote Targets** (no server start):
- `https://www.flatearthequipment.com`
- Any non-localhost URL

## 🔧 Configuration

### Environment Variables

The runner respects these environment variables:

```bash
BASE_URL=http://localhost:3000    # Default server URL
LEARNER_ID=uuid                   # For cert E2E testing
COURSE_ID=uuid                    # For cert E2E testing
```

### Server Timeout

- **Startup Timeout**: 120 seconds (2 minutes)
- **Health Check**: HTTP GET every 800ms
- **Graceful Shutdown**: 2 second wait before force kill

## 📊 Output Examples

### Successful Local Run

```
🧪 QA Runner — build → (auto-start) → qa:all
--------------------------------------------------
BASE_URL   = http://localhost:3000

🏗️  Step 1: Building application...
✅ Build completed successfully

▶️  Step 2: Starting Next server (npm start)…
⏳ Waiting for server to be ready...
✅ Server is up and ready at http://localhost:3000

🧪 Step 3: Running QA suite...
✅ QA Suite: All tests passed

🎉 QA Runner completed successfully!
--------------------------------------------------
✅ Build: Success
✅ Server: Started and ready
✅ QA Suite: All tests passed

⏹  Stopping Next server…
✅ Server stopped successfully
```

### Remote Target Run

```
🧪 QA Runner — build → (auto-start) → qa:all
--------------------------------------------------
BASE_URL   = https://www.flatearthequipment.com

🏗️  Step 1: Building application...
✅ Build completed successfully

🌐 Step 2: Remote target detected — skipping local server boot
   Assuming server is already running at https://www.flatearthequipment.com

🧪 Step 3: Running QA suite...
✅ QA Suite: All tests passed
```

## 🚨 Error Handling

### Build Failures

```
❌ QA Runner failed
--------------------------------------------------
Error: Command failed: npm run build

🔍 Troubleshooting:
   1. Check if all dependencies are installed: npm install
   2. Verify TypeScript compilation errors
   3. Check for linting issues
```

### Server Start Failures

```
❌ Local server not reachable at http://localhost:3000. Start it first: 
   npm start
```

### QA Suite Failures

```
❌ QA Runner failed
--------------------------------------------------
Error: Command failed: npm run qa:all

🔍 Troubleshooting:
   1. Check individual QA commands: npm run qa:i18n, npm run qa:cert
   2. Verify environment variables are set correctly
   3. Ensure server can handle test requests
```

## 🔄 Process Management

### Signal Handling

The runner handles graceful shutdown on:
- `SIGINT` (Ctrl+C)
- `SIGTERM` (Process termination)

### Server Cleanup

```javascript
// Graceful shutdown sequence:
1. Send SIGINT to server process
2. Wait 2 seconds for graceful shutdown
3. Force kill with SIGKILL if still running
4. Report cleanup status
```

## 🎛️ Integration with Existing Scripts

The `qa:now` runner integrates with your existing npm scripts:

```json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "qa:i18n": "node scripts/scan_i18n.mjs",
    "qa:cert": "node scripts/run-cert-e2e.mjs", 
    "test:e2e": "playwright test",
    "qa:all": "npm run qa:i18n && npm run qa:cert && npm run test:e2e",
    "qa:now": "node scripts/qa-run-now.mjs"
  }
}
```

## 🚀 CI/CD Usage

### GitHub Actions

```yaml
- name: Run QA Suite
  run: npm run qa:now -- --base-url=https://staging.example.com
  env:
    LEARNER_ID: ${{ secrets.QA_LEARNER_ID }}
    COURSE_ID: ${{ secrets.QA_COURSE_ID }}
```

### Local Development

```bash
# Quick local test
npm run qa:now

# Full production simulation
npm run qa:now -- --base-url=https://www.flatearthequipment.com
```

## 🔍 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill existing processes on port 3000
   lsof -ti:3000 | xargs kill -9
   ```

2. **Environment Variables Missing**
   ```bash
   # Set required variables
   export LEARNER_ID="your-uuid-here"
   export COURSE_ID="your-uuid-here"
   ```

3. **Server Won't Start**
   ```bash
   # Test server manually
   npm run build
   npm start
   ```

4. **QA Tests Failing**
   ```bash
   # Run individual components
   npm run qa:i18n
   npm run qa:cert
   npm run test:e2e
   ```

### Debug Mode

For verbose output, check the individual script logs:
- Build logs: Available in terminal output
- Server logs: Inherited from `npm start`
- QA logs: From individual qa:* commands

## 📈 Performance

**Typical Run Times:**
- Build: 30-60 seconds
- Server Start: 2-5 seconds  
- QA Suite: 1-3 minutes
- **Total: 2-5 minutes**

**Resource Usage:**
- Memory: ~500MB during build
- CPU: High during build, moderate during tests
- Network: Depends on test suite requirements

---

**Need Help?** Check the troubleshooting section or run individual commands to isolate issues.
