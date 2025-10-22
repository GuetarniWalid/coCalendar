#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Script to copy all Rive assets to Android raw resources after prebuild
// This is needed because prebuild --clean removes manually added native files

const sourceDir = path.join(__dirname, '../assets/animations');
const targetDir = path.join(__dirname, '../android/app/src/main/res/raw');

console.log('📁 Copying Rive assets to Android resources...');

try {
  // Check if source directory exists
  if (!fs.existsSync(sourceDir)) {
    console.error('❌ Source directory not found:', sourceDir);
    console.log('💡 Create the directory and add your .riv files there');
    process.exit(1);
  }

  // Create target directory if it doesn't exist
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log('✅ Created raw resources directory');
  }

  // Find all .riv files in the source directory
  const riveFiles = fs
    .readdirSync(sourceDir)
    .filter(file => file.toLowerCase().endsWith('.riv'));

  if (riveFiles.length === 0) {
    console.log('⚠️  No .riv files found in:', sourceDir);
    console.log('💡 Add your Rive animation files to this directory');
    process.exit(0);
  }

  console.log(`📋 Found ${riveFiles.length} Rive file(s):`);

  let copiedCount = 0;

  // Copy each .riv file
  for (const fileName of riveFiles) {
    const sourceFile = path.join(sourceDir, fileName);
    const targetFile = path.join(targetDir, fileName);

    try {
      fs.copyFileSync(sourceFile, targetFile);
      console.log(`✅ Copied ${fileName}`);
      console.log(`   → ${targetFile}`);
      copiedCount++;
    } catch (error) {
      console.error(`❌ Failed to copy ${fileName}:`, error.message);
    }
  }

  if (copiedCount === riveFiles.length) {
    console.log(`🎉 Successfully copied all ${copiedCount} Rive asset(s)!`);
  } else {
    console.log(
      `⚠️  Copied ${copiedCount}/${riveFiles.length} files. Some files failed.`
    );
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error copying Rive assets:', error.message);
  process.exit(1);
}
