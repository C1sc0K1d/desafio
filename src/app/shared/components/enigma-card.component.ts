import { Component, input, output, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Enigma } from '../../core/services/enigma.service';

@Component({
  selector: 'app-enigma-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './enigma-card.component.html',
  styleUrl: './enigma-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EnigmaCardComponent {
  enigma = input.required<Enigma>();
  isSolved = input.required<boolean>();
  onAnswerSubmit = output<{ enigmaId: number; answer: string }>();

  userAnswer = '';
  showHint = signal(false);
  showError = signal(false);
  isSubmitting = signal(false);

  submitAnswer() {
    if (!this.userAnswer) return;

    this.isSubmitting.set(true);
    this.showError.set(false);

    // Simulate a small delay for better UX
    setTimeout(() => {
      this.onAnswerSubmit.emit({
        enigmaId: this.enigma().id,
        answer: this.userAnswer
      });

      this.isSubmitting.set(false);
    }, 300);
  }

  toggleHint() {
    this.showHint.update((v: boolean) => !v);
  }
}
