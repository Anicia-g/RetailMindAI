'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
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
  const timerRef = useRef(null);

  const clearFeedback = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setFeedback(null);
  }, []);

  const showFeedback = useCallback((fb, duration = 4500) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setFeedback(fb);
    timerRef.current = setTimeout(() => {
      setFeedback(null);
    }, duration);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

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
        }, 3500);

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

  const handleSpeechError = useCallback(
    (errorMsg, rawCode) => {
      // Differentiate user guidance based on error code
      if (rawCode === 'aborted') {
        return; // Normal cancellation, do not alert user
      }

      if (rawCode === 'no-speech') {
        showFeedback({
          type: 'info',
          title: 'No Speech Detected',
          message: 'Click the microphone button and speak a command like "Open inventory" or "Show sales".',
        }, 3500);
        return;
      }

      if (rawCode === 'not-allowed' || rawCode === 'permission-denied') {
        showFeedback({
          type: 'warning',
          title: 'Microphone Permission Needed',
          message: 'Microphone access is blocked. Please allow microphone permissions in your browser address bar or settings.',
          code: 'not-allowed',
        }, 6000);
        return;
      }

      if (rawCode === 'service-not-allowed') {
        showFeedback({
          type: 'warning',
          title: 'Speech Service Notice',
          message: 'Speech recognition service is unavailable. If using Safari on macOS, enable Siri/Dictation in System Settings, or try Chrome.',
          code: 'service-not-allowed',
        }, 6000);
        return;
      }

      showFeedback({
        type: 'error',
        title: 'Voice Recognition Notice',
        message: errorMsg,
      }, 4500);
    },
    [showFeedback]
  );

  const speech = useSpeechRecognition({
    onResult: handleSpeechResult,
    onError: handleSpeechError,
  });

  const toggleVoiceNavigation = useCallback(() => {
    if (speech.isListening) {
      speech.stopListening();
      clearFeedback();
    } else {
      speech.startListening();
      showFeedback({
        type: 'info',
        title: 'Listening for Command...',
        message: 'Speak a command (e.g. "Open inventory", "Show sales", "Show offers", "Ask AI")',
      }, 3000);
    }
  }, [speech, showFeedback, clearFeedback]);

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
