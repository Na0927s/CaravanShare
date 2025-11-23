export interface User {
  id: string;
  email: string;
  kakaoId?: string | null;
  password_hash: string; // In a real app, never store plain text passwords
  name: string;
  role: 'host' | 'guest';
  createdAt: string;
  contact?: string; // Optional contact information
  trustScore: number; // Add trustScore field
  identity_verification_status: 'not_verified' | 'pending' | 'verified';
}
