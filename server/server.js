const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

async function downloadImage(url, destinationDirectory) {
  const fetch = (await import('node-fetch')).default;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const buffer = await response.buffer();
  const uniqueFilename = generateUniqueFilename();
  const destinationPath = path.join(destinationDirectory, uniqueFilename);

  // Ensure the destination directory exists, creating it if necessary
  await fs.mkdir(destinationDirectory, { recursive: true });

  await fs.writeFile(destinationPath, buffer);
  console.log(`Image downloaded to: ${destinationPath}`);

  return uniqueFilename; // Return the unique filename
}

function generateUniqueFilename() {
  // Generate a unique filename using a random number or UUID, for example
  const randomString = Math.random().toString(36).substring(7); // Generate a random string
  return `${randomString}.jpg`; // Return a unique filename
}

const app = express();
app.use(cors()); // Enable CORS
app.use(express.json());

app.post('/proxy', async (req, res) => {
  try {
    const { imageUrls } = req.body;

    if (!imageUrls || !Array.isArray(imageUrls)) {
      return res.status(400).json({ error: "Invalid image URLs" });
    }

    const destinationDirectory = path.join(__dirname, '/public/uploads');
    const downloadPromises = imageUrls.map(url => downloadImage(url, destinationDirectory));
    const filenames = await Promise.all(downloadPromises);

    res.status(200).json({ filenames });
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

app.listen(3000, () => {
  console.log('Proxy server listening on port 3000');
});
