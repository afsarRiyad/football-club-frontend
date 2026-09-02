import api from "./api";
import {
  Club,
  Player,
  Team,
  Match,
  Competition,
  Season,
  News,
  Gallery,
  Academy,
  TrainingSession,
  Statistic,
  Standing,
  TopScorer,
  PaginatedResponse,
} from "@/types";

// ─── Generic typed fetcher ──────────────────────────────────────────

async function fetchPaginated<T>(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>
): Promise<PaginatedResponse<T>> {
  const { data } = await api.get(endpoint, { params });
  return {
    success: data.success,
    data: data.data || [],
    total: data.total || 0,
    totalPages: data.totalPages || 1,
    currentPage: data.currentPage || 1,
    results: data.results || 0,
  };
}

async function fetchOne<T>(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>
): Promise<T> {
  const { data } = await api.get(endpoint, { params });
  // Backend wraps single items in data.data.{entityName} or just data.data
  return (data.data?.player || data.data?.team || data.data?.match || data.data?.club || data.data?.article || data.data?.gallery || data.data?.academy || data.data?.training || data.data?.statistic || data.data) as T;
}

// ─── Clubs ──────────────────────────────────────────────────────────

export async function getClubs(params?: {
  page?: number;
  limit?: number;
  search?: string;
  country?: string;
}) {
  return fetchPaginated<Club>("/clubs", params);
}

export async function getClub(id: string) {
  return fetchOne<Club>(`/clubs/${id}`);
}

// ─── Players ────────────────────────────────────────────────────────

export async function getPlayers(params?: {
  page?: number;
  limit?: number;
  club?: string;
  position?: string;
  status?: string;
  isActive?: boolean;
  search?: string;
  sort?: string;
}) {
  return fetchPaginated<Player>("/players", params);
}

export async function getPlayer(id: string) {
  return fetchOne<Player>(`/players/${id}`);
}

// ─── Teams ──────────────────────────────────────────────────────────

export async function getTeams(params?: {
  page?: number;
  limit?: number;
  club?: string;
  category?: string;
  isActive?: boolean;
  search?: string;
}) {
  return fetchPaginated<Team>("/teams", params);
}

export async function getTeam(id: string) {
  return fetchOne<Team>(`/teams/${id}`);
}

// ─── Matches ────────────────────────────────────────────────────────

export async function getMatches(params?: {
  page?: number;
  limit?: number;
  club?: string;
  competition?: string;
  season?: string;
  status?: string;
  from?: string;
  to?: string;
  sort?: string;
}) {
  return fetchPaginated<Match>("/matches", params);
}

export async function getMatch(id: string) {
  return fetchOne<Match>(`/matches/${id}`);
}

// ─── Competitions ───────────────────────────────────────────────────

export async function getCompetitions(params?: {
  page?: number;
  limit?: number;
  club?: string;
}) {
  return fetchPaginated<Competition>("/competitions", params);
}

export async function getCompetition(id: string) {
  return fetchOne<Competition>(`/competitions/${id}`);
}

// ─── Seasons ────────────────────────────────────────────────────────

export async function getSeasons(params?: {
  page?: number;
  limit?: number;
  club?: string;
}) {
  return fetchPaginated<Season>("/seasons", params);
}

export async function getSeason(id: string) {
  return fetchOne<Season>(`/seasons/${id}`);
}

// ─── News ───────────────────────────────────────────────────────────

export async function getNews(params?: {
  page?: number;
  limit?: number;
  club?: string;
  category?: string;
  tag?: string;
  search?: string;
  sort?: string;
}) {
  return fetchPaginated<News>("/news", params);
}

export async function getNewsArticle(slugOrId: string) {
  return fetchOne<News>(`/news/${slugOrId}`);
}

// ─── Gallery ────────────────────────────────────────────────────────

export async function getGalleries(params?: {
  page?: number;
  limit?: number;
  club?: string;
  category?: string;
  search?: string;
}) {
  return fetchPaginated<Gallery>("/gallery", params);
}

export async function getGallery(id: string) {
  return fetchOne<Gallery>(`/gallery/${id}`);
}

// ─── Academy ────────────────────────────────────────────────────────

export async function getAcademies(params?: {
  page?: number;
  limit?: number;
  club?: string;
  ageGroup?: string;
  search?: string;
}) {
  return fetchPaginated<Academy>("/academy", params);
}

export async function getAcademy(id: string) {
  return fetchOne<Academy>(`/academy/${id}`);
}

// ─── Training ───────────────────────────────────────────────────────

export async function getTrainings(params?: {
  page?: number;
  limit?: number;
  club?: string;
  team?: string;
  type?: string;
  status?: string;
  search?: string;
}) {
  return fetchPaginated<TrainingSession>("/training", params);
}

export async function getTraining(id: string) {
  return fetchOne<TrainingSession>(`/training/${id}`);
}

// ─── Statistics ─────────────────────────────────────────────────────

export async function getStatistics(params?: {
  page?: number;
  limit?: number;
  club?: string;
  player?: string;
  team?: string;
  type?: string;
  season?: string;
}) {
  return fetchPaginated<Statistic>("/statistics", params);
}

export async function getTopScorers(params?: {
  season?: string;
  competition?: string;
  club?: string;
  limit?: number;
}): Promise<TopScorer[]> {
  const { data } = await api.get("/statistics/top-scorers", { params });
  return data.data || [];
}

export async function getStandings(params?: {
  season?: string;
  competition?: string;
}): Promise<Standing[]> {
  const { data } = await api.get("/statistics/standings", { params });
  return (data.data || []).map((s: any, i: number) => ({
    ...s,
    position: i + 1,
  }));
}
