export interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
}

export interface ChatHistory {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
} 