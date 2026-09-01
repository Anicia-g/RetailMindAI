'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Strips markdown symbols, asterisks, hashes, and links for clean speech audio synthesis
 */
export function cleanMarkdownForSpeech(mdText) {
  if (!mdText) return '';
  return mdText
    .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
    .replace(/\*(.*?)\*/g, '$1')     // Italic
    .replace(/__(.*?)__/g, '$1')     // Underline
    .replace(/#+\s+(.*)/g, '$1')     // Headers
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links
    .replace(/`{1,3}(.*?)`{1,3}/gs, '$1') // Inline & fenced code
    .replace(/^[\s*•-]+\s+/gm, '')    // Bullet points
    .replace(/₹/g, 'Rupees ')        // Currency pronunciation
    .replace(/%/g, ' percent')       // Percentage pronunciation
    .trim();
}

/**
 * useSpeechSynthesis Hook
 * Manages browser Text-To-Speech output
 */
export function useSpeechSynthesis() {
  const [isSupported, setIsSupported] = useState(false);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const utteranceRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
    }
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
    setCurrentlyPlayingId(null);
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(
    (text, messageId) => {
      if (!isSupported || !text) return;

      // If already speaking this message, toggle stop
      if (currentlyPlayingId === messageId && isSpeaking) {
        stop();
        return;
      }

      stop(); // Stop any other current speech

      try {
        const cleanText = cleanMarkdownForSpeech(text);
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.lang = 'en-US';

        utterance.onstart = () => {
          setCurrentlyPlayingId(messageId);
          setIsSpeaking(true);
        };

        utterance.onend = () => {
          setCurrentlyPlayingId(null);
          setIsSpeaking(false);
        };

        utterance.onerror = (e) => {
          console.warn('SpeechSynthesis error:', e);
          setCurrentlyPlayingId(null);
          setIsSpeaking(false);
        };

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error('Error starting SpeechSynthesis:', err);
        setCurrentlyPlayingId(null);
        setIsSpeaking(false);
      }
    },
    [isSupported, currentlyPlayingId, isSpeaking, stop]
  );

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    isSupported,
    isSpeaking,
    currentlyPlayingId,
    speak,
    stop,
  };
}
