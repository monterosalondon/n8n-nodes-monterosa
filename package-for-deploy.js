#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const sourceDir = __dirname;
const deployDir = path.join(sourceDir, 'deploy');
const packageJsonSource = path.join(sourceDir, 'package.json');
const packageJsonDest = path.join(deployDir, 'package.json');
const distSource = path.join(sourceDir, 'dist');
const distDest = path.join(deployDir, 'node_modules', 'n8n-nodes-monterosa', 'dist');

console.log('🚀 Starting packaging process for DevOps deployment...');

// Clean up previous deploy directory
if (fs.existsSync(deployDir)) {
    console.log('🧹 Cleaning up previous deploy directory...');
    fs.rmSync(deployDir, { recursive: true, force: true });
}

// Create deploy directory structure
console.log('📁 Creating deploy directory structure...');
fs.mkdirSync(deployDir, { recursive: true });
fs.mkdirSync(path.dirname(distDest), { recursive: true });

// Copy package.json
console.log('📄 Copying package.json...');
if (fs.existsSync(packageJsonSource)) {
    fs.copyFileSync(packageJsonSource, packageJsonDest);
    console.log('✅ package.json copied successfully');
} else {
    console.error('❌ package.json not found in source directory');
    process.exit(1);
}

// Copy dist directory
console.log('📦 Copying dist directory...');
if (fs.existsSync(distSource)) {
    copyDirectory(distSource, distDest);
    console.log('✅ dist directory copied successfully');
} else {
    console.error('❌ dist directory not found in source directory');
    process.exit(1);
}

// Create a simple README for the deploy package
const deployReadme = path.join(deployDir, 'README.md');
const readmeContent = `# Monterosa n8n Node - DevOps Package

This package contains the compiled Monterosa n8n custom node for deployment.

## Structure
- \`package.json\` - Node package configuration
- \`node_modules/n8n-nodes-monterosa/dist/\` - Compiled node files

## Installation
This package is ready for deployment to n8n instances.

Generated on: ${new Date().toISOString()}
`;

fs.writeFileSync(deployReadme, readmeContent);
console.log('📝 Created deploy README.md');

console.log('\n🎉 Packaging completed successfully!');
console.log(`📂 Deploy package created at: ${deployDir}`);
console.log('\n📋 Package structure:');
console.log('deploy/');
console.log('├── package.json');
console.log('├── README.md');
console.log('└── node_modules/');
console.log('    └── n8n-nodes-monterosa/');
console.log('        └── dist/');
console.log('            ├── credentials/');
console.log('            ├── nodes/');
console.log('            └── package.json');

// Helper function to copy directories recursively
function copyDirectory(source, destination) {
    if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, { recursive: true });
    }

    const items = fs.readdirSync(source);
    
    for (const item of items) {
        const sourcePath = path.join(source, item);
        const destPath = path.join(destination, item);
        
        const stat = fs.statSync(sourcePath);
        
        if (stat.isDirectory()) {
            copyDirectory(sourcePath, destPath);
        } else {
            fs.copyFileSync(sourcePath, destPath);
        }
    }
} 