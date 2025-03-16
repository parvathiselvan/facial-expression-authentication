#!/usr/bin/env node
/**
 * Script to download face-api.js model files into the correct directory structure
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { promisify } = require('util');
const mkdirAsync = promisify(fs.mkdir);
const existsAsync = promisify(fs.exists);
const writeFileAsync = promisify(fs.writeFile);

// Updated repository URL for model weights
// Using a more reliable source (GitHub raw content from a fork with stable weights)
const FACE_API_CDN = 'https://raw.githubusercontent.com/WebDevSimplified/Face-Recognition-JavaScript/master/models';

// Target directory for models relative to this script
const MODELS_DIR = path.resolve(__dirname, '../public/models');

// Models to download and their files
const MODELS = {
  'tiny_face_detector': [
    'tiny_face_detector_model-shard1.bin',
    'tiny_face_detector_model-weights_manifest.json',
  ],
  'face_landmark_68': [
    'face_landmark_68_model-shard1.bin',
    'face_landmark_68_model-weights_manifest.json',
  ],
  'face_recognition': [
    'face_recognition_model-shard1.bin',
    'face_recognition_model-shard2.bin',
    'face_recognition_model-weights_manifest.json',
  ],
  'face_expression': [
    'face_expression_model-shard1.bin',
    'face_expression_model-weights_manifest.json',
  ],
};

/**
 * Creates a directory if it doesn't exist
 * 
 * @param {string} dirPath - Path to the directory to ensure exists
 */
async function ensureDir(dirPath) {
  try {
    if (!(await existsAsync(dirPath))) {
      await mkdirAsync(dirPath, { recursive: true });
      console.log(`Created directory: ${dirPath}`);
    }
  } catch (err) {
    console.error(`Error creating directory ${dirPath}:`, err);
    throw err;
  }
}

/**
 * Downloads a file from a URL to a local path
 * 
 * @param {string} url - URL to download from
 * @param {string} destination - Local path to save the file
 * @returns {Promise<void>}
 */
function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading: ${url}`);
    
    const file = fs.createWriteStream(destination);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}, status code: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded: ${destination}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(destination, () => {}); // Delete the file if there was an error
      reject(err);
    });
    
    file.on('error', (err) => {
      fs.unlink(destination, () => {}); // Delete the file if there was an error
      reject(err);
    });
  });
}

/**
 * Main function to download all model files
 */
async function downloadModels() {
  try {
    // Ensure the main models directory exists
    await ensureDir(MODELS_DIR);
    
    // Download each model
    for (const [modelName, files] of Object.entries(MODELS)) {
      const modelDir = path.join(MODELS_DIR, modelName);
      
      // Create model directory
      await ensureDir(modelDir);
      
      // Download each file for the model
      for (const file of files) {
        const fileUrl = `${FACE_API_CDN}/${modelName}/${file}`;
        const filePath = path.join(modelDir, file);
        
        // Skip if file already exists
        if (await existsAsync(filePath)) {
          console.log(`File already exists: ${filePath}`);
          continue;
        }
        
        await downloadFile(fileUrl, filePath);
      }
    }
    
    console.log('All models downloaded successfully!');
  } catch (err) {
    console.error('Error downloading models:', err);
    process.exit(1);
  }
}

// Run the script
downloadModels();
