// Startup file and the meat of the code. Connects to the app from unsplash and defines the routes that handles calls to the api.

require('dotenv').config();
const express = require('express');
const path = require('path');
const axios = require('axios');
const cors = require('cors'); // Import cors package
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS middleware
app.use(cors());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

// Route handler for fetching random images from Unsplash API
app.get('/images', async (req, res) => {
  try {
    const response = await axios.get('https://api.unsplash.com/photos/random', {
      headers: {
        Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
      },
      params: {
        count: 30 // Fetch 30 random images per request
      }
    });

    const images = response.data; // Entire photo objects
    res.json({ images });
  } catch (error) {
    console.error('Error fetching random images:', error.message);
    res.status(500).json({ error: 'Failed to fetch random images' });
  }
});

// Route handler for searching images on Unsplash API
app.get('/search/images', async (req, res) => {
  const searchQuery = req.query.query;
  const page = req.query.page || 1; // Default to page 1 if not specified
  const perPage = 30; // Number of items per page
  try {
    const response = await axios.get('https://api.unsplash.com/search/photos', {
      headers: {
        Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
      },
      params: {
        query: searchQuery,
        page: page,
        per_page: perPage
      }
    });

    const { total, total_pages, results } = response.data;
    const images = results; // Entire photo objects

    res.json({ total, total_pages, images });
  } catch (error) {
    console.error('Error searching images:', error.message);
    res.status(500).json({ error: 'Failed to search images' });
  }
});

// Route handler for notifying api about downloads (per their requirements) images
app.get('/photos/:photoId/notify', async (req, res) => {
  const photoId = req.params.photoId;
  const downloadLocation = req.query.downloadLocation;

  try {
    await axios.get(downloadLocation, {
      headers: {
        Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error(`Error downloading image for photo ${photoId}:`, error.message);
    res.status(500).json({ error: `Failed to download image for photo ${photoId}` });
  }
});

// Route for downloading photos 
app.get('/photos/:photoId/download', async (req, res) => {
  const photoId = req.params.photoId;
  // Gets the proper url for download
  const downloadLocation = req.query.downloadLocation;

  try {
    const response = await axios.get(downloadLocation, {
      responseType: 'stream',
      headers: {
        Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
      }
    });

    // Set headers for the image response and data handling
    res.setHeader('Content-Type', response.headers['content-type']);
    res.setHeader('Content-Disposition', `attachment; filename="photo_${photoId}.jpg"`);

    // Pipe the image data stream directly to the response
    response.data.pipe(res);
  } catch (error) {
    console.error(`Error downloading image for photo ${photoId}:`, error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    res.status(500).json({ error: `Failed to download image for photo ${photoId}` });
  }
});



// Default route handler
app.get('/', (req, res) => {
  // Send the HTML file when '/' route is accessed
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
