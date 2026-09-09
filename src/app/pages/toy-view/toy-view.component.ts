import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  ToyService,
  AuthService,
  CartService,
} from '../../services/app.service';
import { Toy } from '../../models/toy.model';

@Component({
  selector: 'app-toy-view',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './toy-view.component.html',
  styleUrl: './toy-view.component.css',
})
export class ToyViewComponent implements OnInit {
  toy: Toy | null = null;
  searchTerm: string = '';
  isAddedToCart: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toyService: ToyService,
    private cartService: CartService,
    public authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadToyDetails();
  }

  private loadToyDetails(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.toyService.getToyById(id).subscribe({
        next: (data: Toy) => (this.toy = data),
        error: (err) => console.error('Greška pri učitavanju igračke:', err),
      });
    }
  }

  get filteredReviews() {
    if (!this.toy?.reviews) return [];

    const query = this.searchTerm.trim().toLowerCase();
    if (!query) return this.toy.reviews;

    return this.toy.reviews.filter(
      (review) =>
        review.comment.toLowerCase().includes(query) ||
        review.user.toLowerCase().includes(query),
    );
  }

  clearSearch(): void {
    this.searchTerm = '';
  }

  onReserve(): void {
    if (!this.authService.isLoggedIn()) {
      alert('Morate biti ulogovani da biste rezervisali igračku!');
      this.router.navigate(['/login']);
      return;
    }

    if (this.toy) {
      this.cartService.addToCart(this.toy);
      this.triggerCartAnimation();
    }
  }

  private triggerCartAnimation(): void {
    this.isAddedToCart = true;
    setTimeout(() => {
      this.isAddedToCart = false;
    }, 2000);
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
