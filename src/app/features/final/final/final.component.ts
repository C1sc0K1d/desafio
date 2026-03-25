import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EnigmaService } from '../../../core/services/enigma.service';

@Component({
  selector: 'app-final',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './final.component.html',
  styleUrl: './final.component.scss'
})
export class FinalComponent {
  private enigmaService = inject(EnigmaService);
  private router = inject(Router);

  youtubeCode = this.enigmaService.getFinalYouTubeCode();

  constructor() {
    if (!this.enigmaService.getAllSolved()) {
      const nextAllowed = this.enigmaService.getSolvedEnigmas().length + 1;
      this.router.navigate(['/enigma', nextAllowed]);
    }
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.youtubeCode);
    alert('Código copiado para a área de transferência!');
  }
}
