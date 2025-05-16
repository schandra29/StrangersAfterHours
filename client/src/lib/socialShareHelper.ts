/**
 * Social Share Helper
 * Dynamically sets meta tags for proper social media sharing
 */

/**
 * Updates Open Graph meta tags with the current absolute URL
 * This ensures social media platforms can properly display previews
 */
export function updateSocialShareMetaTags() {
  // Get the base URL (protocol + hostname)
  const baseUrl = window.location.origin;
  
  // Set the og:url to the current page URL
  const ogUrlTag = document.querySelector('meta[property="og:url"]');
  if (ogUrlTag) {
    ogUrlTag.setAttribute('content', window.location.href);
  }
  
  // Update image URLs to absolute URLs
  const ogImageTag = document.querySelector('meta[property="og:image"]');
  if (ogImageTag) {
    const imageUrl = ogImageTag.getAttribute('content');
    if (imageUrl && imageUrl.startsWith('/')) {
      const absoluteImageUrl = `${baseUrl}${imageUrl}`;
      ogImageTag.setAttribute('content', absoluteImageUrl);
    }
  }
  
  // Update secure image URL
  const ogSecureImageTag = document.querySelector('meta[property="og:image:secure_url"]');
  if (ogSecureImageTag) {
    const imageUrl = document.querySelector('meta[property="og:image"]')?.getAttribute('content');
    if (imageUrl) {
      ogSecureImageTag.setAttribute('content', imageUrl);
    }
  }
  
  // Update Twitter image
  const twitterImageTag = document.querySelector('meta[name="twitter:image"]');
  if (twitterImageTag) {
    const imageUrl = document.querySelector('meta[property="og:image"]')?.getAttribute('content');
    if (imageUrl) {
      twitterImageTag.setAttribute('content', imageUrl);
    }
  }
}