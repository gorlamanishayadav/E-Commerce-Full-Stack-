/**
 * Normalizes an image URL so it correctly points to the backend server
 * whether it's relative (/media/...) or already fully qualified.
 */
export const getImageUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  
  if (
    url.startsWith('http://') || 
    url.startsWith('https://') || 
    url.startsWith('data:') || 
    url.startsWith('blob:')
  ) {
    return url;
  }
  
  const backendBase = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';
  const cleanBase = backendBase.endsWith('/') ? backendBase.slice(0, -1) : backendBase;
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${cleanBase}${cleanPath}`;
};

export default getImageUrl;
