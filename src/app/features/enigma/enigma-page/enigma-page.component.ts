import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EnigmaService } from '../../../core/services/enigma.service';

@Component({
  selector: 'app-enigma-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './enigma-page.component.html',
  styleUrl: './enigma-page.component.scss'
})
export class EnigmaPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private enigmaService = inject(EnigmaService);

  userAnswer = '';
  showHint = signal(false);
  feedback = '';
  isCorrect = false;

  enigma = signal<any>(null);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const rawId = params.get('id');
      console.log('Raw ID from URL:', rawId);

      const id = rawId ? Number(rawId) : NaN;
      console.log('Parsed ID:', id);

      if (Number.isNaN(id)) {
        console.log('ID is NaN, redirecting to enigma 1');
        this.router.navigate(['/enigma', 1], { replaceUrl: true });
        return;
      }
      if (typeof window !== 'undefined') {
        let solvedEnigmas = this.enigmaService.getSolvedEnigmas();
        console.log('Solved enigmas:', solvedEnigmas);

        let solvedCount = solvedEnigmas.length;
        let nextAllowed = solvedCount + 1;
        console.log('Next allowed:', nextAllowed);

        // Se ID é inválido, vai para o primeiro
        if (id < 1 || id > 11) {
          const lastSolvedId = solvedEnigmas.length > 0 ? Math.max(...solvedEnigmas) : solvedEnigmas.length == 12 ? Math.max(...solvedEnigmas) : 1;
          console.log('Redirecting to last solved or allowed:', lastSolvedId);
          this.router.navigate(['/enigma', lastSolvedId], { replaceUrl: true });
          return;
        }

        // Se o enigma já foi resolvido, permite acesso
        if (this.enigmaService.isSolved(id)) {
          console.log('Enigma', id, 'already solved, allowing access');
          const enigma = this.enigmaService.getEnigmaById(id);
          if (enigma) {
            this.enigma.set(enigma);
            this.resetEnigmaState();
            return;
          }
        }

        // Se todos os enigmas foram resolvidos, vai para final
        if (this.enigmaService.getAllSolved()) {
          console.log('All solved, going to final');
          this.router.navigate(['/final']);
          return;
        }

        // Se não foi resolvido, só permite se for o próximo na sequência
        if (id === nextAllowed) {
          console.log('Enigma', id, 'is next allowed, allowing access');
          const enigma = this.enigmaService.getEnigmaById(id);
          if (enigma) {
            this.enigma.set(enigma);
            this.resetEnigmaState();
            return;
          }
        }

        // Caso contrário, redireciona para o último enigma resolvido ou para o próximo permitido
        const lastSolvedId = solvedEnigmas.length > 0 ? Math.max(...solvedEnigmas) : solvedEnigmas.length == 12 ? Math.max(...solvedEnigmas) : 1;
        console.log('Redirecting to last solved or allowed:', lastSolvedId);
        this.router.navigate(['/enigma', lastSolvedId + 1], { replaceUrl: true });
      }
    });
  }

  private resetEnigmaState() {
    this.userAnswer = '';
    this.feedback = '';
    this.isCorrect = false;
    this.showHint.set(false);
  }

  toggleHint() {
    this.showHint.set(!this.showHint());
  }

  onSubmit() {
    if (!this.enigma()) return;

    const correct = this.enigmaService.checkAnswer(this.enigma().id, this.userAnswer.trim());
    if (correct) {
      this.feedback = 'Correto! Indo para o próximo enigma...';
      this.isCorrect = true;

      const currentId = this.enigma().id;
      const total = this.enigmaService.getEnigmas().length;
      const nextId = currentId + 1;

      setTimeout(() => {
        if (nextId <= total) {
          this.router.navigate(['/enigma', nextId]);
        } else {
          this.router.navigate(['/final']);
        }
      }, 800);
    } else {
      this.feedback = 'Incorreto. Tente novamente!';
      this.isCorrect = false;
    }
  }
}
