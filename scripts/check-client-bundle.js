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
  // API keys and tokens (more specific patterns)
  /sk_live_[a-zA-Z0-9]{24,}/,
  /sk_test_[a-zA-Z0-9]{24,}/,
  /pk_live_[a-zA-Z0-9]{24,}/,
  /pk_test_[a-zA-Z0-9]{24,}/,
  /AIza[0-9A-Za-z_-]{35}/,
  /ghp_[0-9A-Za-z_-]{36}/,
  /gho_[0-9A-Za-z_-]{36}/,
  /ghu_[0-9A-Za-z_-]{36}/,
  /ghs_[0-9A-Za-z_-]{36}/,
  /ghr_[0-9A-Za-z_-]{36}/,

  // Generic secret patterns (more specific)
  /["']API_KEY["']\s*:\s*["'][^"']{16,}["']/,
  /["']SECRET["']\s*:\s*["'][^"']{16,}["']/,
  /["']TOKEN["']\s*:\s*["'][^"']{16,}["']/,
  /["']PASSWORD["']\s*:\s*["'][^"']{8,}["']/,
  /["']PRIVATE_KEY["']\s*:\s*["'][^"']{32,}["']/,

  // Environment variables that might be secrets (more specific, excluding NEXT_PUBLIC_*)
  /process\.env\.(?!NEXT_PUBLIC_)[A-Z_]+KEY["']\s*\|\|\s*["'][^"']{16,}["']/,
  /process\.env\.(?!NEXT_PUBLIC_)[A-Z_]+SECRET["']\s*\|\|\s*["'][^"']{16,}["']/,
  /process\.env\.(?!NEXT_PUBLIC_)[A-Z_]+TOKEN["']\s*\|\|\s*["'][^"']{16,}["']/,

  // AWS credentials
  /AKIA[0-9A-Z]{16}/,
  /aws_secret_access_key/i,

  // Database URLs with credentials
  /mongodb:\/\/[^:]+:[^@]+@/,
  /postgres:\/\/[^:]+:[^@]+@/,
  /mysql:\/\/[^:]+:[^@]+@/
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

function checkBuildOutput(buildDir = '.next') {
  log('Scanning build output for secrets...', 'info');

  if (!existsSync(buildDir)) {
    log(`Build directory ${buildDir} not found. Skipping bundle check.`, 'warning');
    return 0;
  }

  try {
    // Scan the built client chunks directly
    const clientFiles = execSync(`find ${buildDir}/static/chunks -name "*.js" 2>/dev/null || echo ""`, { encoding: 'utf8' })
      .split('\n')
      .filter(file => file.trim());

    let bundleIssues = 0;

    clientFiles.forEach(file => {
      if (existsSync(file)) {
        try {
          const content = readFileSync(file, 'utf8');
          SECRET_PATTERNS.forEach(pattern => {
            // Skip NEXT_PUBLIC_ variables as they're safe in client code
            if (pattern.source.includes('NEXT_PUBLIC_')) {
              return;
            }

            const matches = content.match(pattern);
            if (matches) {
              matches.forEach(match => {
                bundleIssues++;
                log(`Potential secret found in ${file}: ${match}`, 'error');
              });
            }
          });
        } catch (error) {
          log(`Error reading bundle file ${file}: ${error.message}`, 'warning');
        }
      }
    });

    if (bundleIssues === 0) {
      log('No secrets found in build bundles', 'success');
    }

    return bundleIssues;
  } catch (error) {
    log(`Error scanning build output: ${error.message}`, 'warning');
    return 0;
  }
}

function main() {
  log('🔒 Starting security scan for client-side secrets...', 'info');

  const buildDir = process.argv[2] || '.next';
  let totalIssues = 0;

  // If build directory exists, scan it (post-build mode)
  if (existsSync(buildDir)) {
    log('Running post-build security scan...', 'info');
    const buildIssues = checkBuildOutput(buildDir);
    if (buildIssues > 0) {
      totalIssues += buildIssues;
    }
  } else {
    // Pre-build mode: scan source directories
    log('Running pre-build security scan...', 'info');
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
