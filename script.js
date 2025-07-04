document.addEventListener('DOMContentLoaded', function () {
  const fileInput = document.getElementById('image-upload');
  const dropArea = document.getElementById('drop-area');
  const originalImage = document.getElementById('original-image');
  const enhancedImage = document.getElementById('enhanced-image');
  const originalPlaceholder = document.getElementById('original-placeholder');
  const enhancedPlaceholder = document.getElementById('enhanced-placeholder');
  const enhanceBtn = document.getElementById('enhance-btn');
  const upscaleFactor = document.getElementById('upscale-factor');
  const outputFormat = document.getElementById('output-format');
  const loading = document.getElementById('loading');
  const status = document.getElementById('status');
  const downloadBtn = document.getElementById('download-btn');
  const downloadLink = document.getElementById('download-link');

  let selectedFile = null;

  // ✅ Backend Render URL yahan paste karo
  const BACKEND_BASE_URL = "https://image-enhancer-backend.onrender.com";

  // Drag-drop styling
  dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.style.backgroundColor = '#e9ecef';
    dropArea.style.borderColor = '#adb5bd';
  });

  dropArea.addEventListener('dragleave', () => {
    dropArea.style.backgroundColor = '#f8f9fa';
    dropArea.style.borderColor = '#dee2e6';
  });

  dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArea.style.backgroundColor = '#f8f9fa';
    dropArea.style.borderColor = '#dee2e6';

    if (e.dataTransfer.files.length) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) {
      handleFileSelect(e.target.files[0]);
    }
  });

  function handleFileSelect(file) {
    if (!file.type.match('image.*')) {
      showStatus('Please select an image file.', 'error');
      return;
    }

    selectedFile = file;

    const reader = new FileReader();
    reader.onload = function (e) {
      originalImage.src = e.target.result;
      originalImage.style.display = 'block';
      originalPlaceholder.style.display = 'none';

      enhancedImage.src = '';
      enhancedImage.style.display = 'none';
      enhancedPlaceholder.style.display = 'block';
      downloadLink.style.display = 'none';

      enhanceBtn.disabled = false;
    };
    reader.readAsDataURL(file);
  }

  enhanceBtn.addEventListener('click', enhanceImage);

  async function enhanceImage() {
    if (!selectedFile) return;

    loading.style.display = 'block';
    status.className = 'status';
    enhanceBtn.disabled = true;

    try {
      const keyResponse = await fetch(`${BACKEND_BASE_URL}/get-api-key`);
      const keyData = await keyResponse.json();
      const apiKey = keyData.apiKey;

      const form = new FormData();
      form.append('image', selectedFile);
      form.append('upscale_factor', upscaleFactor.value);
      form.append('format', outputFormat.value);

      const options = {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'X-Picsart-API-Key': apiKey
        },
        body: form
      };

      const response = await fetch('https://api.picsart.io/tools/1.0/upscale', options);
      const data = await response.json();

      if (data.data && data.data.url) {
        enhancedImage.src = data.data.url;
        enhancedImage.style.display = 'block';
        enhancedPlaceholder.style.display = 'none';
        downloadBtn.style.display = 'inline-block';
        downloadLink.style.display = 'inline-block';
        downloadLink.href = data.data.url;

        showStatus('Image enhanced successfully!', 'success');
      } else {
        throw new Error(data.message || 'Failed to enhance image');
      }
    } catch (error) {
      console.error('Error:', error);
      showStatus(`Error: ${error.message}`, 'error');
    } finally {
      loading.style.display = 'none';
      enhanceBtn.disabled = false;
    }
  }

  // ✅ Force download the enhanced image
  downloadBtn.onclick = () => {
    const imageUrl = enhancedImage.src;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.setAttribute('download', 'enhanced-image.jpg');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  function showStatus(message, type) {
    status.textContent = message;
    status.className = 'status ' + type;
  }
});
