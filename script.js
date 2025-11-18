// ...new file...
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const previewImg = document.getElementById('previewImg');
const logoPreview = document.getElementById('logoPreview');
const generateBtn = document.getElementById('generateBtn');
const statusEl = document.getElementById('status');
const canvas = document.getElementById('canvas');
const codeSection = document.getElementById('codeSection');
const htmlCode = document.getElementById('htmlCode');

let currentDataUrl = null;
let currentFilename = 'favicon';

// Hook file input change
fileInput.addEventListener('change', handleFile);

function handleFile(e) {
	codeSection.style.display = 'none';
	statusEl.textContent = '';
	const file = e.target.files && e.target.files[0];
	if (!file) {
		fileInfo.textContent = 'No file selected';
		generateBtn.disabled = true;
		logoPreview.style.display = 'none';
		return;
	}
	if (!file.type.startsWith('image/')) {
		fileInfo.textContent = 'Please select an image file';
		generateBtn.disabled = true;
		return;
	}
	currentFilename = file.name.replace(/\.[^/.]+$/, ''); // strip extension
	fileInfo.textContent = file.name + ' selected';
	const reader = new FileReader();
	reader.onload = () => {
		currentDataUrl = reader.result;
		previewImg.src = currentDataUrl;
		previewImg.onload = () => {
			logoPreview.style.display = 'block';
			generateBtn.disabled = false;
		};
	};
	// Read as Data URL so it can be drawn to canvas
	if (file.type === 'image/svg+xml') {
		// Reading SVG as text and create data URL to preserve vector scale
		const textReader = new FileReader();
		textReader.onload = () => {
			const svgText = textReader.result;
			currentDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgText);
			previewImg.src = currentDataUrl;
			previewImg.onload = () => {
				logoPreview.style.display = 'block';
				generateBtn.disabled = false;
			};
		};
		textReader.readAsText(file);
	} else {
		reader.readAsDataURL(file);
	}
}

function generateFavicons() {
	if (!currentDataUrl) {
		statusEl.textContent = 'No image to generate from.';
		return;
	}
	statusEl.textContent = 'Generating...';
	generateBtn.disabled = true;
	const sizes = [16, 32, 48, 57, 60, 72, 76, 96, 128, 144, 152, 192, 256, 512];
	const image = new Image();
	// Allow data URL images to load without CORS
	image.crossOrigin = 'anonymous';
	image.onload = async () => {
		const downloads = [];
		for (const size of sizes) {
			canvas.width = size;
			canvas.height = size;
			const ctx = canvas.getContext('2d');
			// clear
			ctx.clearRect(0, 0, size, size);
			// compute fit preserving aspect ratio, centered
			const ratio = Math.min(size / image.width, size / image.height);
			const w = image.width * ratio;
			const h = image.height * ratio;
			const x = (size - w) / 2;
			const y = (size - h) / 2;
			// Optionally fill transparent background with white if needed:
			// ctx.fillStyle = '#ffffff'; ctx.fillRect(0,0,size,size);
			ctx.drawImage(image, x, y, w, h);
			const dataUrl = canvas.toDataURL('image/png');
			await downloadDataUrl(dataUrl, `${currentFilename}-${size}x${size}.png`);
			downloads.push({ size, filename: `${currentFilename}-${size}x${size}.png` });
		}
		// generate html snippet
		generateHtmlSnippet(currentFilename);
		statusEl.textContent = 'Done — files downloaded.';
		generateBtn.disabled = false;
	};
	image.onerror = () => {
		statusEl.textContent = 'Failed to load the image for processing.';
		generateBtn.disabled = false;
	};
	image.src = currentDataUrl;
}

function downloadDataUrl(dataUrl, filename) {
	return new Promise((resolve) => {
		const a = document.createElement('a');
		a.href = dataUrl;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		// small delay to allow browser to start download
		setTimeout(resolve, 150);
	});
}

function generateHtmlSnippet(baseName) {
	// Basic recommended tags — user can adjust paths
	const snippet = [
		`<link rel="icon" type="image/png" sizes="16x16" href="/${baseName}-16x16.png">`,
		`<link rel="icon" type="image/png" sizes="32x32" href="/${baseName}-32x32.png">`,
		`<link rel="icon" type="image/png" sizes="48x48" href="/${baseName}-48x48.png">`,
		`<link rel="apple-touch-icon" sizes="180x180" href="/${baseName}-180x180.png">`,
		`<link rel="manifest" href="/site.webmanifest">`
	].join('\n');
	htmlCode.textContent = snippet;
	codeSection.style.display = 'block';
}

function copyCode() {
	if (!htmlCode.textContent) return;
	navigator.clipboard?.writeText(htmlCode.textContent).then(() => {
		statusEl.textContent = 'HTML snippet copied to clipboard.';
	}, () => {
		statusEl.textContent = 'Failed to copy to clipboard.';
	});
}

// Expose functions to global scope because index.html calls them directly
window.generateFavicons = generateFavicons;
window.copyCode = copyCode;
