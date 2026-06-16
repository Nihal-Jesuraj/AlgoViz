/**
 * Base class for Vision Providers.
 * Any new AI provider (Gemini, GPT-4V, Claude) should extend this.
 */
export default class VisionProvider {
  /**
   * Reconstruct node coordinates from a diagram image.
   * @param {string} imageUrl - The URL or base64 of the diagram image.
   * @param {Array} expectedNodeIds - The node IDs extracted from text parsing, to guide the model.
   * @returns {Promise<{ coordinates: Record<string, {x: number, y: number}>, confidence: number }>}
   */
  async reconstructDiagram(imageUrl, expectedNodeIds) {
    throw new Error("reconstructDiagram must be implemented by subclasses");
  }
}
