import VisionProvider from './VisionProvider';

/**
 * A mock vision provider to simulate AI reconstruction without incurring API costs.
 * Used for testing the architecture pipeline and UI states.
 */
export default class MockVisionProvider extends VisionProvider {
  async reconstructDiagram(imageUrl, expectedNodeIds) {
    console.log(`[MockVisionProvider] Analyzing image: ${imageUrl}`);
    console.log(`[MockVisionProvider] Expected nodes:`, expectedNodeIds);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // We simulate finding coordinates for the expected nodes.
    // We'll just arrange them in a diagonal line or a specific mocked shape to prove it works.
    const coordinates = {};
    let confidence = 0.85; // High confidence to pass the 0.75 threshold by default.

    if (!expectedNodeIds || expectedNodeIds.length === 0) {
      confidence = 0.2; // Low confidence if no nodes provided
    } else {
      expectedNodeIds.forEach((id, index) => {
        coordinates[id] = {
          x: 100 + (index * 80),
          y: 100 + (index * 60) + (index % 2 === 0 ? 30 : 0) // slight zigzag
        };
      });
    }

    return {
      coordinates,
      confidence
    };
  }
}
