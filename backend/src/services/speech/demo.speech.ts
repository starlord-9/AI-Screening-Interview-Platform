import { SpeechProvider, TranscriptionResult } from './speech.interface';
import { logger } from '../../utils/logger';

export class DemoSpeechProvider implements SpeechProvider {
  async transcribeAudio(audioFilePath: string): Promise<TranscriptionResult> {
    logger.info('DemoSpeechProvider: generating transcription for file', { audioFilePath });

    return {
      fullText:
        'In my previous role at CloudScale Solutions, I led the transition from classic Angular component architectures to standalone components and Angular Signals. This significantly streamlined our change detection cycles and prevented subscription memory leaks. For our Node.js microservices, we standardized on Express and Zod validation layers with strict rate limiting and defensive error boundaries.',
      segments: [
        {
          text: 'In my previous role at CloudScale Solutions, I led the transition from classic Angular component architectures...',
          startMs: 0,
          endMs: 8200,
          confidence: 0.95
        },
        {
          text: '...to standalone components and Angular Signals. This significantly streamlined our change detection cycles...',
          startMs: 8400,
          endMs: 16500,
          confidence: 0.93
        },
        {
          text: '...and prevented subscription memory leaks. For our Node.js microservices, we standardized on Express and Zod...',
          startMs: 16800,
          endMs: 25000,
          confidence: 0.96
        },
        {
          text: '...validation layers with strict rate limiting and defensive error boundaries.',
          startMs: 25200,
          endMs: 32000,
          confidence: 0.94
        }
      ],
      confidence: 0.945,
      language: 'en-US'
    };
  }

  async synthesizeSpeech(text: string): Promise<Buffer | null> {
    logger.info('DemoSpeechProvider: synthesizeSpeech placeholder', { textLength: text.length });
    return null;
  }
}
