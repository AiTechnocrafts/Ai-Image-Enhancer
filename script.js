document.getElementById('image-upload').addEventListener('change', handleFile);
document.getElementById('enhance-btn').addEventListener('click', enhanceImage);

let selectedFile = null;

function handleFile(e) {
  selectedFile = e.target.files[0];
  const originalImg = document.getElementById('original-image');
  originalImg.src = URL.createObjectURL(selectedFile);
}

async function enhanceImage() {
  if (!selectedFile) return alert("Please select an image.");

  const form = new FormData();
  form.append('image', selectedFile);
  form.append('upscale_factor', document.getElementById('upscale-factor').value);
  form.append('format', document.getElementById('output-format').value);

  const res = await fetch('https://ai-image-enhancer.replit.dev/get-api-key');
  const data = await res.json();

  const apiKey = data.apiKey;
  if (!apiKey) return alert("API Key missing");

  const result = await fetch('https://api.picsart.io/tools/1.0/upscale', {
    method: 'POST',
    headers: {
      'X-Picsart-API-Key': apiKey
    },
    body: form
  });

  const json = await result.json();
  if (json.data && json.data.url) {
    const enhancedUrl = json.data.url;
    const enhancedImg = document.getElementById('enhanced-image');
    const downloadBtn = document.getElementById('download-btn');

    enhancedImg.src = enhancedUrl;
    downloadBtn.href = enhancedUrl;
    downloadBtn.setAttribute("download", "enhanced_image.jpg");
    downloadBtn.style.display = "inline-block";
  } else {
    alert("Enhancement failed.");
  }
}
