export interface User {
  id: string;
  email: string;
  name: string;
  role: 'host' | 'guest';
  created_at: string;
  contact?: string;
  trust_score: number;
  identity_verification_status: 'not_verified' | 'pending' | 'verified';
}
