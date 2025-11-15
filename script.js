let uploadedImage = null;

document.getElementById('fileInput').addEventListener('change', handleFileSelect);

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const fileInfo = document.getElementById('fileInfo');
    fileInfo.textContent = `Selected: ${file.name}`;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            uploadedImage = img;
            const preview = document.getElementById('logoPreview');
            const previewImg = document.getElementById('previewImg');
            previewImg.src = event.target.result;
            preview.style.display = 'block';
            document.getElementById('generateBtn').disabled = false;
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function showStatus(message, type = 'info') {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = `status ${type}`;
    status.style.display = 'block';
}

function downloadImage(canvas, filename) {
    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
            setTimeout(resolve, 150);
        }, 'image/png');
    });
}

async function generateFavicons() {
    if (!uploadedImage) {
        showStatus('Please select an image first!', 'error');
        return;
    }
    
    showStatus('Generating favicons...', 'info');
    const preview = document.getElementById('preview');
    preview.innerHTML = '';
    preview.style.display = 'grid';
    
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    const sizes = [
        { size: 16, name: 'favicon-16x16.png', label: '16x16' },
        { size: 32, name: 'favicon-32x32.png', label: '32x32' },
        { size: 180, name: 'apple-touch-icon.png', label: 'Apple' },
        { size: 192, name: 'android-chrome-192x192.png', label: 'Android' },
        { size: 512, name: 'android-chrome-512x512.png', label: '512x512' }
    ];
    
    try {
        for (const { size, name, label } of sizes) {
            canvas.width = size;
            canvas.height = size;
            ctx.clearRect(0, 0, size, size);
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(uploadedImage, 0, 0, size, size);
            
            // Add to preview
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            const previewImg = document.createElement('img');
            previewImg.src = canvas.toDataURL();
            previewImg.alt = label;
            const previewLabel = document.createElement('span');
            previewLabel.textContent = label;
            previewItem.appendChild(previewImg);
            previewItem.appendChild(previewLabel);
            preview.appendChild(previewItem);
            
            // Download
            await downloadImage(canvas, name);
            showStatus(`Generated ${name}...`, 'info');
        }
        
        // Generate site.webmanifest
        const manifest = {
            name: "Your Site Name",
            short_name: "Site",
            icons: [
                {
                    src: "/android-chrome-192x192.png",
                    sizes: "192x192",
                    type: "image/png"
                },
                {
                    src: "/android-chrome-512x512.png",
                    sizes: "512x512",
                    type: "image/png"
                }
            ],
            theme_color: "#2563eb",
            background_color: "#ffffff",
            display: "standalone"
        };
        
        const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'site.webmanifest';
        a.click();
        URL.revokeObjectURL(url);
        
        showStatus('✅ All favicons generated successfully! Check your Downloads folder.', 'success');
        showHTMLCode();
    } catch (err) {
        showStatus(`❌ Error: ${err.message}`, 'error');
    }
}

function showHTMLCode() {
    const codeSection = document.getElementById('codeSection');
    const htmlCode = document.getElementById('htmlCode');
    
    const code = `<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">`;
    
    htmlCode.textContent = code;
    codeSection.style.display = 'block';
}

function copyCode() {
    const code = document.getElementById('htmlCode').textContent;
    navigator.clipboard.writeText(code).then(() => {
        const btn = document.querySelector('.btn-copy');
        const originalText = btn.textContent;
        btn.textContent = '✅ Copied!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    });
}
