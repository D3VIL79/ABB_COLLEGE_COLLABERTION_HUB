const REPO_BASE_PATH = '/ABB_COLLEGE_COLLABERTION_HUB';

export function asset(path: string): string {
  if (!path) return path;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;

  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // If running locally in dev mode on localhost, return plain root path
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return cleanPath;
  }

  // Prevent duplicate prefixing
  if (cleanPath.startsWith(REPO_BASE_PATH)) {
    return cleanPath;
  }

  return `${REPO_BASE_PATH}${cleanPath}`;
}
