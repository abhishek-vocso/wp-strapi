const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(cors()); // Enable CORS
app.use(express.json());

const PORT = 3000;

async function downloadImage(url, id, sizes, mimeType, destinationDirectory) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const buffer = await response.arrayBuffer();

  // Determine the size name from sizes object
  let sizeName = 'full'; // Default to 'full' if sizes object is undefined
  if (sizes && sizes.thumbnail) {
    sizeName = 'thumbnail';
  } else if (sizes && sizes.medium) {
    sizeName = 'medium';
  } else if (sizes && sizes.medium_large) {
    sizeName = 'medium_large';
  } else if (sizes && sizes['post-thumbnail']) {
    sizeName = 'post-thumbnail';
  } else if (sizes && sizes['twentyfourteen-full-width']) {
    sizeName = 'twentyfourteen-full-width';
  }

  const filename = `${id}.${sizeName}.${mimeType.split('/')[1]}`; // Generate filename

  const destinationPath = path.join(destinationDirectory, filename);

  // Ensure the destination directory exists, creating it if necessary
  await fs.mkdir(destinationDirectory, { recursive: true });

  await fs.writeFile(destinationPath, Buffer.from(buffer));
  console.log(`Image downloaded to: ${destinationPath}`);

  return filename; // Return the filename
}



app.post('/proxy', async (req, res) => {
  try {
    const { imageDetails } = req.body;

    if (!imageDetails || !Array.isArray(imageDetails)) {
      return res.status(400).json({ error: "Invalid image details" });
    }

    const destinationDirectory = path.join(__dirname, 'public', 'uploads');

    const downloadPromises = imageDetails.map(({ url, id, sizes, mimeType }) =>
      downloadImage(url, id, sizes, mimeType, destinationDirectory)
    );

    const filenames = await Promise.all(downloadPromises);

    res.status(200).json({ filenames });
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server listening on port ${PORT}`);
});
