'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSpeechRecognition } from './useSpeechRecognition';
import { voiceNavigationService } from '@/services/voiceNavigationService';

/**
 * useVoiceNavigation Hook
 * Integrates speech recognition with role-safe voice navigation.
 */
export function useVoiceNavigation({ onOpenAIAssistant, onOpenCartDrawer } = {}) {
  const router = useRouter();
  const { role } = useAuth();

  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'warning' | 'error' | 'info', title: string, message: string }
  const [feedbackTimer, setFeedbackTimer] = useState(null);

  const clearFeedback = useCallback(() => {
    setFeedback(null);
  }, []);

  const showFeedback = useCallback((fb, duration = 4000) => {
    setFeedback(fb);
    if (feedbackTimer) clearTimeout(feedbackTimer);
    const timer = setTimeout(() => {
      setFeedback(null);
    }, duration);
    setFeedbackTimer(timer);
  }, [feedbackTimer]);

  const handleSpeechResult = useCallback(
    (finalSpeech) => {
      if (!finalSpeech || !finalSpeech.trim()) return;

      const result = voiceNavigationService.processVoiceCommand(finalSpeech, role);

      if (result.success) {
        showFeedback({
          type: 'success',
          title: result.title,
          message: `Heard: "${finalSpeech}" → ${result.message}`,
          intent: result.intent,
        });

        // Handle special action routes vs page navigation
        if (result.isAction) {
          if (result.actionType === 'OPEN_AI_ASSISTANT') {
            if (onOpenAIAssistant) {
              onOpenAIAssistant();
            } else {
              window.dispatchEvent(new CustomEvent('open-ai-assistant-drawer'));
            }
            return;
          }

          if (result.actionType === 'OPEN_CART') {
            if (onOpenCartDrawer) {
              onOpenCartDrawer();
            } else {
              router.push('/shop/cart');
            }
            return;
          }
        }

        if (result.route) {
          setTimeout(() => {
            router.push(result.route);
          }, 350);
        }
      } else {
        showFeedback({
          type: result.status === 'unauthorized' ? 'warning' : 'error',
          title: result.status === 'unauthorized' ? 'Permission Restricted' : 'Command Not Understood',
          message: result.message,
          intent: result.intent,
        }, 5000);
      }
    },
    [role, router, showFeedback, onOpenAIAssistant, onOpenCartDrawer]
  );

  const speech = useSpeechRecognition({
    onResult: handleSpeechResult,
    onError: (errorMsg) => {
      showFeedback({
        type: 'error',
        title: 'Microphone Issue',
        message: errorMsg,
      }, 5000);
    },
  });

  const toggleVoiceNavigation = useCallback(() => {
    if (speech.isListening) {
      speech.stopListening();
    } else {
      speech.startListening();
      showFeedback({
        type: 'info',
        title: 'Listening...',
        message: 'Speak a command like "Open inventory", "Show sales", or "Show offers"',
      }, 3000);
    }
  }, [speech, showFeedback]);

  return {
    isListening: speech.isListening,
    transcript: speech.transcript,
    interimTranscript: speech.interimTranscript,
    isSupported: speech.isSupported,
    status: speech.status,
    feedback,
    clearFeedback,
    toggleVoiceNavigation,
    startListening: speech.startListening,
    stopListening: speech.stopListening,
  };
}
