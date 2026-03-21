import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Send, User, Sparkles, X, Minimize2, Maximize2, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hello! I am your Jaipuria Vidyalaya Alumni Assistant. How can I help you today? I can help you find alumni, suggest career paths, or tell you about school history.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const model = ai.models.get({ model: "gemini-3-flash-preview" });
      
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: `
            You are the "Jaipuria Vidyalaya Alumni Assistant". 
            Your goal is to help alumni of Jaipuria Vidyalaya, Jaipur, connect and grow.
            You have knowledge about the school (established in 1993) and its values.
            Be professional, warm, and helpful. 
            If asked about career advice, provide thoughtful suggestions.
            If asked about finding alumni, explain how to use the directory.
            Keep responses concise and engaging.
          `,
        },
      });

      // Send the whole history for context
      const response = await chat.sendMessage({
        message: userMessage
      });

      setMessages(prev => [...prev, { role: 'model', text: response.text || "I'm sorry, I couldn't process that." }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm having some trouble connecting right now. Please check your AI settings." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col mb-4 transition-all duration-300 ${
              isMinimized ? 'h-14 w-64' : 'h-[500px] w-[350px] sm:w-[400px]'
            }`}
          >
            {/* Header */}
            <div className="bg-stone-900 p-4 flex items-center justify-between text-white">
              <div className="flex items-center space-x-2">
                <div className="p-1 bg-stone-800 rounded-lg">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="font-serif font-medium text-sm">Alumni Assistant</span>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={() => setIsMinimized(!isMinimized)} className="hover:text-stone-300 transition-colors">
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button onClick={() => setIsOpen(false)} className="hover:text-stone-300 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex max-w-[85%] space-x-2 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          msg.role === 'user' ? 'bg-stone-200' : 'bg-stone-900'
                        }`}>
                          {msg.role === 'user' ? <User className="w-4 h-4 text-stone-600" /> : <Bot className="w-4 h-4 text-white" />}
                        </div>
                        <div className={`p-3 rounded-2xl text-sm ${
                          msg.role === 'user' 
                            ? 'bg-stone-900 text-white rounded-tr-none' 
                            : 'bg-white border border-stone-200 text-stone-800 rounded-tl-none shadow-sm'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex space-x-2">
                        <div className="w-8 h-8 rounded-full bg-stone-900 flex items-center justify-center">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-white border border-stone-200 p-3 rounded-2xl rounded-tl-none shadow-sm">
                          <Loader2 className="w-4 h-4 animate-spin text-stone-400" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="p-4 bg-white border-t border-stone-100">
                  <form 
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="flex items-center space-x-2"
                  >
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask anything..."
                      className="flex-1 bg-stone-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-stone-900 transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      className="p-2 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-all disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
          isOpen ? 'bg-stone-100 text-stone-900' : 'bg-stone-900 text-white'
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
      </motion.button>
    </div>
  );
}
