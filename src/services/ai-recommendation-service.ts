import { coinGeckoService } from "./coingecko-service";
import { openAiService } from "./openai-service";
import type { AiRecommendation, CoinDetails } from "../models/coin";

export interface AiRecommendationResult {
  details: CoinDetails;
  recommendation: AiRecommendation;
}

class AiRecommendationService {
  public async getRecommendation(coinId: string): Promise<AiRecommendationResult> {
    const details = await coinGeckoService.fetchCoinDetails(coinId);
    const recommendation = await openAiService.fetchAiRecommendation(details);
    return { details, recommendation };
  }
}

export const aiRecommendationService = new AiRecommendationService();
