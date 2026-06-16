/**
 * Manages caching and restoration of graph layouts to ensure
 * instantaneous reloads for previously seen graphs and user customizations.
 */
import { GraphFingerprintService } from './GraphFingerprintService';

export class LayoutPersistenceService {
  /**
   * Check for a previously saved USER layout by problem URL/ID.
   */
  static loadUserLayout(problemId) {
    if (!problemId) return null;
    const key = `user_layout_${btoa(problemId)}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse user layout cache:", e);
      }
    }
    return null;
  }

  /**
   * Save a USER-customized layout.
   */
  static saveUserLayout(problemId, nodes) {
    if (!problemId || !nodes || nodes.length === 0) return;
    
    // Extract only coordinates to save space
    const coordinates = {};
    nodes.forEach(n => {
      if (n.position) {
        coordinates[n.id] = { ...n.position };
      }
    });

    const key = `user_layout_${btoa(problemId)}`;
    localStorage.setItem(key, JSON.stringify({
      coordinates,
      timestamp: Date.now()
    }));
  }

  static clearUserLayout(problemId) {
    if (!problemId) return;
    const key = `user_layout_${btoa(problemId)}`;
    localStorage.removeItem(key);
  }

  /**
   * Check for a structurally isomorphic graph layout via Fingerprint.
   */
  static loadFingerprintLayout(fingerprintHash) {
    if (!fingerprintHash) return null;
    const key = `fingerprint_layout_${btoa(fingerprintHash)}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse fingerprint cache:", e);
      }
    }
    return null;
  }

  /**
   * Save an AI or Auto-Layout to the structural Fingerprint cache.
   */
  static saveFingerprintLayout(fingerprintHash, coordinates, isVision = false) {
    if (!fingerprintHash || !coordinates) return;
    const key = `fingerprint_layout_${btoa(fingerprintHash)}`;
    localStorage.setItem(key, JSON.stringify({
      coordinates,
      isVision,
      timestamp: Date.now()
    }));
  }

  static saveToDataset(problemUrl, cacheKey, coordinates, confidence) {
    if (!problemUrl || !coordinates) return;

    const key = 'source_diagram_layout_dataset';
    let dataset = [];
    try {
      dataset = JSON.parse(localStorage.getItem(key) || '[]');
    } catch {
      // Leave dataset empty if the previous cache entry is malformed.
    }

    const nextEntry = {
      problemUrl,
      cacheKey,
      coordinates,
      confidence,
      capturedAt: new Date().toISOString(),
    };

    const existingIndex = dataset.findIndex((entry) => entry.problemUrl === problemUrl);
    if (existingIndex >= 0) {
      dataset[existingIndex] = nextEntry;
    } else {
      dataset.push(nextEntry);
    }

    localStorage.setItem(key, JSON.stringify(dataset));
  }

}
