/**
 * Live Chat Component
 * مكون الدردشة الحية
 * 
 * Integrates with Crisp, Intercom, or similar live chat service
 */

import { useEffect, useState } from 'react';
import React from 'react';
import { MessageCircle, X } from 'lucide-react';

export default function LiveChat() {
  useEffect(() => {
    // Initialize Crisp Live Chat
    // Replace with your actual Crisp website ID
    const CRISP_WEBSITE_ID = process.env.VITE_CRISP_WEBSITE_ID || 'default-id';

    if (CRISP_WEBSITE_ID && CRISP_WEBSITE_ID !== 'default-id') {
      // Load Crisp script
      const script = document.createElement('script');
      script.src = 'https://client.crisp.chat/l.js';
      script.async = true;
      script.onload = () => {
        // Initialize Crisp
        if (window.$crisp) {
          window.$crisp.push(['set', 'website:website_id', CRISP_WEBSITE_ID]);
          window.$crisp.push(['do', 'show']);
        }
      };
      document.head.appendChild(script);
    }
  }, []);

  return null; // Crisp renders its own UI
}

/**
 * Alternative: Simple built-in chat widget
 * This can be used if external service is not available
 */
export function SimpleLiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'support',
      text: 'مرحباً بك! كيف يمكننا مساعدتك؟',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');

  const handleSendMessage = () => {
    if (input.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        sender: 'user',
        text: input,
        timestamp: new Date(),
      };
      setMessages([...messages, newMessage]);
      setInput('');

      // Simulate support response
      setTimeout(() => {
        const response = {
          id: (Date.now() + 1).toString(),
          sender: 'support',
          text: 'شكراً لرسالتك! سيتم الرد عليك قريباً.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, response]);
      }, 1000);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="bg-white rounded-lg shadow-xl w-96 h-96 flex flex-col">
          {/* Header */}
          <div className="bg-primary text-white p-4 rounded-t-lg flex justify-between items-center">
            <div>
              <h3 className="font-semibold">الدردشة الحية</h3>
              <p className="text-sm text-primary-foreground/80">نحن هنا للمساعدة</p>
            </div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="hover:bg-primary/80 p-1 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.sender === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-secondary text-foreground'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {msg.timestamp.toLocaleTimeString('ar-JO')}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="border-t p-4 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="اكتب رسالتك..."
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={handleSendMessage}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              إرسال
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary text-white rounded-full p-4 shadow-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="text-sm font-semibold">دردشة</span>
        </button>
      )}
    </div>
  );
}

// Helper hooks
function useToggle(initial: boolean) {
  const [state, setState] = useState(initial);
  return [state, () => setState(!state)] as const;
}

function useMessages(initial: any[]) {
  const [messages, setMessages] = useState(initial);
  return [messages, setMessages] as const;
}

function useInput(initial: string) {
  const [input, setInput] = useState(initial);
  return [input, setInput] as const;
}

declare global {
  interface Window {
    $crisp: any;
  }
}
