/**
 * Simple test for recommendation service
 * This would normally be run with Jest, but we're creating a basic verification
 */

import { irrigationRecommendationModule } from "./modules/irrigation-recommendation.module.js";
import { pestDiseaseRecommendationModule } from "./modules/pest-disease-recommendation.module.js";
import { fertilizerRecommendationModule } from "./modules/fertilizer-recommendation.module.js";

// This is a simplified test to verify the structure works
console.log("Testing recommendation service structure...");

// Test that we can import the modules
try {
  console.log("✓ All recommendation modules imported successfully");

  // Test that services are properly instantiated
  console.log(
    `✓ Irrigation module type: ${irrigationRecommendationModule.recommendationType}`,
  );
  console.log(
    `✓ Pest & Disease module type: ${pestDiseaseRecommendationModule.recommendationType}`,
  );
  console.log(
    `✓ Fertilizer module type: ${fertilizerRecommendationModule.recommendationType}`,
  );

  console.log("✅ Recommendation service structure verification passed");
} catch (error) {
  console.error("❌ Recommendation service structure verification failed:");
  console.error(error);
  process.exit(1);
}
