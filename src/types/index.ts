// ─── User & Auth Types ──────────────────────────────────────────────
export type UserRole =
  | "SUPER_ADMIN"
  | "CLUB_ADMIN"
  | "TEAM_MANAGER"
  | "COACH"
  | "SCORER"
  | "PLAYER"
  | "MEMBER";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  photo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Membership {
  _id: string;
  user: string;
  club: string;
  membershipType: "FREE" | "BASIC" | "PREMIUM" | "VIP";
  expiryDate: string;
  isActive: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  data: {
    user: User;
  };
}

export interface MeResponse {
  data: {
    user: User;
    membership: Membership | null;
  };
}

// ─── Club Types ─────────────────────────────────────────────────────
export interface Club {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  founded?: number;
  stadium?: string;
  logo?: string;
  cover?: string;
  contact?: {
    email?: string;
    phone?: string;
    website?: string;
  };
  location?: {
    country?: string;
    city?: string;
    /** Street / area line, e.g. "Bhuiyyarhat Chowrasta". */
    address?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// ─── Player Types ───────────────────────────────────────────────────
export type PlayerPosition =
  | "GOALKEEPER"
  | "DEFENDER"
  | "MIDFIELDER"
  | "FORWARD";

export type PlayerSubPosition =
  | "CENTRE_BACK"
  | "LEFT_BACK"
  | "RIGHT_BACK"
  | "DEFENSIVE_MIDFIELDER"
  | "CENTRAL_MIDFIELDER"
  | "ATTACKING_MIDFIELDER"
  | "LEFT_WINGER"
  | "RIGHT_WINGER"
  | "STRIKER"
  | "SECOND_STRIKER";

export type PlayerStatus = "ACTIVE" | "INJURED" | "SUSPENDED" | "LOANED" | "INACTIVE";

export interface Player {
  _id: string;
  club: string | Club;
  firstName: string;
  lastName: string;
  number?: number;
  position: PlayerPosition;
  subPosition?: PlayerSubPosition;
  status: PlayerStatus;
  dateOfBirth?: string;
  nationality?: string;
  photo?: string;
  height?: number;
  weight?: number;
  preferredFoot?: "LEFT" | "RIGHT" | "BOTH";
  bio?: string;
  pac?: number;
  sho?: number;
  pas?: number;
  dri?: number;
  def?: number;
  phy?: number;
  joinDate?: string;
  contractEnd?: string;
  isActive?: boolean;
  user?: string | User;
  createdAt: string;
  updatedAt: string;
}

// ─── Team Types ─────────────────────────────────────────────────────
export type TeamCategory = "SENIOR" | "JUNIOR" | "WOMEN" | "ACADEMY" | "RESERVE";

export interface StartingXIEntry {
  player: string | Player;
  position: string;
  slotIndex: number;
}

export interface Team {
  _id: string;
  club: string | Club;
  name: string;
  category: TeamCategory;
  division?: string;
  manager?: string | User;
  coach?: string | User;
  captain?: string | Player;
  viceCaptain?: string | Player;
  players?: Player[];
  formation?: string;
  startingXI?: StartingXIEntry[];
  bench?: (string | Player)[];
  logo?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Formation Types ────────────────────────────────────────────────
export interface FormationSlot {
  role: string;
  x: number;
  y: number;
}

export interface Formation {
  name: string;
  playerCount: number; // 5, 7, 9, or 11
  slots: FormationSlot[];
}

// ─── Match Types ────────────────────────────────────────────────────
export type MatchStatus = "SCHEDULED" | "LIVE" | "HT" | "FT" | "POSTPONED" | "CANCELLED";

export type MatchEventType =
  | "GOAL"
  | "OWN_GOAL"
  | "YELLOW_CARD"
  | "RED_CARD"
  | "SUBSTITUTION"
  | "PENALTY_MISSED"
  | "INJURY";

export interface MatchEvent {
  type: MatchEventType;
  minute?: number;
  player?: string | Player;
  assist?: string | Player;
  description?: string;
}

export interface MatchVenue {
  name?: string;
  address?: string;
}

export interface Match {
  _id: string;
  club: string | Club;
  homeTeam: string | Team;
  awayTeam: string | Team;
  matchDate: string;
  kickoff?: string;
  venue?: MatchVenue;
  status: MatchStatus;
  score: {
    home: number;
    away: number;
  };
  events: MatchEvent[];
  attendance?: number;
  competition?: string | { _id: string; name: string; type: string };
  season?: string | { _id: string; name: string; year: number };
  referee?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Competition Types ──────────────────────────────────────────────
export type CompetitionType = "LEAGUE" | "CUP" | "TOURNAMENT" | "FRIENDLY";
export type CompetitionFormat = "ROUND_ROBIN" | "KNOCKOUT" | "GROUP_STAGE" | "PLAYOFF";

export interface Competition {
  _id: string;
  club: string | Club;
  name: string;
  slug?: string;
  type: CompetitionType;
  logo?: string;
  country?: string;
  description?: string;
  season?: string | { _id: string; name: string; year: number };
  teams?: (string | Team)[];
  format?: CompetitionFormat;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Season Types ───────────────────────────────────────────────────
export interface Season {
  _id: string;
  club: string | Club;
  name: string;
  year: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── News Types ─────────────────────────────────────────────────────
export type NewsCategory = "Transfer" | "Match Report" | "Interview" | "Analysis" | "Club News" | "General";

export interface News {
  _id: string;
  club: string | Club;
  author?: User;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  cover?: string;
  category?: NewsCategory;
  tags?: string[];
  isPublished: boolean;
  publishedAt?: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Gallery Types ──────────────────────────────────────────────────
export type MediaType = "IMAGE" | "VIDEO";
export type GalleryCategory = "Match" | "Training" | "Event" | "Team" | "Other";

export interface Media {
  _id: string;
  url: string;
  type: MediaType;
  caption?: string;
  uploadedBy?: string | User;
  createdAt?: string;
  updatedAt?: string;
}

export interface Gallery {
  _id: string;
  club: string | Club;
  title: string;
  description?: string;
  category?: GalleryCategory;
  coverImage?: string;
  media: Media[];
  isPublished?: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Academy Types ──────────────────────────────────────────────────
export type AcademyAgeGroup = "SENIOR" | "U8" | "U10" | "U12" | "U14" | "U16" | "U18" | "U21";

export interface AcademySchedule {
  trainingDays?: string[];
  trainingTime?: string;
}

export interface Academy {
  _id: string;
  club: string | Club;
  name: string;
  description?: string;
  ageGroup: AcademyAgeGroup;
  headCoach?: string | User;
  photo?: string;
  schedule?: AcademySchedule;
  players?: Player[];
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Training Types ─────────────────────────────────────────────────
export type TrainingType = "TACTICAL" | "PHYSICAL" | "TECHNICAL" | "RECOVERY" | "MIXED";
export type TrainingStatus = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface TrainingSession {
  _id: string;
  club: string | Club;
  team: string | Team;
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  type: TrainingType;
  description?: string;
  coach?: string | User;
  status: TrainingStatus;
  attendance?: {
    player: string | Player;
    status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
    notes?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

// ─── Member Types ───────────────────────────────────────────────────
export type MembershipType = "FREE" | "BASIC" | "PREMIUM" | "VIP";

export interface Member {
  _id: string;
  user: string | User;
  club: string | Club;
  membershipType: MembershipType;
  expiryDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Statistics Types ───────────────────────────────────────────────
export type StatisticType =
  | "GOALS"
  | "ASSISTS"
  | "CLEAN_SHEETS"
  | "YELLOW_CARDS"
  | "RED_CARDS"
  | "APPEARANCES"
  | "MINUTES_PLAYED";

export interface Statistic {
  _id: string;
  club: string | Club;
  player: string | Player;
  team?: string | Team;
  type: StatisticType;
  value: number;
  season?: string;
  competition?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── API Response Types ─────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  totalPages: number;
  currentPage: number;
  results: number;
}

// ─── Standings Types ────────────────────────────────────────────────
// Backend returns these directly from the statistics controller
export interface Standing {
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  position?: number; // computed client-side from sort order
}

// ─── Top Scorer Types ───────────────────────────────────────────────
// Backend aggregation returns { player, goals } only
export interface TopScorer {
  player: Player;
  goals: number;
}

// ─── Match Formation Types ────────────────────────────────────────────
export interface MatchFormation {
  _id: string;
  club: string | Club;
  match: string | Match;
  team: string | Team;
  formation: string;
  playerCount: number; // 5, 7, 9, or 11
  startingXI: { player: string | Player; position: string; slotIndex: number }[];
  captain?: string | Player;
  bench?: (string | Player)[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
