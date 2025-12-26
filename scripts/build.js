#!/usr/bin/env node

/**
 * Build Script for AZZ&CO LABS Website
 * Handles all build steps for Vercel deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.join(__dirname, '..');
const BACKEND_DIR = path.join(ROOT_DIR, 'backend');
const API_DIR = path.join(ROOT_DIR, 'api');

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command, cwd = ROOT_DIR) {
    try {
        log(`Running: ${command}`, 'cyan');
        execSync(command, { 
            cwd, 
            stdio: 'inherit',
            env: { ...process.env, NODE_ENV: 'production' }
        });
        return true;
    } catch (error) {
        log(`Error: ${error.message}`, 'red');
        return false;
    }
}

function checkDirectory(dir) {
    if (!fs.existsSync(dir)) {
        log(`Creating directory: ${dir}`, 'yellow');
        fs.mkdirSync(dir, { recursive: true });
    }
}

function verifyStructure() {
    log('\n📋 Verifying project structure...', 'blue');
    
    const requiredFiles = [
        'package.json',
        'vercel.json',
        'api/index.js',
        'backend/package.json',
        'index.html'
    ];
    
    let allPresent = true;
    requiredFiles.forEach(file => {
        const fullPath = path.join(ROOT_DIR, file);
        if (fs.existsSync(fullPath)) {
            log(`✅ ${file}`, 'green');
        } else {
            log(`❌ ${file} - MISSING`, 'red');
            allPresent = false;
        }
    });
    
    return allPresent;
}

function installBackendDependencies() {
    log('\n📦 Installing backend dependencies...', 'blue');
    
    if (!fs.existsSync(path.join(BACKEND_DIR, 'package.json'))) {
        log('❌ backend/package.json not found', 'red');
        return false;
    }
    
    return exec('npm install --production', BACKEND_DIR);
}

function verifyAPIDependencies() {
    log('\n🔍 Verifying API dependencies...', 'blue');
    
    const apiPackageJson = path.join(API_DIR, 'package.json');
    if (fs.existsSync(apiPackageJson)) {
        log('✅ api/package.json exists', 'green');
        
        // Check if node_modules exists in api directory
        const apiNodeModules = path.join(API_DIR, 'node_modules');
        if (!fs.existsSync(apiNodeModules)) {
            log('⚠️  api/node_modules not found - Vercel will install automatically', 'yellow');
        } else {
            log('✅ api/node_modules exists', 'green');
        }
    } else {
        log('⚠️  api/package.json not found - Vercel will use backend dependencies', 'yellow');
    }
    
    return true;
}

function createPublicDirectory() {
    log('\n📁 Creating public directory structure...', 'blue');
    
    // Vercel might expect a public directory, but we serve from root
    // Create a .gitkeep to ensure directory exists if needed
    const publicDir = path.join(ROOT_DIR, 'public');
    checkDirectory(publicDir);
    
    // Create a README explaining the structure
    const readmePath = path.join(publicDir, 'README.md');
    if (!fs.existsSync(readmePath)) {
        fs.writeFileSync(readmePath, `# Public Directory

This directory is created for Vercel compatibility.
Static files are actually served from the root directory (.) as specified in vercel.json.

The outputDirectory in vercel.json is set to "." which means:
- HTML files: index.html, mission.html, etc. (root)
- CSS files: styles.css (root)
- JS files: script.js, chatbot.js, etc. (root)
- API: /api/index.js (serverless function)
`);
        log('✅ Created public/README.md', 'green');
    }
    
    return true;
}

function verifyBuildOutput() {
    log('\n✅ Verifying build output...', 'blue');
    
    const staticFiles = [
        'index.html',
        'mission.html',
        'jobboat.html',
        'invest.html',
        'outwings.html',
        'contact.html',
        'styles.css',
        'script.js',
        'chatbot.js',
        'speed-insights.js'
    ];
    
    let found = 0;
    staticFiles.forEach(file => {
        const fullPath = path.join(ROOT_DIR, file);
        if (fs.existsSync(fullPath)) {
            found++;
        }
    });
    
    log(`Static files: ${found}/${staticFiles.length}`, found === staticFiles.length ? 'green' : 'yellow');
    
    // Verify API
    const apiIndex = path.join(API_DIR, 'index.js');
    if (fs.existsSync(apiIndex)) {
        log('✅ API serverless function ready', 'green');
    } else {
        log('❌ API serverless function missing', 'red');
        return false;
    }
    
    // Verify backend node_modules
    const backendNodeModules = path.join(BACKEND_DIR, 'node_modules');
    if (fs.existsSync(backendNodeModules)) {
        log('✅ Backend dependencies installed', 'green');
    } else {
        log('⚠️  Backend dependencies not installed', 'yellow');
    }
    
    return true;
}

function generateBuildReport() {
    log('\n📊 Generating build report...', 'blue');
    
    const report = {
        timestamp: new Date().toISOString(),
        buildStatus: 'success',
        structure: {
            rootPackageJson: fs.existsSync(path.join(ROOT_DIR, 'package.json')),
            vercelJson: fs.existsSync(path.join(ROOT_DIR, 'vercel.json')),
            apiDirectory: fs.existsSync(API_DIR),
            backendDirectory: fs.existsSync(BACKEND_DIR)
        },
        dependencies: {
            backendInstalled: fs.existsSync(path.join(BACKEND_DIR, 'node_modules')),
            apiInstalled: fs.existsSync(path.join(API_DIR, 'node_modules'))
        }
    };
    
    const reportPath = path.join(ROOT_DIR, '.vercel-build-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    log(`✅ Build report saved to .vercel-build-report.json`, 'green');
    
    return report;
}

// Main build process
async function build() {
    log('\n' + '='.repeat(60), 'blue');
    log('🚀 AZZ&CO LABS Website Build Script', 'blue');
    log('='.repeat(60), 'blue');
    
    // Step 1: Verify structure
    if (!verifyStructure()) {
        log('\n❌ Build failed: Project structure incomplete', 'red');
        process.exit(1);
    }
    
    // Step 2: Install backend dependencies
    if (!installBackendDependencies()) {
        log('\n❌ Build failed: Could not install backend dependencies', 'red');
        process.exit(1);
    }
    
    // Step 3: Verify API dependencies
    verifyAPIDependencies();
    
    // Step 4: Create public directory (for Vercel compatibility)
    createPublicDirectory();
    
    // Step 5: Verify build output
    if (!verifyBuildOutput()) {
        log('\n⚠️  Build completed with warnings', 'yellow');
    }
    
    // Step 6: Generate build report
    generateBuildReport();
    
    log('\n' + '='.repeat(60), 'blue');
    log('✅ Build completed successfully!', 'green');
    log('='.repeat(60), 'blue');
    log('\n📝 Next steps:', 'yellow');
    log('   1. Verify vercel.json configuration', 'cyan');
    log('   2. Check Root Directory in Vercel = "azzco-website"', 'cyan');
    log('   3. Deploy to Vercel', 'cyan');
    log('');
}

// Run build
if (require.main === module) {
    build().catch(error => {
        log(`\n❌ Build failed: ${error.message}`, 'red');
        process.exit(1);
    });
}

module.exports = { build };
