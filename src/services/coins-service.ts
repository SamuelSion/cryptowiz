import { store } from "../store/store";
import { coinsSlice } from "../store/slices/coins-slice";
import { coinGeckoService } from "./coingecko-service";

// Fetches and caches the top 100 coins. Dispatches actions directly
// (this is a class, not a component, so Hooks aren't available).
class CoinsService {
  public async loadTopCoins(): Promise<void> {
    const { status } = store.getState().coins;

    // Already loading or already have it - nothing to do.
    if (status === "loading" || status === "succeeded") {
      return;
    }

    store.dispatch(coinsSlice.actions.startLoadingCoins());

    try {
      const coins = await coinGeckoService.fetchTopCoins();
      store.dispatch(coinsSlice.actions.setCoins(coins));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load coins";
      store.dispatch(coinsSlice.actions.setCoinsError(message));
    }
  }
}

export const coinsService = new CoinsService();
