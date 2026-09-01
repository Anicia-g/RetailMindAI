'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useSpeechRecognition Hook
 * React wrapper for the browser's Web Speech Recognition API
 */
export function useSpeechRecognition({ onResult, onEnd, onError, language = 'en-US' } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle' | 'listening' | 'processing' | 'success' | 'error' | 'unsupported'

  const recognitionRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSupported(true);
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = false;
          recognition.interimResults = true;
          recognition.lang = language;

          recognition.onstart = () => {
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
              if (onResult) {
                onResult(currentFinal);
              }
            }
          };

          recognition.onerror = (event) => {
            let errorMsg = 'Speech recognition error.';
            if (event.error === 'not-allowed' || event.error === 'permission-denied') {
              errorMsg = 'Microphone permission was denied. Please allow microphone access in your browser settings.';
            } else if (event.error === 'no-speech') {
              errorMsg = 'No speech detected. Please try speaking again.';
            } else if (event.error === 'network') {
              errorMsg = 'Network error during speech recognition.';
            }

            setError(errorMsg);
            setStatus('error');
            setIsListening(false);
            if (onError) onError(errorMsg, event.error);
          };

          recognition.onend = () => {
            setIsListening(false);
            if (onEnd) onEnd();
          };

          recognitionRef.current = recognition;
        } catch (e) {
          console.warn('SpeechRecognition initialization error:', e);
          setIsSupported(false);
          setStatus('unsupported');
        }
      } else {
        setIsSupported(false);
        setStatus('unsupported');
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, [language, onResult, onEnd, onError]);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      const unsupportedMsg = 'Voice recognition is not supported in this browser. Please use Chrome, Edge, or Safari.';
      setError(unsupportedMsg);
      setStatus('unsupported');
      return;
    }

    setError(null);
    setTranscript('');
    setInterimTranscript('');
    try {
      recognitionRef.current.start();
    } catch (err) {
      // If already started, restart
      try {
        recognitionRef.current.stop();
        setTimeout(() => {
          recognitionRef.current?.start();
        }, 100);
      } catch (e) {
        console.warn('Unable to restart speech recognition:', e);
      }
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
  }, [isListening]);

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
