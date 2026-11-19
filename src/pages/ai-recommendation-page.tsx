import { useEffect, useMemo, useState } from "react";
import { useAppSelector } from "../store/hooks";
import { coinsService } from "../services/coins-service";
import { aiRecommendationService } from "../services/ai-recommendation-service";
import AiDataInfoTooltip from "../components/coins/ai-data-info-tooltip";
import AiProsCons from "../components/coins/ai-pros-cons";
import AiStatGrid from "../components/coins/ai-stat-grid";
import { openAiService } from "../services/openai-service";
import type { AiRecommendation, CoinDetails } from "../models/coin";
import styles from "./ai-recommendation-page.module.css";

type RequestStatus = "idle" | "loading" | "loaded" | "error";

const VERDICT_LABELS: Record<AiRecommendation["verdict"], string> = {
  buy: "כדאי לרכוש",
  hold: "להמתין",
  avoid: "לא כדאי לרכוש",
};

export default function AiRecommendationPage() {
  const { items: allCoins } = useAppSelector((state) => state.coins);
  const selectedIds = useAppSelector((state) => state.selectedCoins.ids);

  const [selectedCoinId, setSelectedCoinId] = useState<string | null>(null);
  const [requestStatus, setRequestStatus] = useState<RequestStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<AiRecommendation | null>(null);
  const [analyzedDetails, setAnalyzedDetails] = useState<CoinDetails | null>(null);

  useEffect(() => {
    coinsService.loadTopCoins();
  }, []);

  const trackedCoins = useMemo(
    () => allCoins.filter((coin) => selectedIds.includes(coin.id)),
    [allCoins, selectedIds]
  );

  async function handleGetRecommendation() {
    if (!selectedCoinId) {
      setErrorMessage("בחרו מטבע לפני בקשת המלצה.");
      return;
    }

    setErrorMessage(null);
    setRecommendation(null);
    setAnalyzedDetails(null);
    setRequestStatus("loading");

    try {
      const { details, recommendation: result } =
        await aiRecommendationService.getRecommendation(selectedCoinId);
      setAnalyzedDetails(details);
      setRecommendation(result);
      setRequestStatus("loaded");
    } catch (error) {
      setRequestStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "שגיאה לא צפויה בקבלת ההמלצה.");
    }
  }

  return (
    <div className="page-container">
      <h1 className="page-heading">המלצת AI</h1>
      <p className="page-subheading">
        בחרו אחד מהמטבעות שאתם עוקבים אחריהם וקבלו המלצה מבוססת נתוני שוק בזמן אמת, שנשלחים
        ל-ChatGPT לניתוח.
      </p>

      {trackedCoins.length === 0 ? (
        <div className={styles.emptyState}>
          <p>עדיין לא סימנתם מטבעות למעקב.</p>
          <p className={styles.emptyHint}>
            עברו לדף הבית והפעילו את המתג על מטבע אחד או יותר כדי לקבל כאן המלצה.
          </p>
        </div>
      ) : (
        <div className={styles.layout}>
          <form className={styles.coinList} onSubmit={(event) => event.preventDefault()}>
            {trackedCoins.map((coin) => (
              <label key={coin.id} className={styles.coinOption}>
                <input
                  type="radio"
                  name="ai-coin"
                  value={coin.id}
                  checked={selectedCoinId === coin.id}
                  onChange={() => {
                    setSelectedCoinId(coin.id);
                    setRecommendation(null);
                    setRequestStatus("idle");
                    setErrorMessage(null);
                  }}
                />
                <img src={coin.image} alt={coin.name} className={styles.coinIcon} />
                <span className={styles.coinName}>{coin.name}</span>
                <span className={styles.coinSymbol}>{coin.symbol.toUpperCase()}</span>
              </label>
            ))}

            <button
              type="button"
              className={styles.recommendButton}
              onClick={handleGetRecommendation}
              disabled={requestStatus === "loading"}
            >
              {requestStatus === "loading" ? "מנתח נתונים..." : "קבל המלצה"}
            </button>
            {errorMessage && <p className={styles.errorText}>{errorMessage}</p>}
          </form>

          <div className={styles.resultCard}>
            {analyzedDetails && requestStatus === "loaded" && (
              <div className={styles.infoTooltipCorner}>
                <AiDataInfoTooltip summary={openAiService.buildCoinSummary(analyzedDetails)} />
              </div>
            )}
            {requestStatus === "idle" && (
              <p className={styles.placeholder}>ההמלצה תופיע כאן לאחר הבחירה.</p>
            )}
            {requestStatus === "loading" && (
              <p className={styles.placeholder}>שולח את נתוני המטבע ל-ChatGPT...</p>
            )}
            {requestStatus === "loaded" && recommendation && analyzedDetails && (
              <>
                <div className={styles.verdictRow}>
                  <span
                    className={`${styles.verdictBadge} ${styles[`verdict-${recommendation.verdict}`]}`}
                  >
                    {VERDICT_LABELS[recommendation.verdict]}
                  </span>
                  <p className={styles.summary}>{recommendation.summary}</p>
                </div>

                <AiProsCons strengths={recommendation.strengths} risks={recommendation.risks} />

                <p className={styles.explanation}>{recommendation.explanation}</p>

                <AiStatGrid details={analyzedDetails} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
