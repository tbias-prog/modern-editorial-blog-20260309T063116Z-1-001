import { Timestamp } from 'firebase/firestore';

export type UserRole = 'admin' | 'reader';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
  createdAt: Timestamp;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  thumbnailUrl: string;
  authorId: string;
  authorName: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  status: 'draft' | 'published';
  viewCount: number;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Timestamp;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  createdAt: Timestamp;
}
