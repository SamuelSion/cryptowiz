import { useEffect, useMemo, useState } from "react";
import { useAppSelector } from "../store/hooks";
import { coinsService } from "../services/coins-service";
import { fetchCoinDetails } from "../api/coingecko-api";
import { fetchAiRecommendation, buildCoinSummary } from "../api/openai-api";
import AiDataInfoTooltip from "../components/coins/ai-data-info-tooltip";
import type { AiRecommendation, CoinDetails } from "../types/coin";
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
      const details = await fetchCoinDetails(selectedCoinId);
      const result = await fetchAiRecommendation(details);
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
      <h2 className="page-heading">המלצת AI</h2>
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
                <img src={coin.image} alt="" className={styles.coinIcon} />
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
                <AiDataInfoTooltip summary={buildCoinSummary(analyzedDetails)} />
              </div>
            )}
            {requestStatus === "idle" && (
              <p className={styles.placeholder}>ההמלצה תופיע כאן לאחר הבחירה.</p>
            )}
            {requestStatus === "loading" && (
              <p className={styles.placeholder}>שולח את נתוני המטבע ל-ChatGPT...</p>
            )}
            {requestStatus === "loaded" && recommendation && (
              <>
                <div className={styles.verdictRow}>
                  <span
                    className={`${styles.verdictBadge} ${styles[`verdict-${recommendation.verdict}`]}`}
                  >
                    {VERDICT_LABELS[recommendation.verdict]}
                  </span>
                  <p className={styles.summary}>{recommendation.summary}</p>
                </div>

                {(recommendation.strengths.length > 0 || recommendation.risks.length > 0) && (
                  <div className={styles.prosConsGrid}>
                    {recommendation.strengths.length > 0 && (
                      <div className={styles.prosConsColumn}>
                        <h3 className={styles.prosConsHeading}>
                          <span className={styles.prosIcon}>▲</span> נקודות לטובה
                        </h3>
                        <ul className={styles.prosConsList}>
                          {recommendation.strengths.map((point, index) => (
                            <li key={index}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {recommendation.risks.length > 0 && (
                      <div className={styles.prosConsColumn}>
                        <h3 className={styles.prosConsHeading}>
                          <span className={styles.consIcon}>▼</span> סיכונים
                        </h3>
                        <ul className={styles.prosConsList}>
                          {recommendation.risks.map((point, index) => (
                            <li key={index}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <p className={styles.explanation}>{recommendation.explanation}</p>

                {analyzedDetails && (
                  <dl className={styles.statGrid}>
                    <dt>דירוג שווי שוק</dt>
                    <dt>מרחק מהשיא ההיסטורי</dt>
                    <dd className="mono-num">
                      {analyzedDetails.market_cap_rank ? `#${analyzedDetails.market_cap_rank}` : "—"}
                    </dd>
                    <dd className="mono-num">
                      {analyzedDetails.market_data.ath_change_percentage.usd.toFixed(1)}%
                    </dd>

                    <dt>אחוז מההיצע שכבר במחזור</dt>
                    <dt>נזילות (מחזור יומי / שווי שוק)</dt>
                    <dd className="mono-num">
                      {analyzedDetails.market_data.max_supply
                        ? `${(
                            (analyzedDetails.market_data.circulating_supply /
                              analyzedDetails.market_data.max_supply) *
                            100
                          ).toFixed(1)}%`
                        : "ללא תקרת היצע"}
                    </dd>
                    <dd className="mono-num">
                      {(
                        (analyzedDetails.market_data.total_volume.usd /
                          analyzedDetails.market_data.market_cap.usd) *
                        100
                      ).toFixed(2)}
                      %
                    </dd>
                  </dl>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
