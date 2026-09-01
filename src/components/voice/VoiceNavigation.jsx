'use client';

import React from 'react';
import { useVoiceNavigation } from '@/hooks/useVoiceNavigation';
import { VoiceButton } from './VoiceButton';
import { VoiceStatus } from './VoiceStatus';

export function VoiceNavigation({ onOpenAIAssistant, onOpenCartDrawer, className = '' }) {
  const {
    isListening,
    isSupported,
    interimTranscript,
    feedback,
    clearFeedback,
    toggleVoiceNavigation,
  } = useVoiceNavigation({
    onOpenAIAssistant,
    onOpenCartDrawer,
  });

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <VoiceButton
        isListening={isListening}
        isSupported={isSupported}
        onClick={toggleVoiceNavigation}
      />

      <VoiceStatus
        feedback={feedback}
        onClose={clearFeedback}
        isListening={isListening}
        interimTranscript={interimTranscript}
      />
    </div>
  );
}
