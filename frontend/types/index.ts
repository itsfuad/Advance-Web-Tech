export interface User {
  id: string;
  email: string;
  name: string;
  profileImage?: string;
  role: "admin" | "user";
  status: "active" | "blocked" | "banned";
  emailVerified?: boolean;
  emailVerifiedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PublicUser {
  id: string;
  name: string;
  profileImage?: string;
  createdAt: string;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  goalAmount: number;
  raisedAmount: number;
  coverImage?: string;
  status: "active" | "frozen" | "closed";
  deadline?: string;
  category?: string;
  creatorId: string;
  creator: User;
  reported: boolean;
  reportReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Donation {
  id: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  transactionId?: string;
  message?: string;
  donorId: string;
  donor: User;
  campaignId: string;
  campaign: Campaign;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface PlatformStats {
  totalUsers: number;
  totalCampaigns: number;
  activeCampaigns: number;
  frozenCampaigns: number;
  reportedCampaigns: number;
  totalDonations: number;
  totalRaised: number;
  recentDonations: Donation[];
  topCampaigns: Campaign[];
}

export interface UserStats {
  campaignsCreated: number;
  activeCampaigns: number;
  totalRaised: number;
  donationsMade: number;
  totalDonated: number;
  recentDonations: Donation[];
  campaigns: Campaign[];
}
