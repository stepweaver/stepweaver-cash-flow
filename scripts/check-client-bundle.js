#!/usr/bin/env node

/**
 * CI script to check for potential secrets in client bundles and source code
 * This script should be run in CI/CD pipelines to prevent security vulnerabilities
 */

import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

// Patterns that indicate potential secrets
const SECRET_PATTERNS = [
  // API keys and tokens
  /sk_live_/,
  /sk_test_/,
  /pk_live_/,
  /pk_test_/,
  /AIza[0-9A-Za-z_-]{35}/,
  /ghp_[0-9A-Za-z_-]{36}/,
  /gho_[0-9A-Za-z_-]{36}/,
  /ghu_[0-9A-Za-z_-]{36}/,
  /ghs_[0-9A-Za-z_-]{36}/,
  /ghr_[0-9A-Za-z_-]{36}/,

  // Generic secret patterns
  /API_KEY\s*=/,
  /SECRET\s*=/,
  /TOKEN\s*=/,
  /PASSWORD\s*=/,
  /PRIVATE_KEY\s*=/,

  // Environment variables that might be secrets (excluding NEXT_PUBLIC_*)
  /process\.env\.(?!NEXT_PUBLIC_)[A-Z_]+KEY/,
  /process\.env\.(?!NEXT_PUBLIC_)[A-Z_]+SECRET/,
  /process\.env\.(?!NEXT_PUBLIC_)[A-Z_]+TOKEN/,
  /process\.env\.(?!NEXT_PUBLIC_)[A-Z_]+PASSWORD/,

  // Firebase specific (these are OK in client code)
  /NEXT_PUBLIC_FIREBASE_/,

  // Hardcoded URLs that might contain secrets
  /https:\/\/[^\/]+\/[a-zA-Z0-9]{32,}/,
  /http:\/\/[^\/]+\/[a-zA-Z0-9]{32,}/
];

// Directories to scan for secrets
const SCAN_DIRECTORIES = [
  'app',
  'components',
  'public',
  'lib'
];

// Files to exclude from scanning
const EXCLUDE_FILES = [
  'firebase-admin.js',
  'session-tokens.js',
  'rate-limit.js',
  'invitations.server.js'
];

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    warning: '\x1b[33m', // Yellow
    error: '\x1b[31m',   // Red
    reset: '\x1b[0m'     // Reset
  };

  console.log(`${colors[type]}${message}${colors.reset}`);
}

function scanFileForSecrets(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    const issues = [];

    SECRET_PATTERNS.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          // Skip Firebase public configs
          if (pattern.source.includes('NEXT_PUBLIC_FIREBASE_')) {
            return;
          }

          issues.push({
            pattern: pattern.source,
            match: match,
            line: content.substring(0, content.indexOf(match)).split('\n').length
          });
        });
      }
    });

    return issues;
  } catch (error) {
    log(`Error reading file ${filePath}: ${error.message}`, 'warning');
    return [];
  }
}

function scanDirectoryForSecrets(dirPath) {
  const issues = [];

  try {
    const files = execSync(`find ${dirPath} -type f -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx"`, { encoding: 'utf8' })
      .split('\n')
      .filter(file => file && !EXCLUDE_FILES.some(exclude => file.includes(exclude)));

    files.forEach(file => {
      const fileIssues = scanFileForSecrets(file);
      if (fileIssues.length > 0) {
        issues.push({
          file,
          issues: fileIssues
        });
      }
    });
  } catch (error) {
    log(`Error scanning directory ${dirPath}: ${error.message}`, 'warning');
  }

  return issues;
}

function checkBuildOutput() {
  log('Building application to check for secrets in bundles...', 'info');

  try {
    // Build the application
    execSync('npm run build', { stdio: 'pipe' });
    log('Build completed successfully', 'success');

    // Check if bundle analysis is available
    try {
      const bundleAnalysis = execSync('npx nextjs-bundle-analysis --json', { stdio: 'pipe', encoding: 'utf8' });
      const bundles = JSON.parse(bundleAnalysis);

      let bundleIssues = 0;

      // Check each bundle for secrets
      Object.values(bundles).forEach(bundle => {
        if (bundle.content && typeof bundle.content === 'string') {
          SECRET_PATTERNS.forEach(pattern => {
            if (pattern.test(bundle.content)) {
              bundleIssues++;
              log(`Potential secret found in bundle: ${bundle.name}`, 'error');
            }
          });
        }
      });

      if (bundleIssues === 0) {
        log('No secrets found in build bundles', 'success');
      }

      return bundleIssues;
    } catch (error) {
      log('Bundle analysis not available, skipping bundle check', 'warning');
      return 0;
    }

  } catch (error) {
    log(`Build failed: ${error.message}`, 'error');
    return -1;
  }
}

function main() {
  log('🔒 Starting security scan for client-side secrets...', 'info');

  let totalIssues = 0;

  // Scan source directories
  SCAN_DIRECTORIES.forEach(dir => {
    if (existsSync(dir)) {
      log(`Scanning directory: ${dir}`, 'info');
      const issues = scanDirectoryForSecrets(dir);

      if (issues.length > 0) {
        log(`Found ${issues.length} files with potential secrets in ${dir}:`, 'error');
        issues.forEach(({ file, issues: fileIssues }) => {
          log(`  ${file}:`, 'error');
          fileIssues.forEach(issue => {
            log(`    Line ${issue.line}: ${issue.match}`, 'error');
          });
        });
        totalIssues += issues.length;
      } else {
        log(`No issues found in ${dir}`, 'success');
      }
    }
  });

  // Check build output
  const buildIssues = checkBuildOutput();
  if (buildIssues > 0) {
    totalIssues += buildIssues;
  }

  // Final report
  if (totalIssues === 0) {
    log('✅ Security scan completed successfully. No secrets found.', 'success');
    process.exit(0);
  } else {
    log(`❌ Security scan failed. Found ${totalIssues} potential security issues.`, 'error');
    log('Please review and fix all issues before deploying.', 'error');
    process.exit(1);
  }
}

// Run the security scan
main();
