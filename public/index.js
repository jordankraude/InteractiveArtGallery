const form = document.getElementById('search-form');
const imageGrid = document.querySelector('.image-grid');
const pageIndicator = document.querySelectorAll('.pageIndicator');
const prevPageButtons = document.querySelectorAll('.prevPage');
const nextPageButtons = document.querySelectorAll('.nextPage');

let currentPage1 = 1;
let currentPage2 = 1;
const perPage = 30;

async function fetchRandomImages() {
  try {
    const response = await fetch('/images');
    if (!response.ok) throw new Error('Failed to fetch random images');
    const data = await response.json();
    displayImages(data.images);
  } catch (error) {
    console.error('Error fetching random images:', error.message);
  }
}

async function fetchSearchImages(searchQuery, page) {
  try {
    const response = await fetch(`/search/images?query=${searchQuery}&page=${page}`);
    if (!response.ok) throw new Error('Failed to fetch search results');
    const data = await response.json();
    displayImages(data.images);
    pageIndicator.forEach(indicator => {
      indicator.textContent = `Page ${page} of ${data.total_pages}`;
    });
  } catch (error) {
    console.error('Error fetching search results:', error.message);
  }
}



async function notifyAPIDownload(photoId, downloadLocation) {
  try {
    const trackDownloadResponse = await fetch(`/photos/${encodeURIComponent(photoId)}/notify?downloadLocation=${encodeURIComponent(downloadLocation)}`);
    if (!trackDownloadResponse.ok) {
      throw new Error('Failed to track download');
    }
  } catch (error) {
    console.error('Error notifying API of download:', error.message);
  }
}

async function toDataURL(photoId, url) {
    try {
      const response = await fetch(`/photos/${encodeURIComponent(photoId)}/download?downloadLocation=${encodeURIComponent(url)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }
      const blob = await response.blob();
      return window.URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error fetching image data:', error.message);
      throw error; // Propagate the error upwards for proper error handling
    }
  }
  

  async function handleDownload(photoId, downloadLocation, downloadUrl) {
    try {
      // Notify the API about the download
      await notifyAPIDownload(photoId, downloadLocation);
  
      // Handle the actual download
      const imageUrl = await toDataURL(photoId, downloadUrl); // Pass photoId to toDataURL
      const a = document.createElement('a');
      a.href = imageUrl;
      a.download = `photo_${photoId}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  
      console.log('Image downloaded successfully');
    } catch (error) {
      console.error('Error downloading image:', error.message);
    }
  }
  

  function displayImages(images) {
    imageGrid.innerHTML = '';
    images.forEach((image) => {
      const figure = document.createElement('figure');
  
      const img = document.createElement('img');
      img.src = image.urls.regular;
      img.alt = image.description || 'Unsplash Image';
  
      const downloadButton = document.createElement('button');
      downloadButton.classList.add('download-button');
      downloadButton.textContent = 'Download';
      downloadButton.addEventListener('click', () => {
        handleDownload(image.id, image.links.download_location, image.links.download);
      });
  
      const caption = document.createElement('figcaption');
      caption.classList.add('caption');
      caption.innerHTML = `Photo by <a href="${image.user.links.html}" target="_blank">${image.user.name}</a> on <a href="https://unsplash.com" target="_blank">Unsplash</a>`;
  
      figure.appendChild(caption);
      figure.appendChild(img);
      figure.appendChild(downloadButton);
      imageGrid.appendChild(figure);
    });
  }
  

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const searchInput = document.getElementById('search-input').value.trim();
  if (searchInput) {
    currentPage1 = 1;
    currentPage2 = 1;
    await fetchSearchImages(searchInput, currentPage1);
  }
});

prevPageButtons[0].addEventListener('click', async () => {
  if (currentPage1 > 1) {
    currentPage1--;
    const searchInput = document.getElementById('search-input').value.trim();
    if (searchInput) {
      await fetchSearchImages(searchInput, currentPage1);
    } else {
      fetchRandomImages();
    }
  }
});

nextPageButtons[0].addEventListener('click', async () => {
  currentPage1++;
  const searchInput = document.getElementById('search-input').value.trim();
  if (searchInput) {
    await fetchSearchImages(searchInput, currentPage1);
  } else {
    fetchRandomImages();
  }
});

prevPageButtons[1].addEventListener('click', async () => {
  if (currentPage2 > 1) {
    currentPage2--;
    const searchInput = document.getElementById('search-input').value.trim();
    if (searchInput) {
      await fetchSearchImages(searchInput, currentPage2);
    } else {
      fetchRandomImages();
    }
  }
});

nextPageButtons[1].addEventListener('click', async () => {
  currentPage2++;
  const searchInput = document.getElementById('search-input').value.trim();
  if (searchInput) {
    await fetchSearchImages(searchInput, currentPage2);
  } else {
    fetchRandomImages();
  }
});

fetchRandomImages();
