// download-onda-charts.js
const fs = require('fs');
const path = require('path');
const https = require('https');

// Assuming you have the json in a file or defined here
const ONDA_CHARTS = require('./onda-charts.json');

// CORRECTED BASE URL
const ONDA_BASE_URL = 'https://siamaroc.onda.ma/eaip/cartes';
const CHARTS_DIR = path.join(__dirname, 'charts');

if (!fs.existsSync(CHARTS_DIR)) {
  fs.mkdirSync(CHARTS_DIR, { recursive: true });
}

function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const file = fs.createWriteStream(filepath);

    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(filepath);
        });
      } else {
        file.close();
        fs.unlink(filepath, () => { }); // Delete empty/error file
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlink(filepath, () => { });
      reject(err);
    });
  });
}

async function downloadAllCharts() {
  console.log('🛫 ONDA Charts Downloader (Corrected)');
  console.log('====================================\n');

  let totalCharts = 0;
  let successCount = 0;
  let failureCount = 0;

  for (const [icao, charts] of Object.entries(ONDA_CHARTS)) {
    console.log(`\n📍 ${icao} (${charts.length} charts)`);

    for (const chart of charts) {
      totalCharts++;

      // 1. Sanitize filename: Remove hyphens (AD2GMAD-15 -> AD2GMAD15)
      const sanitizedIdentifier = chart.identifier.replace(/-/g, '');
      const chartFilename = `${sanitizedIdentifier}.pdf`;

      // 2. Identify folder: Usually everything before the first hyphen (AD2GMAD)
      const remoteFolder = chart.identifier.split('-')[0];

      // 3. Construct URL: https://siamaroc.onda.ma/eaip/cartes/AD2GMAD/AD2GMAD15.pdf
      const chartUrl = `${ONDA_BASE_URL}/${remoteFolder}/${chartFilename}`;

      // Local path for saving (organized by ICAO)
      const localPath = path.join(CHARTS_DIR, icao, chartFilename);

      if (fs.existsSync(localPath)) {
        console.log(`  - ${chartFilename} (skipped: exists)`);
        successCount++;
        continue;
      }

      try {
        await downloadFile(chartUrl, localPath);
        console.log(`  ✓ ${chartFilename}`);
        successCount++;

        // Safety delay
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.error(`  ✗ ${chartFilename} - URL: ${chartUrl} - Error: ${error.message}`);
        failureCount++;
      }
    }
  }

  console.log('\n\n✓ Download Complete!');
  console.log('==========================');
  console.log(`Total: ${totalCharts} | Success: ${successCount} | Failed: ${failureCount}`);
}

downloadAllCharts().catch(console.error);