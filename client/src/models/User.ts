export interface User {
  id: string;
  email: string;
  name: string;
  role: 'host' | 'guest';
  createdAt: string;
  contact?: string;
  trustScore: number;
}
