export type Message = {
  id: string;
  text?: string;
  senderId: string;
  senderName?: string;
  createdAt: number; // epoch ms
  type?: 'text' | 'image' | 'system';
  mine?: boolean;
};

export type Sender = {
  id: string;
  name?: string;
  avatarUrl?: string;
};
