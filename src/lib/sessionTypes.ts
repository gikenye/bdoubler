export interface Session {
  id: string;
  name: string;
  creatorId: string;
  participants: string[];
  status: 'active' | 'inactive' | 'finished';
  createdAt: string;
  updatedAt: string;
}

export interface CreateSessionRequest {
  name: string;
  creatorId: string;
}

export interface JoinSessionRequest {
  userId: string;
}

export interface UpdateSessionRequest {
  status?: 'active' | 'inactive' | 'finished';
  // Add other updatable fields if needed
}