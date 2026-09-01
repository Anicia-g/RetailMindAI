'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bot,
  Sparkles,
  Send,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Users,
  ShoppingCart,
  Layers,
  MessageSquare
} from 'lucide-react';
import { useAppSettings } from '@/context/AppSettingsContext';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { sampleAIPrompts, getAIResponse } from '@/data/aiResponses';

export default function AIAssistantPage() {
  const { t } = useAppSettings();
  const router = useRouter();

  const [messages, setMessages] = useState([
    {
      id: 'm-init',
      sender: 'ai',
      text: `Welcome to the **RetailMind AI Intelligence Center**.\n\nI continuously monitor real-time POS sales transactions, supply chain lead times, inventory health across all store outlets, and K-Means customer RFM clusters.\n\nSelect a recommended business diagnostic below or type any custom query:`,
      actions: [
        { label: "Why did sales drop this week?", query: "Why did sales drop this week?" },
        { label: "Which products are at risk?", query: "Which products are at risk of stock-out?" },
        { label: "What should I reorder?", query: "What should I reorder right now?" },
        { label: "Why is Store 12 underperforming?", query: "Why is Store 12 underperforming?" }
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (queryToSend) => {
    const text = queryToSend || inputValue;
    if (!text.trim()) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const result = getAIResponse(text);
      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: result.response,
        actions: result.actions || [],
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleActionClick = (action) => {
    if (action.query) {
      handleSend(action.query);
      return;
    }
    if (action.isAction) {
      window.dispatchEvent(new CustomEvent('open-po-modal'));
      return;
    }
    if (action.route) {
      router.push(action.route);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-indigo-500 text-white shadow-md shadow-indigo-500/30 flex-shrink-0">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black">{t('retailMindAI')}</h2>
              <Badge variant="purple" size="sm" className="bg-indigo-400/20 text-indigo-200 border-indigo-300/30">
                ACTIVE
              </Badge>
            </div>
            <p className="text-xs text-indigo-200 mt-0.5">
              Conversational business copilot powered by retail sales, inventory, and customer intelligence.
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Questions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {sampleAIPrompts.slice(0, 3).map((prompt, idx) => (
          <div
            key={idx}
            onClick={() => handleSend(prompt)}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 hover:shadow-xs transition-all cursor-pointer space-y-1.5 group"
          >
            <div className="flex items-center justify-between">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition-transform group-hover:translate-x-0.5" />
            </div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{prompt}</p>
          </div>
        ))}
      </div>

      {/* Interactive Chat Window */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col h-[520px]">
        {/* Messages Log */}
        <div className="flex-1 p-5 overflow-y-auto space-y-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-slate-700/80'
                }`}
              >
                <div className="whitespace-pre-line prose dark:prose-invert prose-sm">
                  {msg.text}
                </div>

                {/* AI Action Buttons */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-2">
                    {msg.actions.map((act, aIdx) => (
                      <Button
                        key={aIdx}
                        variant="secondary"
                        size="sm"
                        icon={Sparkles}
                        onClick={() => handleActionClick(act)}
                        className="bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800"
                      >
                        {act.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 p-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
              <span>{t('thinking')}</span>
            </div>
          )}
        </div>

        {/* Query Input Box */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t('askAnything')}
              className="flex-1 px-4 py-3 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <Button
              type="submit"
              variant="primary"
              size="lg"
              icon={Send}
              disabled={!inputValue.trim() || isTyping}
            >
              {t('send')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
