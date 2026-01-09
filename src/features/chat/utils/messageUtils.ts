import { Message } from '../types';

export const groupMessagesByDate = (messages: Message[]) => {
  const groups: Record<string, Message[]> = {};
  messages.forEach((m) => {
    const key = new Date(m.createdAt).toDateString();
    if (!groups[key]) groups[key] = [];
    groups[key].push(m);
  });
  return groups;
};

export default { groupMessagesByDate };
