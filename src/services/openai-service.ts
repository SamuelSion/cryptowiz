import axios from "axios";
import type { AiRecommendation, CoinDetails } from "../models/coin";
import { appConfig } from "../utils/app-config";

// Market data payload sent to ChatGPT for analysis.
export interface CoinSummaryForAi {
  name: string;
  market_cap_rank: number | null;
  current_price_usd: number;
  market_cap_usd: number;
  volume_24h_usd: number;
  volume_to_market_cap_ratio: number | null;
  circulating_supply: number;
  max_supply: number | null;
  supply_already_circulating_percent: number | null;
  distance_from_all_time_high_percent: number;
  price_change_percentage_30d_in_currency: number;
  price_change_percentage_60d_in_currency: number;
  price_change_percentage_200d_in_currency: number;
}

class OpenAiService {
  // Requests a structured verdict with reasoning, not just buy/hold/avoid.
  private readonly systemPrompt = `You are a cautious crypto market analyst writing for a beginner investor.
Given market data for a single coin, respond with strict JSON only, no markdown fences, in exactly this shape:
{
  "verdict": "buy" | "hold" | "avoid",
  "summary": "one sentence bottom line, in Hebrew",
  "strengths": ["2 to 4 short bullet points in Hebrew, each grounded in a specific number from the data"],
  "risks": ["2 to 4 short bullet points in Hebrew, each grounded in a specific number from the data"],
  "explanation": "3 to 5 sentence paragraph in Hebrew that weighs the strengths against the risks and justifies the verdict"
}

Rules:
- Every bullet point must reference an actual figure from the supplied data (a percentage, a rank, a ratio) rather than a generic statement.
- Weigh market_cap_rank (a higher rank number means a smaller, riskier project), supply_already_circulating_percent (a low value means heavy future dilution is likely), distance_from_all_time_high_percent (very close to 0 can mean limited near-term upside), and volume_to_market_cap_ratio (a very low value means thin liquidity and harder exits), alongside the 30/60/200-day price trend fields.
- Do not recommend "buy" on trend data alone if the supply or liquidity signals are clearly unfavorable.
- All Hebrew text should be plain, clear language for someone new to investing - no jargon without a quick explanation.`;

  public buildCoinSummary(details: CoinDetails): CoinSummaryForAi {
    const { market_data: marketData } = details;
    const supplyRatioPercent = marketData.max_supply
      ? (marketData.circulating_supply / marketData.max_supply) * 100
      : null;
    const volumeToMarketCapRatio =
      marketData.market_cap.usd > 0
        ? marketData.total_volume.usd / marketData.market_cap.usd
        : null;

    return {
      name: details.name,
      market_cap_rank: details.market_cap_rank,
      current_price_usd: marketData.current_price.usd,
      market_cap_usd: marketData.market_cap.usd,
      volume_24h_usd: marketData.total_volume.usd,
      volume_to_market_cap_ratio: volumeToMarketCapRatio,
      circulating_supply: marketData.circulating_supply,
      max_supply: marketData.max_supply,
      supply_already_circulating_percent: supplyRatioPercent,
      distance_from_all_time_high_percent: marketData.ath_change_percentage.usd,
      price_change_percentage_30d_in_currency:
        marketData.price_change_percentage_30d_in_currency.usd,
      price_change_percentage_60d_in_currency:
        marketData.price_change_percentage_60d_in_currency.usd,
      price_change_percentage_200d_in_currency:
        marketData.price_change_percentage_200d_in_currency.usd,
    };
  }

  // Requests a buy/hold/avoid recommendation from ChatGPT.
  public async fetchAiRecommendation(details: CoinDetails): Promise<AiRecommendation> {
    if (!appConfig.openAiApiKey) {
      throw new Error(
        "לא הוגדר מפתח OpenAI. הוסיפו VITE_OPENAI_API_KEY לקובץ .env והפעילו מחדש את npm run dev."
      );
    }

    const coinSummary = this.buildCoinSummary(details);
    const userPrompt = `Market data:\n${JSON.stringify(coinSummary, null, 2)}`;

    let response;
    try {
      response = await axios.post(
        appConfig.openAiBaseUrl,
        {
          model: "gpt-4o-mini",
          temperature: 0.4,
          messages: [
            { role: "system", content: this.systemPrompt },
            { role: "user", content: userPrompt },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${appConfig.openAiApiKey}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      throw new Error(this.describeError(error));
    }

    const rawContent: string = response.data.choices[0].message.content;
    const cleaned = rawContent.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned) as AiRecommendation;
  }

  // Turns OpenAI's HTTP error codes into an actionable Hebrew message.
  private describeError(error: unknown): string {
    if (!axios.isAxiosError(error)) {
      return "שגיאה לא צפויה בפנייה ל-OpenAI.";
    }

    const status = error.response?.status;
    const apiMessage: string | undefined = error.response?.data?.error?.message;

    if (status === 401) {
      return "מפתח ה-OpenAI ב-.env לא תקין. בדקו שהעתקתם אותו נכון ל-VITE_OPENAI_API_KEY.";
    }
    if (status === 429) {
      if (apiMessage?.toLowerCase().includes("quota")) {
        return "אין יתרה (quota) במפתח ה-OpenAI הזה. בדקו את יתרת החיוב בחשבון שלכם ב-platform.openai.com/settings/organization/billing.";
      }
      return "יותר מדי בקשות למפתח הזה בזמן קצר (Rate limit של OpenAI). המתינו כמה שניות ונסו שוב.";
    }
    if (status === 400) {
      return "OpenAI דחה את הבקשה (400). ייתכן שהמודל gpt-4o-mini לא זמין לחשבון שלכם.";
    }
    if (status && status >= 500) {
      return "שרתי OpenAI לא זמינים כרגע. נסו שוב בעוד רגע.";
    }
    return apiMessage ?? "שגיאה לא צפויה בפנייה ל-OpenAI.";
  }
}

export const openAiService = new OpenAiService();
