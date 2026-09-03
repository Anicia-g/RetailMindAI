'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useSpeechRecognition Hook
 * Robust React wrapper for Web Speech Recognition API with Safari/Chrome/Edge support.
 * Handles microphone permissions, aborts gracefully, and suppresses false error toasts.
 */
export function useSpeechRecognition({ onResult, onEnd, onError, language = 'en-US' } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle' | 'listening' | 'processing' | 'success' | 'error' | 'unsupported'

  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const isManualStopRef = useRef(false);

  // Store callbacks in ref to avoid re-triggering useEffect on re-renders
  const callbacksRef = useRef({ onResult, onEnd, onError });
  useEffect(() => {
    callbacksRef.current = { onResult, onEnd, onError };
  }, [onResult, onEnd, onError]);

  // Check Web Speech API support on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSupported(true);
      } else {
        setIsSupported(false);
        setStatus('unsupported');
      }
    }
  }, []);

  // Initialize or reconfigure SpeechRecognition instance
  const initRecognition = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        isListeningRef.current = true;
        isManualStopRef.current = false;
        setIsListening(true);
        setError(null);
        setStatus('listening');
        setTranscript('');
        setInterimTranscript('');
      };

      recognition.onresult = (event) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            currentFinal += item[0].transcript;
          } else {
            currentInterim += item[0].transcript;
          }
        }

        if (currentInterim) {
          setInterimTranscript(currentInterim);
        }

        if (currentFinal) {
          setTranscript(currentFinal);
          setStatus('processing');
          if (callbacksRef.current.onResult) {
            callbacksRef.current.onResult(currentFinal);
          }
        }
      };

      recognition.onerror = (event) => {
        // 'aborted' happens on manual stop or abort - never treat as a user-facing error
        if (event.error === 'aborted' || isManualStopRef.current) {
          isListeningRef.current = false;
          setIsListening(false);
          setStatus('idle');
          return;
        }

        let errorMsg = 'Speech recognition error.';
        let isCritical = true;

        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          errorMsg = 'Microphone permission was denied. Please allow microphone access in your browser settings.';
        } else if (event.error === 'no-speech') {
          errorMsg = 'No speech detected. Please click the mic and try speaking again.';
          isCritical = false;
        } else if (event.error === 'service-not-allowed') {
          errorMsg = 'Speech service unavailable. On macOS/Safari, please ensure Dictation is enabled in System Settings.';
        } else if (event.error === 'audio-capture') {
          errorMsg = 'No microphone found. Please ensure your microphone is plugged in and working.';
        } else if (event.error === 'network') {
          errorMsg = 'Network error during speech recognition. Please check your internet connection.';
        } else if (event.error === 'language-not-supported') {
          errorMsg = `Speech recognition is not supported for language "${language}".`;
        }

        isListeningRef.current = false;
        setIsListening(false);
        setError(errorMsg);
        setStatus(isCritical ? 'error' : 'idle');

        if (callbacksRef.current.onError) {
          callbacksRef.current.onError(errorMsg, event.error);
        }
      };

      recognition.onend = () => {
        isListeningRef.current = false;
        setIsListening(false);
        setStatus((prev) => (prev === 'error' ? prev : 'idle'));
        if (callbacksRef.current.onEnd) {
          callbacksRef.current.onEnd();
        }
      };

      return recognition;
    } catch (e) {
      console.warn('SpeechRecognition initialization error:', e);
      return null;
    }
  }, [language]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          isManualStopRef.current = true;
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, []);

  const startListening = useCallback(async () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      const unsupportedMsg = 'Voice recognition is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Apple Safari.';
      setError(unsupportedMsg);
      setStatus('unsupported');
      if (callbacksRef.current.onError) {
        callbacksRef.current.onError(unsupportedMsg, 'not-supported');
      }
      return;
    }

    // If currently listening, abort previous first
    if (recognitionRef.current && isListeningRef.current) {
      try {
        isManualStopRef.current = true;
        recognitionRef.current.abort();
      } catch (e) {}
    }

    setError(null);
    setTranscript('');
    setInterimTranscript('');

    // Optional microphone permission warm-up for Safari/WebKit
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Immediately release tracks so recognition instance can use the microphone
        stream.getTracks().forEach((track) => track.stop());
      } catch (permErr) {
        if (permErr.name === 'NotAllowedError' || permErr.name === 'PermissionDeniedError') {
          const permMsg = 'Microphone permission was denied. Please allow microphone access in your browser settings.';
          setError(permMsg);
          setStatus('error');
          if (callbacksRef.current.onError) {
            callbacksRef.current.onError(permMsg, 'not-allowed');
          }
          return;
        }
      }
    }

    try {
      const instance = initRecognition();
      if (!instance) return;
      recognitionRef.current = instance;
      instance.start();
    } catch (err) {
      if (err.name === 'InvalidStateError') {
        // Recognition already started, attempt clean restart
        try {
          isManualStopRef.current = true;
          recognitionRef.current?.abort();
          setTimeout(() => {
            const instance = initRecognition();
            if (instance) {
              recognitionRef.current = instance;
              instance.start();
            }
          }, 150);
        } catch (e) {
          console.warn('Unable to restart speech recognition:', e);
        }
      } else {
        console.warn('Speech recognition start failed:', err);
      }
    }
  }, [initRecognition]);

  const stopListening = useCallback(() => {
    isManualStopRef.current = true;
    if (recognitionRef.current && isListeningRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        try {
          recognitionRef.current.abort();
        } catch (abErr) {}
      }
    }
    isListeningRef.current = false;
    setIsListening(false);
    setStatus('idle');
  }, []);

  const resetState = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
    setStatus('idle');
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    status,
    setStatus,
    startListening,
    stopListening,
    resetState,
  };
}
