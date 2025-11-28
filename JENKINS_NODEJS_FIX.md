# Fix: libatomic.so.1 Missing Error in Jenkins

## Problem
When running `npm install` in Jenkins pipeline, you get:
```
node: error while loading shared libraries: libatomic.so.1: cannot open shared object file: No such file or directory
```

## Root Cause
Node.js requires the `libatomic.so.1` library, which is not installed on the Jenkins server.

## Quick Fix (Run on Jenkins Server)

SSH into your Jenkins server and run:

```bash
sudo apt update
sudo apt install -y libatomic1
```

If you get any other missing library errors, also install:
```bash
sudo apt install -y build-essential libatomic1
```

**After installation, restart Jenkins:**
```bash
sudo systemctl restart jenkins
```

## Verification

After installing, verify Node.js works:
```bash
node --version
npm --version
```

## Permanent Fix

The setup script has been updated to include this dependency automatically. For future installations:
- The `setup-jenkins-server.sh` script now installs `libatomic1` and `build-essential`

## Alternative Solution: Use Docker for npm install

If you prefer to isolate npm install, you can modify the Jenkinsfile to run npm install inside Docker containers. However, the system-level fix above is recommended for simplicity.

## Additional Troubleshooting

If you encounter other missing libraries, check which ones Node.js needs:
```bash
ldd $(which node) | grep "not found"
```

Install any missing libraries shown in the output.

## For Existing Jenkins Installations

1. **SSH to Jenkins server:**
   ```bash
   ssh -i your-key.pem ubuntu@<jenkins-ip>
   ```

2. **Install the library:**
   ```bash
   sudo apt update
   sudo apt install -y libatomic1 build-essential
   ```

3. **Restart Jenkins:**
   ```bash
   sudo systemctl restart jenkins
   ```

4. **Verify in Jenkins:**
   - Go to: Manage Jenkins → Tools → NodeJS installations
   - Make sure Node.js is properly installed
   - Test by running a simple pipeline stage with `node --version`

## Why This Happens

Some Linux distributions (especially minimal Ubuntu/Debian images) don't include all system libraries required by Node.js. The `libatomic` library provides atomic operations that Node.js uses internally, especially for multi-threaded operations.

