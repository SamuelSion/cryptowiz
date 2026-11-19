class AppConfig {
  // External API base URLs.
  public readonly coinGeckoBaseUrl = "https://api.coingecko.com/api/v3";
  public readonly krakenBaseUrl = "https://api.kraken.com/0/public";
  public readonly cryptoCompareBaseUrl = "https://min-api.cryptocompare.com/data/pricemulti";
  public readonly coinPaprikaBaseUrl = "https://api.coinpaprika.com/v1";
  public readonly openAiBaseUrl = "https://api.openai.com/v1/chat/completions";

  // API keys, read once from the environment.
  public readonly openAiApiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
  public readonly coinGeckoApiKey = import.meta.env.VITE_COINGECKO_API_KEY as string | undefined;
  public readonly cryptoCompareApiKey = import.meta.env.VITE_CRYPTOCOMPARE_API_KEY as
    | string
    | undefined;

  // Caching and polling.
  public readonly krakenPairMapCacheTtlMs = 10 * 60 * 1000;
  public readonly coinPaprikaCacheTtlMs = 4000;
  public readonly livePricePollIntervalMs = 1000;
  public readonly coinPaprikaPollIntervalMs = 4000;
  public readonly candleRefreshIntervalMs = 30_000;
  public readonly maxLiveHistoryPoints = 60;
}

export const appConfig = new AppConfig();
