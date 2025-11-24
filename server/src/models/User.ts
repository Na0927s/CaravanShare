export interface User {
  id: string;
  email: string;
  kakaoId?: string | null;
  password_hash: string; // In a real app, never store plain text passwords
  name: string;
  role: 'host' | 'guest';
  created_at: Date; // Changed from createdAt: string to created_at: Date
  updated_at: Date; // Added updated_at
  contact?: string; // Optional contact information
  trust_score: number; // Changed from trustScore to trust_score
  identity_verification_status: 'not_verified' | 'pending' | 'verified';
}
