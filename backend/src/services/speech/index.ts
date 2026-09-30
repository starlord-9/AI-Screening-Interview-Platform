import { SpeechProvider } from './speech.interface';
import { DemoSpeechProvider } from './demo.speech';

export const speechProvider: SpeechProvider = new DemoSpeechProvider();

export * from './speech.interface';
export * from './demo.speech';
