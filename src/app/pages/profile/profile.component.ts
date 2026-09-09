import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, ToyService } from '../../services/app.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  availableTypes: any[] = [];

  constructor(
    private authService: AuthService,
    private toyService: ToyService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.toyService.getTypes().subscribe((types) => {
      this.availableTypes = types;
    });
  }

  toggleFavorite(typeId: string): void {
    if (!this.user) return;
    const index = this.user.favoriteTypes.indexOf(typeId);
    if (index > -1) {
      this.user.favoriteTypes.splice(index, 1);
    } else {
      this.user.favoriteTypes.push(typeId);
    }
  }

  saveChanges(): void {
    if (this.user) {
      this.authService.updateCurrentUser(this.user);
      alert('Profil uspešno ažuriran!');
    }
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
