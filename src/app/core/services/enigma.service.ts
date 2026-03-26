import { afterNextRender, effect, Injectable, signal } from '@angular/core';

export interface Enigma {
  id: number;
  letter: string;
  question: string;
  type: 'riddle' | 'math' | 'pattern' | 'visual' | 'trivia' | 'enigma';
  answer: string; // The correct answer (case-insensitive)
  hint?: string;
  image?: string; // For visual enigmas with hidden text/objects
  audio?: string; // For enigmas with audio clues
}

@Injectable({
  providedIn: 'root'
})
export class EnigmaService {
  private enigmas: Enigma[] = [
    {
      id: 1,
      letter: 'E',
      type: 'riddle',
      question: 'Sou um espelho quee na maioria da vezes só mostro o que deseja ver, as vezes mostro a verdade, mas nem sempre é o que você quer. O que sou?',
      answer: 'tela',
      hint: 'KKKK, achou mesmo que teria dica?'
    },
    {
      id: 2,
      letter: 'U',
      type: 'math',
      question: 'Japones dos 400 metros nasceu, 2023 foi prata',
      answer: '1996',
      hint: 'É só o primeiro, se ficar muito tempo parado me manda mensagem, mas sei que consegue.'
    },
    {
      id: 3,
      letter: 'T',
      type: 'enigma',
      question: '08:42 - 02:50',
      answer: 'free',
      hint: 'kkkkkkk, desiste, não tem dica, é só pra te trollar mesmo',
      image: '/assets/images/enigma3.jpg'
    },
    {
      id: 4,
      letter: 'E',
      type: 'enigma',
      question: 'Propriedades',
      answer: 'alger',
      hint: 'Eu te amo muito namorada, mas naum tem dica não.',
      image: '/assets/images/NatalMichigan.jpg'
    },
    {
      id: 5,
      letter: 'A',
      type: 'riddle',
      question: 'espectograma 5 | 5',
      answer: 'alexandre',
      hint: 'you',
      audio: '/assets/audio/jarro.mp3'
    },
    {
      id: 6,
      letter: 'M',
      type: 'math',
      question: '40°29′N 20°11′E',
      answer: '661',
      hint: '...',
      image: '/assets/images/brilho.png'
    },
    {
      id: 7,
      letter: 'O',
      type: 'riddle',
      question: 'what thumb?',
      answer: 'hitchhiker',
      hint: 'tu',
      image: '/assets/images/gift.png'
    },
    {
      id: 8,
      letter: 'M',
      type: 'pattern',
      question: '...- .- .-.. --- .-. .- -. -',
      answer: 'china',
      hint: 'be',
      audio: '/assets/audio/lightspeed.mp3'
    },
    {
      id: 9,
      letter: 'U',
      type: 'trivia',
      question: `primeiro iPhone
Steve Jobs
video
ano`,
      answer: '2023',
      hint: 'https://www.youtube.com/shorts/iys1AhuUheI'
    },
    {
      id: 10,
      letter: 'I',
      type: 'riddle',
      question: 'O que tem mãos mas não pode bater palmas?',
      answer: 'relógio',
      hint: 'não, sem dica ainda'
    },
    {
      id: 11,
      letter: 'T',
      type: 'trivia',
      question: 'Lugar que eu te pedi em namoro?',
      answer: 'igarata',
      hint: '5, 7, 8, dicas.'
    }
  ];

  private solvedEnigmas = signal<number[]>([]);
  private readonly isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

  constructor() {
    // 1. CARREGAMENTO: Só executa no Navegador, após o SSR
    afterNextRender(() => {
      const saved = localStorage.getItem('solvedEnigmas');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            this.solvedEnigmas.set(parsed);
            console.log('Cache recuperado no navegador:', parsed);
          }
        } catch (e) {
          console.warn('Erro ao carregar cache:', e);
        }
      }
    });

    // 2. SALVAMENTO AUTOMÁTICO: Sempre que o Signal mudar, ele salva no cache
    effect(() => {
      const current = this.solvedEnigmas();
      if (typeof window !== 'undefined') {
        if (current.length > 0) {
          localStorage.setItem('solvedEnigmas', JSON.stringify(current));
        } else {
          localStorage.setItem('solvedEnigmas', localStorage.getItem('solvedEnigmasAuxi') || '');
        }
        localStorage.setItem('solvedEnigmasAuxi', localStorage.getItem('solvedEnigmas') || '');
      }
    });
  }

  getEnigmas() {
    return this.enigmas;
  }

  getEnigmaById(id: number): Enigma | undefined {
    return this.enigmas.find(e => e.id === id);
  }

  private normalizeText(text: string): string {
    return text
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .trim();
  }

  checkAnswer(enigmaId: number, userAnswer: string): boolean {
    const enigma = this.getEnigmaById(enigmaId);
    if (!enigma) return false;

    const normalizedUserAnswer = this.normalizeText(userAnswer);
    const normalizedCorrectAnswer = this.normalizeText(enigma.answer);
    const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;

    if (isCorrect && !this.solvedEnigmas().includes(enigmaId)) {
      this.solvedEnigmas.update(solved => [...solved, enigmaId]);
    }

    return isCorrect;
  }

  isSolved(enigmaId: number): boolean {
    this.getSolvedEnigmas();
    return this.solvedEnigmas().includes(enigmaId);
  }

  getSolvedEnigmas() {
    if (typeof window !== 'undefined') {
      let solvedAux = localStorage.getItem('solvedEnigmas');
      if (solvedAux) {
        this.solvedEnigmas.set(solvedAux ? JSON.parse(solvedAux) : []);
        return JSON.parse(solvedAux || '[]');
      }
    }
    return this.solvedEnigmas();
  }

  getAllSolved(): boolean {
    return this.solvedEnigmas().length === this.enigmas.length;
  }

  getFinalMessage(): string {
    // Build the final message from solved enigma letters in order
    const message = this.enigmas
      .filter(e => this.solvedEnigmas().includes(e.id))
      .map(e => e.letter)
      .join('');
    return message;
  }

  getFinalYouTubeCode(): string {
    // This will be generated from the final message.
    return this.getFinalMessage();
  }

  resetProgress() {
    this.solvedEnigmas.set([]);
    if (this.isBrowser) {
      localStorage.removeItem('solvedEnigmas');
    }
  }
}
