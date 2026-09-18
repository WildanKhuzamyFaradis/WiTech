export interface Division {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  memberCount: number;
  color: string;
  technologies: string[];
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  divisionId: string;
  tags: string[];
  year: number;
  status: "published" | "draft";
  featured: boolean;
  image: string;
  /** Display credits, not foreign keys to Member records. */
  members: string[];
  award: string;
  githubUrl?: string;
  liveUrl?: string;
}

export interface Member {
  id: string;
  name: string;
  role: string;
  /** null identifies Core/pengurus, not a missing division. */
  divisionId: string | null;
  year: string;
  avatar: string;
  github: string;
  linkedin: string;
  active: boolean;
}

export interface Album {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  date: string;
  photoCount: number;
  photos: string[];
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  /** Local WIB wall-clock times; same-day events only. */
  startTime: string;
  endTime: string;
  location: string;
  type: "Workshop" | "Bootcamp" | "Seminar" | "Sharing Session";
  description: string;
  image: string;
  registrationOpen: boolean;
  registrationLink?: string;
}

