export interface ChatMessage {
  id: string;
  sender: "me" | "peer";
  text: string;
  timestamp: number;
}
