// User and Auth Types
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
  token: string;
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

// Club Types
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
    address?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Player Types
export type PlayerPosition =
  | "GOALKEEPER"
  | "DEFENDER"
  | "MIDFIELDER"
  | "FORWARD";

export type PlayerStatus = "ACTIVE" | "INJURED" | "SUSPENDED" | "TRANSFERRED" | "RETIRED";

export interface Player {
  _id: string;
  club: string | Club;
  firstName: string;
  lastName: string;
  number?: number;
  position: PlayerPosition;
  status: PlayerStatus;
  dateOfBirth?: string;
  nationality?: string;
  photo?: string;
  height?: number;
  weight?: number;
  user?: string | User;
  createdAt: string;
  updatedAt: string;
}

// Team Types
export type TeamCategory = "SENIOR" | "JUNIOR" | "WOMEN" | "ACADEMY" | "RESERVE";

export interface Team {
  _id: string;
  club: string | Club;
  name: string;
  category: TeamCategory;
  division?: string;
  manager?: string | User;
  coach?: string | User;
  players?: Player[];
  logo?: string;
  createdAt: string;
  updatedAt: string;
}

// Match Types
export type MatchStatus = "SCHEDULED" | "LIVE" | "HT" | "FT" | "POSTPONED" | "CANCELLED";

export interface MatchEvent {
  type: "GOAL" | "OWN_GOAL" | "PENALTY" | "YELLOW_CARD" | "RED_CARD" | "SUBSTITUTION" | "OTHER";
  minute: number;
  player?: string | Player;
  assist?: string | Player;
  description?: string;
}

export interface Match {
  _id: string;
  homeTeam: string | Team;
  awayTeam: string | Team;
  homeScore: number;
  awayScore: number;
  matchDate: string;
  venue?: string;
  status: MatchStatus;
  competition?: string;
  season?: string;
  events: MatchEvent[];
  attendance?: number;
  createdAt: string;
  updatedAt: string;
}

// Competition Types
export type CompetitionType = "LEAGUE" | "CUP" | "FRIENDLY" | "TOURNAMENT";

export interface Competition {
  _id: string;
  club: string | Club;
  name: string;
  type: CompetitionType;
  season?: string;
  format?: string;
  teams?: Team[];
  createdAt: string;
  updatedAt: string;
}

// Season Types
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

// News Types
export interface News {
  _id: string;
  club: string | Club;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  cover?: string;
  category?: string;
  tags?: string[];
  isPublished: boolean;
  viewCount: number;
  author?: User;
  createdAt: string;
  updatedAt: string;
}

// Gallery Types
export type MediaType = "IMAGE" | "VIDEO";

export interface Media {
  _id: string;
  url: string;
  type: MediaType;
  caption?: string;
}

export interface Gallery {
  _id: string;
  club: string | Club;
  title: string;
  description?: string;
  category?: string;
  media: Media[];
  createdAt: string;
  updatedAt: string;
}

// Academy Types
export interface Academy {
  _id: string;
  club: string | Club;
  name: string;
  ageGroup?: string;
  headCoach?: string | User;
  schedule?: string;
  players?: Player[];
  createdAt: string;
  updatedAt: string;
}

// Training Types
export type TrainingType = "PRACTICE" | "TACTICAL" | "FITNESS" | "RECOVERY" | "OTHER";
export type TrainingStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";

export interface TrainingSession {
  _id: string;
  club: string | Club;
  team: string | Team;
  title: string;
  date: string;
  type: TrainingType;
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

// Member Types
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

// Statistics Types
export type StatisticType = "GOALS" | "ASSISTS" | "CLEAN_SHEETS" | "YELLOW_CARDS" | "RED_CARDS" | "APPEARANCES" | "MINUTES_PLAYED";

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

// API Response Types
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

// Standings Types
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
  position: number;
}

// Top Scorer Types
export interface TopScorer {
  player: Player;
  goals: number;
  assists: number;
  appearances: number;
}
