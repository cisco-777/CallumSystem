import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatMessage {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatOverlay({ isOpen, onClose }: ChatOverlayProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      text: "Welcome to ElevateChat! I'm your cannabis concierge. How can I help you today?",
      isUser: false,
      timestamp: new Date()
    },
    {
      id: 2,
      text: "I'm looking for strain recommendations for relaxation",
      isUser: true,
      timestamp: new Date()
    },
    {
      id: 3,
      text: "Perfect! For relaxation, I'd recommend indica-dominant strains like Purple Kush or Granddaddy Purple. What's your experience level?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const userMessage: ChatMessage = {
        id: messages.length + 1,
        text: newMessage,
        isUser: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setNewMessage('');
      
      // Simulate bot response
      setTimeout(() => {
        const botMessage: ChatMessage = {
          id: messages.length + 2,
          text: "Thank you for your message! This is a demo chat. In the full version, you'll get personalized cannabis recommendations and expert guidance.",
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 chat-overlay" onClick={onClose}>
      <div className="flex items-center justify-center min-h-screen p-4">
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-96 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Chat Header */}
          <div className="bg-cannabis text-white p-4 rounded-t-2xl flex justify-between items-center">
            <div className="flex items-center">
              <i className="fas fa-leaf mr-3"></i>
              <span className="font-semibold">ElevateChat Demo</span>
            </div>
            <button onClick={onClose} className="text-white hover:text-gray-200">
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
          
          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id}
                className={`flex items-start space-x-3 ${message.isUser ? 'justify-end' : ''}`}
              >
                {!message.isUser && (
                  <div className="bg-cannabis text-white p-2 rounded-full">
                    <i className="fas fa-robot text-sm"></i>
                  </div>
                )}
                <div className={`p-3 rounded-lg max-w-xs ${
                  message.isUser 
                    ? 'bg-cannabis text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <p className="text-sm">{message.text}</p>
                </div>
                {message.isUser && (
                  <div className="bg-cannabis text-white p-2 rounded-full">
                    <i className="fas fa-user text-sm"></i>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Chat Input */}
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 focus:ring-2 focus:ring-cannabis"
              />
              <Button 
                onClick={handleSendMessage}
                className="bg-cannabis text-white hover:bg-forest transition-colors duration-200"
              >
                <i className="fas fa-paper-plane"></i>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
