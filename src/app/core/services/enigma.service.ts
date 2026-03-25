import { afterNextRender, effect, Injectable, signal } from '@angular/core';

export interface Enigma {
  id: number;
  letter: string;
  question: string;
  type: 'riddle' | 'math' | 'pattern' | 'visual' | 'trivia' | 'enigma';
  answer: string; // The correct answer (case-insensitive)
  hint?: string;
  image?: string; // For visual enigmas with hidden text/objects
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
      question: 'Sou um espelho e na maioria da vezes só mostro o que deseja ver, as vezes mostro a verdade, mas nem sempre é o que você quer. O que sou?',
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
      type: 'riddle',
      question: 'Estou sempre com fome e preciso ser alimentado, mas se você me der água, morrerei. O que sou?',
      answer: 'fogo',
      hint: 'NUM TEM'
    },
    {
      id: 4,
      letter: 'E',
      type: 'pattern',
      question: 'Complete o padrão: A, B, C, E, F, G, I, J, K, ?',
      answer: 'M',
      hint: 'Qual letra vem depois de cada grupo?'
    },
    {
      id: 5,
      letter: 'A',
      type: 'riddle',
      question: 'Tenho cidades, mas não casas. Tenho montanhas, mas não árvores. Tenho água, mas não peixes. O que sou?',
      answer: 'mapa',
      hint: 'Ajuda você a navegar'
    },
    {
      id: 6,
      letter: 'M',
      type: 'math',
      question: 'Se um caderno custa R$5 e uma caneta custa R$3, quanto custam 2 cadernos e 4 canetas?',
      answer: '22',
      hint: 'Faça a matemática passo a passo'
    },
    {
      id: 7,
      letter: 'O',
      type: 'riddle',
      question: 'Não estou vivo, mas cresço; não tenho pulmões, mas preciso de ar. O que sou?',
      answer: 'fogo',
      hint: 'Quente e tremeluzente'
    },
    {
      id: 8,
      letter: 'M',
      type: 'pattern',
      question: 'O que vem a seguir? 1, 1, 2, 3, 5, 8, 13, ?',
      answer: '21',
      hint: 'Famosa sequência matemática'
    },
    {
      id: 9,
      letter: 'U',
      type: 'trivia',
      question: 'Em que ano foi lançado o primeiro iPhone?',
      answer: '2007',
      hint: 'Jobs o apresentou'
    },
    {
      id: 10,
      letter: 'I',
      type: 'riddle',
      question: 'O que tem mãos mas não pode bater palmas?',
      answer: 'relógio',
      hint: 'Mede o tempo'
    },
    {
      id: 11,
      letter: 'T',
      type: 'math',
      question: 'Qual é a raiz quadrada de 144?',
      answer: '12',
      hint: 'Um número vezes ele mesmo é igual a 144'
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

  checkAnswer(enigmaId: number, userAnswer: string): boolean {
    const enigma = this.getEnigmaById(enigmaId);
    if (!enigma) return false;

    const isCorrect = userAnswer.toLowerCase().trim() === enigma.answer.toLowerCase();

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
