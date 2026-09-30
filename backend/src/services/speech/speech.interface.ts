export interface SpeechSegment {
  text: string;
  startMs: number;
  endMs: number;
  confidence: number;
}

export interface TranscriptionResult {
  fullText: string;
  segments: SpeechSegment[];
  confidence: number;
  language: string;
}

export interface SpeechProvider {
  transcribeAudio(audioFilePath: string): Promise<TranscriptionResult>;
  synthesizeSpeech(text: string): Promise<Buffer | null>;
}
