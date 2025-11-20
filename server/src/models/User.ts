export interface User {
  id: string;
  email: string;
  password_hash: string; // In a real app, never store plain text passwords
  name: string;
  role: 'host' | 'guest';
  createdAt: string;
  contact?: string; // Optional contact information
}
