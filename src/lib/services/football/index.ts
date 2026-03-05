// ============================================
// Football Services - Index
// Export centralisé de tous les services football
// ============================================

// Types
export * from "./types"

// Services
export { FootballCacheService, footballCache } from "./cache"
export { FootballRateLimiter, rateLimiter, RateLimitError, rateLimit } from "./rate-limiter"
export { ApiFootballClient, apiFootballClient, ApiFootballError } from "./api-football"
export { FootballDataClient, footballDataClient, FootballDataError } from "./football-data"
export {
  TheSportsDBClient,
  theSportsDBClient,
  TheSportsDBError,
  THESPORTSDB_TEAM_IDS,
  getTheSportsDBId
} from "./thesportsdb"
export { FootballDataAggregator, footballAggregator } from "./aggregator"
