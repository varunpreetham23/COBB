import fs from 'fs';
import path from 'path';
import express from 'express';
import unzipper from 'unzipper';

const PORT = process.env.PORT || 3000;
const ZIP_NAME = 'COBB_ChatGPT_Style.zip';
const PUBLIC_DIR = path.join(process.cwd(), 'public');

async function extractIfNeeded() {
  if (fs.existsSync(path.join(PUBLIC_DIR, 'index.html'))) {
    console.log('Public folder already exists with index.html — skipping extraction.');
    return;
  }

  if (!fs.existsSync(ZIP_NAME)) {
    console.error(`Zip file ${ZIP_NAME} not found in repo root. Make sure the COBB_ChatGPT_Style.zip is present.`);
    return;
  }

  console.log(`Extracting ${ZIP_NAME} → ${PUBLIC_DIR} ...`);
  await new Promise((resolve, reject) => {
    fs.createReadStream(ZIP_NAME)
      .pipe(unzipper.Extract({ path: PUBLIC_DIR }))
      .on('close', resolve)
      .on('error', reject);
  });
  console.log('Extraction complete.');
}

async function startServer() {
  try {
    await extractIfNeeded();
  } catch (err) {
    console.error('Error extracting zip:', err);
  }

  const app = express();
  app.use(express.static(PUBLIC_DIR));

  // Fallback: if index.html exists, serve it for all non-file routes (single-page apps)
  app.get('*', (req, res) => {
    const indexPath = path.join(PUBLIC_DIR, 'index.html');
    if (fs.existsSync(indexPath)) return res.sendFile(indexPath);
    return res.status(404).send('Not found');
  });

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
