import { FEATURES } from '../config/features';
import MockVisionProvider from './vision/MockVisionProvider';
import GeminiVisionProvider from './vision/GeminiVisionProvider';
import { mapNodesByTopology } from '../utils/TopologyMapper';
import { LayoutPersistenceService } from './LayoutPersistenceService';

/**
 * Orchestrates the AI Diagram Reconstruction pipeline.
 */
export class DiagramExtractionService {
  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey) {
      this.provider = new GeminiVisionProvider();
    } else {
      this.provider = new MockVisionProvider();
    }
    this.confidenceThreshold = 0.75;
  }

  /**
   * Extract all potential diagram images from raw HTML.
   * Filters out obvious icons or tiny images if possible.
   * @param {string} html 
   * @returns {string[]} Array of image URLs
   */
  extractImagesFromHTML(html) {
    const images = [];
    
    // Find traditional img src tags
    const imgRegex = /<img[^>]+src=["']([^"'>]+)["']/g;
    let match;
    while ((match = imgRegex.exec(html)) !== null) {
      images.push(match[1]);
    }

    // Find raw URLs ending in image extensions (often buried in JSON/escaped HTML)
    const urlRegex = /https?:\/\/[a-zA-Z0-9\-._~:\/?#[\]@!$&'()*+,;=%]+\.(?:png|jpg|jpeg|gif)/gi;
    let urlMatch;
    while ((urlMatch = urlRegex.exec(html)) !== null) {
      images.push(urlMatch[0]);
    }

    // Deduplicate and filter out obvious noise
    const uniqueImages = [...new Set(images)];
    return uniqueImages.filter(src => {
      const lower = src.toLowerCase();
      if (lower.includes('logo') || lower.includes('icon') || lower.includes('avatar') || lower.includes('favicon')) {
        return false;
      }
      return true;
    });
  }

  /**
   * Main entrypoint for reconstruction.
   * @param {string} problemUrl - The source URL for caching purposes.
   * @param {string[]} imageUrls - Potential diagram images.
   * @param {string[]} expectedNodeIds - Nodes parsed from the text input.
   * @param {Array} expectedEdges - Edges parsed from the text input.
   * @returns {Promise<{ coordinates: Record<string, {x, y}> | null, debugInfo: any }>}
   */
  async reconstruct(problemUrl, imageUrls, expectedNodeIds, expectedEdges) {
    if (!FEATURES.ENABLE_AI_DIAGRAM_RECONSTRUCTION || imageUrls.length === 0) {
      return { coordinates: null, debugInfo: { reason: 'Feature disabled or no images found' } };
    }

    // Heuristic: Just take the first image for now, assuming it's the main problem diagram.
    const selectedImage = imageUrls[0];
    let cacheKey;
    try {
      cacheKey = btoa(encodeURIComponent(problemUrl + selectedImage));
    } catch (e) {
      cacheKey = "fallback_key_" + Date.now();
    }

    // 1. Check Cache
    const cached = localStorage.getItem(`vision_cache_${cacheKey}`);
    if (cached) {
      try {
        const parsedCache = JSON.parse(cached);
        return { 
          coordinates: parsedCache.coordinates, 
          debugInfo: { 
            selectedImage, 
            confidence: parsedCache.confidence, 
            status: 'success (cached)' 
          } 
        };
      } catch (e) {
        console.error('Failed to parse vision cache', e);
      }
    }

    // 2. Call Vision Provider
    try {
      const { coordinates, confidence, visualEdges } = await this.provider.reconstructDiagram(selectedImage, expectedNodeIds, expectedEdges);

      // 3. Confidence Check
      if (confidence < this.confidenceThreshold) {
        return { 
          coordinates: null, 
          debugInfo: { 
            selectedImage, 
            confidence, 
            status: 'fallback', 
            reason: `Confidence ${confidence} below threshold ${this.confidenceThreshold}` 
          } 
        };
      }

      // 4. Node Mapping via Topology
      const { mappedCoordinates, mappedCount, totalExpected } = mapNodesByTopology(
        coordinates, 
        visualEdges || [], 
        expectedNodeIds, 
        expectedEdges
      );

      // 5. Cache and Return
      localStorage.setItem(`vision_cache_${cacheKey}`, JSON.stringify({ coordinates: mappedCoordinates, confidence }));
      
      // 6. Dataset Collection
      LayoutPersistenceService.saveToDataset(problemUrl, cacheKey, mappedCoordinates, confidence);

      return { 
        coordinates: mappedCoordinates, 
        debugInfo: { 
          selectedImage, 
          confidence, 
          status: 'success',
          mappedCount,
          totalExpected
        } 
      };

    } catch (error) {
      return { 
        coordinates: null, 
        debugInfo: { 
          selectedImage, 
          status: 'error', 
          reason: error.message 
        } 
      };
    }
  }
}

// Export singleton instance
export const diagramExtractionService = new DiagramExtractionService();
