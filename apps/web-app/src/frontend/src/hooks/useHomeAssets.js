import { useState, useEffect } from 'react';
import { api } from '../services/api';

export function useHomeAssets() {
  const [assets, setAssets] = useState({
    heroImage: null,
    stripImages: [],
    ctaBgImage: null,
    painSideImage: null,
    authorityBgImage: null,
    loading: true
  });

  useEffect(() => {
    let mounted = true;

    async function loadAssets() {
      try {
        const gallery = await api.getGallery();
        
        if (!mounted) return;

        // Helper to find image by usage location
        // Prioritizes recently uploaded or manually ordered
        const findBySlot = (slot) => {
          const matched = gallery.filter(img => {
            const usage = img.usage_locations || [img.section];
            return usage.includes(slot);
          });
          // Sort by uploaded_at DESC to get newest
          // If using display_order, could sort by that too.
          // For single images, usually newest wins or order=0
          return matched.length > 0 ? matched[0] : null; // matched is already sorted by API (ASC order, DESC date)
          // Actually API sorts by display_order ASC, uploaded_at DESC.
          // So [0] is the best candidate.
        };

        const findMultipleBySlot = (slot) => {
            return gallery.filter(img => {
                const usage = img.usage_locations || [img.section];
                return usage.includes(slot);
            });
        };

        const hero = findBySlot('home_hero');
        const cta = findBySlot('home_cta_bg');
        const pain = findBySlot('home_pain_side');
        const auth = findBySlot('home_authority_bg');
        const strip = findMultipleBySlot('home_strip').slice(0, 3);

        setAssets({
          heroImage: hero ? hero.filepath : null, // No fallback, allow null
          heroFocalPoint: hero?.focal_point || null,
          stripImages: strip,
          ctaBgImage: cta ? cta.filepath : null,
          painSideImage: pain ? pain.filepath : null,
          authorityBgImage: auth ? auth.filepath : null,
          loading: false
        });

      } catch (error) {
        console.error("Failed to load home assets:", error);
        if (mounted) {
            setAssets(prev => ({ ...prev, loading: false }));
        }
      }
    }

    loadAssets();

    return () => { mounted = false; };
  }, []);

  return assets;
}
