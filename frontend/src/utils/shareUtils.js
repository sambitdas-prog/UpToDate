/**
 * Generates a formatted social media caption based on parsed release poster data.
 *
 * Format Template:
 * 🚀 [Headline]
 *
 * [Summary]
 *
 * ✨ Highlights:
 * 👉 [Feature 1 Title]: [Feature 1 Description]
 * 👉 [Feature 2 Title]: [Feature 2 Description]
 *
 * 🔗 Check it out: [GitHub Repository URL]
 */
export function generateShareCaption(posterData, repoUrl) {
  if (!posterData) return '';

  const headline = posterData.headline || 'New Release Update!';
  const summary = posterData.summary || '';
  const features = posterData.features || [];

  let caption = `🚀 ${headline}\n\n${summary}`;

  if (features.length > 0) {
    caption += `\n\n✨ Highlights:\n`;
    features.forEach((feature) => {
      const isObject = typeof feature === 'object' && feature !== null;
      const title = isObject ? (feature.title || '') : String(feature);
      const description = isObject && feature.description ? `: ${feature.description}` : '';
      caption += `👉 ${title}${description}\n`;
    });
  }

  const linkUrl = repoUrl || (posterData.app_repo ? `https://github.com/${posterData.app_repo}` : 'https://github.com');
  caption += `\n\n🔗 Check it out: ${linkUrl}`;

  return caption.trim();
}

/**
 * Converts a base64 Data URL into a File object.
 */
export function dataUrlToFile(dataUrl, fileName = 'release-poster.png') {
  const arr = dataUrl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], fileName, { type: mime });
}

/**
 * Detects genuine mobile/tablet touch OS devices (iOS, Android, iPadOS).
 */
function isMobileDevice() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) ||
    (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform));
}

/**
 * Handles sharing to a target social platform using navigator.share on mobile or immediate web intent URL + clipboard copy on desktop.
 */
export async function shareToPlatform(platform, { dataUrl, posterData, repoUrl, onToast, skipOpen }) {
  const caption = generateShareCaption(posterData, repoUrl);
  const imageFile = dataUrl ? dataUrlToFile(dataUrl) : null;
  const targetUrl = repoUrl || (posterData?.app_repo ? `https://github.com/${posterData.app_repo}` : 'https://github.com');

  // Attempt Web Share API only on genuine mobile / tablet OS devices
  if (isMobileDevice() && navigator.share && imageFile && navigator.canShare && navigator.canShare({ files: [imageFile] })) {
    try {
      await navigator.share({
        files: [imageFile],
        title: posterData?.headline || 'Release Update',
        text: caption,
      });
      return;
    } catch (err) {
      if (err.name === 'AbortError') {
        return;
      }
      console.warn('navigator.share failed, falling back to clipboard + intent', err);
    }
  }

  // 1. First: Copy image to clipboard while the current tab has 100% document focus
  await copyToClipboard(caption, dataUrl, imageFile);
  if (onToast) {
    onToast('Poster graphic copied to clipboard! Press Ctrl + V to attach it in your post.');
  }

  // 2. Second: Open intent URL via native link click after clipboard copy completes
  const intentUrl = getPlatformIntentUrl(platform, caption, targetUrl);
  if (intentUrl && !skipOpen) {
    openInNewTab(intentUrl);
  }
}

/**
 * Safely opens a URL in a new tab using a transient HTML anchor element click.
 * This prevents modern browser security rules on production domains from treating it as a popup or redirecting the current tab.
 */
export function openInNewTab(url) {
  if (!url) return;
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Helper to write caption and/or image to clipboard.
 */
async function copyToClipboard(text, dataUrl, imageFile) {
  try {
    // 1. Prioritize copying the PNG poster graphic to clipboard
    // Since social platforms pre-fill caption text from the intent URL (?text=...),
    // Ctrl+V should attach the poster graphic!
    if (navigator.clipboard && navigator.clipboard.write && (dataUrl || imageFile)) {
      try {
        let imageBlob = null;
        if (dataUrl && typeof dataUrl === 'string' && dataUrl.startsWith('data:image')) {
          const res = await fetch(dataUrl);
          imageBlob = await res.blob();
        } else if (imageFile) {
          imageBlob = imageFile.slice(0, imageFile.size, 'image/png');
        }

        if (imageBlob) {
          const item = new ClipboardItem({ [imageBlob.type || 'image/png']: imageBlob });
          await navigator.clipboard.write([item]);
          return;
        }
      } catch (imgErr) {
        console.warn('Image clipboard copy failed:', imgErr);
      }
    }
    // 2. Fallback to text copy ONLY if no image was provided
    if (navigator.clipboard && navigator.clipboard.writeText && text && !dataUrl && !imageFile) {
      await navigator.clipboard.writeText(text);
    }
  } catch (err) {
    console.error('Clipboard copy failed:', err);
  }
}

/**
 * Returns the web intent URL for a given social platform.
 */
export function getPlatformIntentUrl(platform, caption, targetUrl) {
  const encodedCaption = encodeURIComponent(caption || '');
  const encodedUrl = encodeURIComponent(targetUrl || 'https://github.com');

  switch (platform) {
    case 'whatsapp':
      return `https://api.whatsapp.com/send?text=${encodedCaption}`;
    case 'twitter':
    case 'x':
      return `https://twitter.com/intent/tweet?text=${encodedCaption}`;
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    default:
      return null;
  }
}
