import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {
  CartService,
  ToyService,
  AuthService,
} from '../../services/app.service';
import { CartItem } from '../../models/cart-item.model';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent implements OnInit {
  allItems: CartItem[] = [];
  filteredItems: CartItem[] = [];

  toyTypes: any[] = [];
  ageGroups: any[] = [];

  searchTerm: string = '';
  selectedType: string = '';
  selectedTarget: string = '';
  selectedAge: string = '';

  totalPrice: number = 0;

  showRateModal: boolean = false;
  selectedToyForRate: any = null;
  ratingValue: number = 5;
  reviewComment: string = '';

  constructor(
    private cartService: CartService,
    private toyService: ToyService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    forkJoin({
      types: this.toyService.getTypes().pipe(catchError(() => of([]))),
      ages: this.toyService.getAgeGroups().pipe(catchError(() => of([]))),
    }).subscribe((result) => {
      this.toyTypes = result.types;
      this.ageGroups = result.ages;
      this.loadCart();
    });
  }

  loadCart(): void {
    const cartData = this.cartService.getUserCart();

    if (!cartData || cartData.length === 0) {
      this.allItems = [];
      this.filteredItems = [];
      this.calculateTotal();
      return;
    }

    const activeItems = cartData.filter((item) => item.status !== 'ocenjeno');

    if (activeItems.length === 0) {
      this.allItems = [];
      this.filteredItems = [];
      this.calculateTotal();
      return;
    }

    const requests = activeItems.map((item) =>
      this.toyService.getToyById(item.toyId).pipe(catchError(() => of(null))),
    );

    forkJoin(requests).subscribe((toys) => {
      this.allItems = activeItems.map((item, index) => {
        const toyDetails: any = toys[index];

        if (toyDetails) {
          return {
            ...item,
            toyDescription: toyDetails.description || '',
            toyType: toyDetails.type?.typeId?.toString() || '',
            toyTarget: toyDetails.targetGroup || '',
            toyAge: toyDetails.ageGroup?.ageGroupId?.toString() || '',
          } as CartItem;
        }
        return item;
      });

      this.applyFilters();
    });
  }

  applyFilters(): void {
    this.filteredItems = this.allItems.filter((item) => {
      const search = this.searchTerm.toLowerCase();
      const matchesSearch =
        (item.toyName || '').toLowerCase().includes(search) ||
        (item.toyDescription || '').toLowerCase().includes(search);

      const matchesType = this.selectedType
        ? item.toyType === this.selectedType
        : true;
      const matchesTarget = this.selectedTarget
        ? item.toyTarget === this.selectedTarget
        : true;
      const matchesAge = this.selectedAge
        ? item.toyAge === this.selectedAge
        : true;

      return matchesSearch && matchesType && matchesTarget && matchesAge;
    });
    this.calculateTotal();
  }

  calculateTotal(): void {
    this.totalPrice = this.filteredItems.reduce(
      (sum, item) => sum + item.toyPrice,
      0,
    );
  }

  openRateModal(item: any): void {
    this.selectedToyForRate = item;
    this.showRateModal = true;
    this.ratingValue = 5;
    this.reviewComment = '';
  }

  submitReview(): void {
    if (this.selectedToyForRate) {
      const savedUser = localStorage.getItem('current_user');
      const user = JSON.parse(savedUser || '{}');

      this.toyService.saveReview({
        toyId: this.selectedToyForRate.toyId,
        rating: this.ratingValue,
        comment: this.reviewComment,
        user: user.firstName
          ? `${user.firstName} ${user.lastName}`
          : 'Anonimni korisnik',
      });

      this.changeStatus(this.selectedToyForRate.id, 'ocenjeno');
      this.showRateModal = false;
      alert('Recenzija je uspešno sačuvana!');
    }
  }

  removeItem(id: string): void {
    const items = JSON.parse(localStorage.getItem('toy_store_cart') || '[]');
    const updated = items.filter((item: any) => item.id !== id);
    localStorage.setItem('toy_store_cart', JSON.stringify(updated));
    this.loadCart();
  }

  changeStatus(id: string, status: string): void {
    const items = JSON.parse(localStorage.getItem('toy_store_cart') || '[]');
    const idx = items.findIndex((i: any) => i.id === id);
    if (idx !== -1) {
      items[idx].status = status;
      localStorage.setItem('toy_store_cart', JSON.stringify(items));
      this.loadCart();
    }
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
