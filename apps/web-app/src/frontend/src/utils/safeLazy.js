import React, { lazy } from 'react';

/**
 * safeLazy — Defensive React.lazy wrapper with self-healing chunk preload recovery.
 * Handles Vite dynamic chunk rotation after new deployments without showing 404 error screens.
 * 
 * @param {Function} importFn - () => import('./MyComponent')
 * @param {string} componentName - Optional debug name
 * @returns {React.LazyExoticComponent}
 */
export function safeLazy(importFn, componentName = 'Component') {
  return lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem(`bh_chunk_retry_${componentName}`) || 'false'
    );

    try {
      return await importFn();
    } catch (error) {
      console.warn(`[safeLazy] Chunk load failed for ${componentName}:`, error);

      const isChunkError = 
        error?.message?.includes('Failed to fetch dynamically imported module') ||
        error?.message?.includes('Importing a module script failed') ||
        error?.message?.includes('error loading dynamically imported module') ||
        error?.message?.includes('ChunkLoadError');

      if (isChunkError && !pageHasAlreadyBeenForceRefreshed) {
        console.warn(`[safeLazy] New deployment detected. Auto-refreshing session for ${componentName}...`);
        window.sessionStorage.setItem(`bh_chunk_retry_${componentName}`, 'true');
        
        // Wait 100ms before hard reload to clear transient state
        await new Promise(resolve => setTimeout(resolve, 100));
        window.location.reload();
        
        // Return a pending promise while page reloads
        return new Promise(() => {});
      }

      // If already refreshed or not a chunk error, reset flag and rethrow
      window.sessionStorage.removeItem(`bh_chunk_retry_${componentName}`);
      throw error;
    }
  });
}

export default safeLazy;
