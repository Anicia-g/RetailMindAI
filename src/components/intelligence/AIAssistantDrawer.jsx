'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Send,
  Bot,
  Sparkles,
  ArrowRight,
  ShoppingCart,
  ShoppingBag,
  TrendingUp,
  Mic,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAppSettings } from '@/context/AppSettingsContext';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { roleAIPrompts, getAIResponse } from '@/data/aiResponses';
import { ROLES } from '@/lib/auth';

export function AIAssistantDrawer({ isOpen, onClose, onOpenPOModal, role: propRole }) {
  const router = useRouter();
  const { user, role: contextRole } = useAuth();
  const { t } = useAppSettings();

  const currentRole = propRole || contextRole || user?.role || ROLES.ADMIN;
  const prompts = roleAIPrompts[currentRole] || roleAIPrompts.ADMIN;

  const getWelcomeMessage = (role) => {
    if (role === ROLES.CUSTOMER) {
      return {
        id: 'm-welcome',
        sender: 'ai',
        text: `👋 Hello ${user?.name?.split(' ')[0] || 'there'}! I am **RetailMind AI Grocer**.\n\nI can help you find farm-fresh organic produce, recommend healthy recipes, track your grocery orders, or find the best active discount codes!`,
        actions: [
          { label: '🔥 Today deals & discounts', query: 'What are the best deals on dairy and bakery today?' },
          { label: '🍝 Healthy dinner recipe idea', query: 'Can you suggest ingredients for a healthy pasta dinner?' },
          { label: '🏷️ Active coupon vouchers', query: 'What promo coupon codes are available?' },
        ],
      };
    }

    if (role === ROLES.SELLER) {
      return {
        id: 'm-welcome',
        sender: 'ai',
        text: `⚡ Welcome to your Shift Terminal, ${user?.name || 'Seller'}! I am **RetailMind Shift Assistant**.\n\nI am tracking your daily quota, store walk-in velocity, and low-stock aisle alerts for **${user?.store || 'Indiranagar Flagship'}**.`,
        actions: [
          { label: "📊 Today's sales status", query: "How are today's sales tracking?" },
          { label: '⚠️ Check aisle stock alerts', query: 'Which items in my store are low in stock?' },
          { label: '⭐ Best selling SKUs today', query: 'What are the best-selling products today?' },
        ],
      };
    }

    // Default: Admin
    return {
      id: 'm-welcome',
      sender: 'ai',
      text: `Hello ${user?.name || 'Executive'}! I am **RetailMind AI Enterprise BI**.\n\nI have scanned sales velocities, supply chain bottlenecks, inventory risks across all stores, and customer LTV clusters. What would you like to inspect?`,
      actions: [
        { label: '📉 Why did sales drop this week?', query: 'Why did sales drop this week?' },
        { label: '📦 What should I reorder now?', query: 'What should I reorder right now?' },
        { label: '⚠️ Products at stock-out risk', query: 'Which products are at risk of stock-out?' },
      ],
    };
  };

  const [messages, setMessages] = useState([getWelcomeMessage(currentRole)]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [autoVoiceResponse, setAutoVoiceResponse] = useState(true);

  const messagesEndRef = useRef(null);
  const synth = useSpeechSynthesis();

  // Scroll chat messages smoothly
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (queryToSend, isFromVoice = false) => {
    const text = queryToSend || inputQuery;
    if (!text || !text.trim()) return;

    // Stop any active text-to-speech
    synth.stop();

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      isVoice: isFromVoice,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      const result = getAIResponse(text, currentRole);
      const aiMsgId = `ai-${Date.now()}`;
      const aiMsg = {
        id: aiMsgId,
        sender: 'ai',
        text: result.response,
        actions: result.actions || [],
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);

      // Speak response aloud if triggered by voice and auto-voice response is enabled
      if (isFromVoice && autoVoiceResponse && synth.isSupported) {
        synth.speak(result.response, aiMsgId);
      }
    }, 450);
  };

  const speech = useSpeechRecognition({
    onResult: (spokenText) => {
      if (!spokenText || !spokenText.trim()) return;
      speech.stopListening();
      setInputQuery('');
      handleSend(spokenText.trim(), true);
    },
    onError: (errorMsg) => {
      console.warn('AI Assistant voice notice:', errorMsg);
    },
  });

  useEffect(() => {
    setMessages([getWelcomeMessage(currentRole)]);
  }, [currentRole]);

  const { stopListening } = speech;
  const { stop: stopSynth } = synth;

  useEffect(() => {
    if (!isOpen) {
      stopSynth();
      stopListening();
    }
  }, [isOpen, stopSynth, stopListening]);

  if (!isOpen) return null;

  const handleToggleMic = () => {
    synth.stop();
    if (speech.isListening) {
      speech.stopListening();
      if (speech.transcript?.trim()) {
        handleSend(speech.transcript.trim(), true);
      } else if (inputQuery.trim()) {
        handleSend(inputQuery.trim(), true);
      }
    } else {
      speech.startListening();
    }
  };

  const handleActionClick = (action) => {
    if (action.query) {
      handleSend(action.query);
      return;
    }
    if (action.isAction && onOpenPOModal) {
      onClose();
      onOpenPOModal();
      return;
    }
    if (action.isPOS) {
      onClose();
      window.dispatchEvent(new CustomEvent('open-record-sale-modal'));
      return;
    }
    if (action.route) {
      onClose();
      router.push(action.route);
    }
  };

  const themeColors = {
    ADMIN: {
      bg: 'bg-indigo-600',
      badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300',
      border: 'hover:border-indigo-400',
      btn: 'bg-indigo-600 hover:bg-indigo-700',
      title: 'RetailMind Enterprise AI',
      subtitle: 'Executive Predictive Copilot & BI Engine',
    },
    SELLER: {
      bg: 'bg-purple-600',
      badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300',
      border: 'hover:border-purple-400',
      btn: 'bg-purple-600 hover:bg-purple-700',
      title: 'RetailMind Seller Copilot',
      subtitle: 'Store Shift Performance & Quick Aisle Assistant',
    },
    CUSTOMER: {
      bg: 'bg-emerald-600',
      badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
      border: 'hover:border-emerald-400',
      btn: 'bg-emerald-600 hover:bg-emerald-700',
      title: 'RetailMind AI Grocer',
      subtitle: 'Personal Shopping Assistant, Recipes & Deals',
    },
  };

  const currentTheme = themeColors[currentRole] || themeColors.ADMIN;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Slide-over Drawer */}
      <div className="relative w-full max-w-lg h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-10 flex flex-col justify-between text-slate-900 dark:text-slate-100 animate-fade-in">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-2xl ${currentTheme.bg} text-white shadow-md`}>
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {currentTheme.title}
                </h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${currentTheme.badge}`}>
                  {currentRole}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {currentTheme.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {synth.isSupported && (
              <button
                type="button"
                onClick={() => {
                  if (synth.isSpeaking) synth.stop();
                  setAutoVoiceResponse(!autoVoiceResponse);
                }}
                title={
                  autoVoiceResponse
                    ? 'Voice output enabled (Click to mute auto-read)'
                    : 'Voice output muted (Click to enable auto-read)'
                }
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  autoVoiceResponse
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {autoVoiceResponse ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Log */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? `${currentTheme.bg} text-white rounded-br-none shadow-sm`
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-slate-700'
                }`}
              >
                {msg.sender === 'ai' && (
                  <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {currentTheme.title}
                    </span>
                    {synth.isSupported && (
                      <button
                        type="button"
                        onClick={() => synth.speak(msg.text, msg.id)}
                        title={synth.currentlyPlayingId === msg.id ? 'Stop reading aloud' : 'Read response aloud'}
                        className={`p-1 rounded-lg transition-colors cursor-pointer ${
                          synth.currentlyPlayingId === msg.id
                            ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 font-bold'
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {synth.currentlyPlayingId === msg.id ? (
                          <VolumeX className="w-3.5 h-3.5" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                )}
                <div className="whitespace-pre-line prose dark:prose-invert prose-sm">
                  {msg.text}
                </div>

                {/* AI Action Chips */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-1.5">
                    {msg.actions.map((act, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => handleActionClick(act)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-slate-400 transition-colors shadow-2xs cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>{act.label}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 p-2">
              <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
              <span>Analyzing query...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompt Pills */}
        <div className="px-4 py-2 bg-slate-50/70 dark:bg-slate-950/40 border-t border-slate-200 dark:border-slate-800 overflow-x-auto whitespace-nowrap">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Suggested:
            </span>
            {prompts.slice(0, 3).map((prompt, pIdx) => (
              <button
                key={pIdx}
                onClick={() => handleSend(prompt)}
                className={`px-2.5 py-1 rounded-full text-xs bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 ${currentTheme.border} transition-colors cursor-pointer`}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Live speech recognition status indicator */}
        {speech.isListening && (
          <div className="px-4 py-2 bg-rose-500/10 border-t border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-bold text-[11px] uppercase tracking-wider text-rose-500">
                  Listening...
                </p>
                <p className="text-xs text-slate-700 dark:text-slate-300 truncate font-normal">
                  {speech.interimTranscript ? `"${speech.interimTranscript}"` : 'Speak your question now...'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                speech.stopListening();
                if (speech.interimTranscript?.trim() || speech.transcript?.trim()) {
                  handleSend(speech.transcript || speech.interimTranscript, true);
                }
              }}
              className="px-2.5 py-1 rounded-lg bg-rose-500 text-white text-xs font-bold shadow-xs hover:bg-rose-600 transition-colors cursor-pointer flex-shrink-0 ml-2"
            >
              Done
            </button>
          </div>
        )}

        {/* Speech Recognition Error Banner */}
        {speech.error && !speech.isListening && (
          <div className="px-4 py-2 bg-amber-500/10 border-t border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-center justify-between animate-fade-in">
            <span className="text-[11px] leading-tight">{speech.error}</span>
            <button
              type="button"
              onClick={speech.resetState}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={
                speech.isListening
                  ? 'Listening to speech...'
                  : currentRole === ROLES.CUSTOMER
                  ? 'Ask AI Grocer for recipes, deals, or grocery ideas...'
                  : currentRole === ROLES.SELLER
                  ? 'Ask about shift sales, low stock items, best sellers...'
                  : 'Ask about sales anomalies, reorder POs, store performance...'
              }
              className="flex-1 px-3.5 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
            {/* Speech-To-Text Microphone Button */}
            <button
              type="button"
              onClick={handleToggleMic}
              title={
                !speech.isSupported
                  ? 'Speech recognition not supported in browser'
                  : speech.isListening
                  ? '🔴 Listening... Click to stop or finish'
                  : '🎙️ Speak your question'
              }
              className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                speech.isListening
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30 animate-pulse ring-2 ring-rose-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>

            <button
              type="submit"
              disabled={!inputQuery.trim() || isTyping}
              className={`p-2.5 rounded-xl ${currentTheme.btn} disabled:opacity-40 text-white transition-colors cursor-pointer shadow-sm`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
