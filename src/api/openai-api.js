 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import axios from "axios";

import { appConfig } from "../utils/app-config";

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY ;

// Market data payload sent to ChatGPT for analysis.
export function buildCoinSummary(details) {
  const { market_data: marketData } = details;
  const supplyRatioPercent = marketData.max_supply
    ? (marketData.circulating_supply / marketData.max_supply) * 100
    : null;
  const volumeToMarketCapRatio =
    marketData.market_cap.usd > 0 ? marketData.total_volume.usd / marketData.market_cap.usd : null;

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
    price_change_percentage_30d_in_currency: marketData.price_change_percentage_30d_in_currency.usd,
    price_change_percentage_60d_in_currency: marketData.price_change_percentage_60d_in_currency.usd,
    price_change_percentage_200d_in_currency:
      marketData.price_change_percentage_200d_in_currency.usd,
  };
}

// Requests a structured verdict with reasoning, not just buy/hold/avoid.
const SYSTEM_PROMPT = `You are a cautious crypto market analyst writing for a beginner investor.
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

// Requests a buy/hold/avoid recommendation from ChatGPT.
export async function fetchAiRecommendation(details) {
  if (!API_KEY) {
    throw new Error(
      "לא הוגדר מפתח OpenAI. הוסיפו VITE_OPENAI_API_KEY לקובץ .env והפעילו מחדש את npm run dev."
    );
  }

  const coinSummary = buildCoinSummary(details);
  const userPrompt = `Market data:\n${JSON.stringify(coinSummary, null, 2)}`;

  let response;
  try {
    response = await axios.post(
      appConfig.openAiBaseUrl,
      {
        model: "gpt-4o-mini",
        temperature: 0.4,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    throw new Error(describeOpenAiError(error));
  }

  const rawContent = response.data.choices[0].message.content;
  const cleaned = rawContent.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned) ;

  return parsed;
}

// Turns OpenAI's HTTP error codes into an actionable Hebrew message.
function describeOpenAiError(error) {
  if (!axios.isAxiosError(error)) {
    return "שגיאה לא צפויה בפנייה ל-OpenAI.";
  }

  const status = _optionalChain([error, 'access', _ => _.response, 'optionalAccess', _2 => _2.status]);
  const apiMessage = _optionalChain([error, 'access', _3 => _3.response, 'optionalAccess', _4 => _4.data, 'optionalAccess', _5 => _5.error, 'optionalAccess', _6 => _6.message]);

  if (status === 401) {
    return "מפתח ה-OpenAI ב-.env לא תקין. בדקו שהעתקתם אותו נכון ל-VITE_OPENAI_API_KEY.";
  }
  if (status === 429) {
    if (_optionalChain([apiMessage, 'optionalAccess', _7 => _7.toLowerCase, 'call', _8 => _8(), 'access', _9 => _9.includes, 'call', _10 => _10("quota")])) {
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
  return _nullishCoalesce(apiMessage, () => ( "שגיאה לא צפויה בפנייה ל-OpenAI."));
}
