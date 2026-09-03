'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  MessageSquare,
  Mic,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { useAppSettings } from '@/context/AppSettingsContext';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { sampleAIPrompts, getAIResponse } from '@/data/aiResponses';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

export default function AIAssistantPage() {
  const { t } = useAppSettings();
  const router = useRouter();

  const [messages, setMessages] = useState([
    {
      id: 'm-init',
      sender: 'ai',
      text: `Welcome to the **RetailMind AI Intelligence Center**.\n\nI continuously monitor real-time POS sales transactions, supply chain lead times, inventory health across all store outlets, and K-Means customer RFM clusters.\n\nSelect a recommended business diagnostic below, type any question, or speak into the microphone:`,
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
  const [autoVoiceResponse, setAutoVoiceResponse] = useState(true);

  const messagesEndRef = useRef(null);
  const synth = useSpeechSynthesis();

  // Scroll messages to bottom smoothly
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (queryToSend, isFromVoice = false) => {
    const text = queryToSend || inputValue;
    if (!text || !text.trim()) return;

    // Stop active audio
    synth.stop();

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      isVoice: isFromVoice,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const result = getAIResponse(text);
      const aiMsgId = `ai-${Date.now()}`;
      const aiMsg = {
        id: aiMsgId,
        sender: 'ai',
        text: result.response,
        actions: result.actions || [],
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);

      // Auto-speak response if triggered by voice and audio enabled
      if (isFromVoice && autoVoiceResponse && synth.isSupported) {
        synth.speak(result.response, aiMsgId);
      }
    }, 500);
  };

  const speech = useSpeechRecognition({
    onResult: (spokenText) => {
      if (!spokenText || !spokenText.trim()) return;
      speech.stopListening();
      setInputValue('');
      handleSend(spokenText.trim(), true);
    },
    onError: (err) => {
      console.warn('AI Assistant voice recognition notice:', err);
    },
  });

  const handleToggleMic = () => {
    synth.stop();
    if (speech.isListening) {
      speech.stopListening();
      if (speech.transcript?.trim()) {
        handleSend(speech.transcript.trim(), true);
      } else if (inputValue.trim()) {
        handleSend(inputValue.trim(), true);
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

        {synth.isSupported && (
          <button
            type="button"
            onClick={() => {
              if (synth.isSpeaking) synth.stop();
              setAutoVoiceResponse(!autoVoiceResponse);
            }}
            title={
              autoVoiceResponse
                ? 'Voice output enabled (Click to mute)'
                : 'Voice output muted (Click to enable)'
            }
            className={`self-start sm:self-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              autoVoiceResponse
                ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-white/10 text-slate-300 border-white/15 hover:bg-white/20'
            }`}
          >
            {autoVoiceResponse ? (
              <>
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span>Voice Auto-Read: ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-slate-400" />
                <span>Voice Auto-Read: MUTED</span>
              </>
            )}
          </button>
        )}
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
                {msg.sender === 'ai' && (
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      RetailMind AI
                    </span>
                    {synth.isSupported && (
                      <button
                        type="button"
                        onClick={() => synth.speak(msg.text, msg.id)}
                        title={synth.currentlyPlayingId === msg.id ? 'Stop reading' : 'Read aloud'}
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
          <div ref={messagesEndRef} />
        </div>

        {/* Live speech recognition status banner */}
        {speech.isListening && (
          <div className="px-5 py-2.5 bg-rose-500/10 border-t border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-bold text-[11px] uppercase tracking-wider text-rose-500">
                  Listening to voice...
                </p>
                <p className="text-xs text-slate-700 dark:text-slate-300 truncate font-normal">
                  {speech.interimTranscript ? `"${speech.interimTranscript}"` : 'Speak your query clearly into your microphone...'}
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
              className="px-3 py-1 rounded-lg bg-rose-500 text-white text-xs font-bold shadow-xs hover:bg-rose-600 transition-colors cursor-pointer flex-shrink-0 ml-3"
            >
              Done
            </button>
          </div>
        )}

        {/* Speech Recognition Error Alert */}
        {speech.error && !speech.isListening && (
          <div className="px-5 py-2 bg-amber-500/10 border-t border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-center justify-between animate-fade-in">
            <span className="text-xs leading-tight">{speech.error}</span>
            <button
              type="button"
              onClick={speech.resetState}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

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
              placeholder={
                speech.isListening
                  ? 'Listening to microphone speech...'
                  : t('askAnything')
              }
              className="flex-1 px-4 py-3 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />

            {/* Microphone Button */}
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
              className={`p-3 rounded-xl transition-all cursor-pointer ${
                speech.isListening
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30 animate-pulse ring-2 ring-rose-300'
                  : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Mic className="w-5 h-5" />
            </button>

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

