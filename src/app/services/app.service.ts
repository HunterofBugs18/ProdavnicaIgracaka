import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../models/user.model';
import { CartItem } from '../models/cart-item.model';
import { Toy, ToyType, AgeGroup } from '../models/toy.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly STORAGE_USERS = 'toy_store_users';
  private readonly STORAGE_CURRENT_USER = 'current_user';

  constructor() {}

  register(newUser: User): boolean {
    const existingUsers = this.getStoredUsers();

    const userExists = existingUsers.some((u) => u.email === newUser.email);
    if (userExists) {
      return false;
    }

    newUser.id = Math.random().toString(36).substring(2, 11);
    existingUsers.push(newUser);
    localStorage.setItem(this.STORAGE_USERS, JSON.stringify(existingUsers));

    return true;
  }

  login(email: string, pass: string): boolean {
    if (email === 'admin@gmail.com' && pass === 'admin123') {
      const adminAcc: User = {
        id: 'admin-001',
        firstName: 'Admin',
        lastName: 'Admin',
        email: 'admin@gmail.com',
        password: 'admin123',
        phone: '000',
        address: 'Admin Office',
        favoriteTypes: [],
      };
      localStorage.setItem(this.STORAGE_CURRENT_USER, JSON.stringify(adminAcc));
      return true;
    }

    const usersList = this.getStoredUsers();
    const found = usersList.find(
      (u) => u.email === email && u.password === pass,
    );

    if (found) {
      localStorage.setItem(this.STORAGE_CURRENT_USER, JSON.stringify(found));
      return true;
    }

    return false;
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_CURRENT_USER);
  }

  isLoggedIn(): boolean {
    return localStorage.getItem(this.STORAGE_CURRENT_USER) !== null;
  }

  getCurrentUser(): User | null {
    const data = localStorage.getItem(this.STORAGE_CURRENT_USER);
    return data ? JSON.parse(data) : null;
  }

  updateCurrentUser(updated: User): void {
    localStorage.setItem(this.STORAGE_CURRENT_USER, JSON.stringify(updated));

    const usersList = this.getStoredUsers();
    const index = usersList.findIndex((u) => u.id === updated.id);

    if (index !== -1) {
      usersList[index] = updated;
      localStorage.setItem(this.STORAGE_USERS, JSON.stringify(usersList));
    }
  }

  private getStoredUsers(): User[] {
    const rawData = localStorage.getItem(this.STORAGE_USERS);
    return rawData ? JSON.parse(rawData) : [];
  }
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly STORAGE_CART = 'toy_store_cart';

  constructor(private authService: AuthService) {}

  addToCart(toyItem: Toy): void {
    const activeUser = this.authService.getCurrentUser();
    if (!activeUser) return;

    const cartList = this.getRawCartItems();

    const newItem: CartItem = {
      id: Math.random().toString(36).substring(2, 11),
      userEmail: activeUser.email,
      toyId: toyItem.toyId,
      toyName: toyItem.name,
      toyPrice: toyItem.price,
      toyImage: toyItem.imageUrl,
      status: 'rezervisano',
      orderDate: new Date(),
    };

    cartList.push(newItem);
    localStorage.setItem(this.STORAGE_CART, JSON.stringify(cartList));
    alert('Igračka je uspešno dodata u korpu!');
  }

  getUserCart(): CartItem[] {
    const activeUser = this.authService.getCurrentUser();
    if (!activeUser) return [];

    const cartList = this.getRawCartItems();
    return cartList.filter((item) => item.userEmail === activeUser.email);
  }

  private getRawCartItems(): CartItem[] {
    const rawData = localStorage.getItem(this.STORAGE_CART);
    return rawData ? JSON.parse(rawData) : [];
  }
}

@Injectable({
  providedIn: 'root',
})
export class ToyService {
  private readonly apiBaseUrl = 'https://toy.pequla.com/api';

  constructor(private http: HttpClient) {}

  getAllToys(): Observable<Toy[]> {
    return this.http
      .get<Toy[]>(`${this.apiBaseUrl}/toy`)
      .pipe(
        map((toysList) => toysList.map((item) => this.attachToyDetails(item))),
      );
  }

  getToyById(id: number): Observable<Toy> {
    return this.http
      .get<Toy>(`${this.apiBaseUrl}/toy/${id}`)
      .pipe(map((item) => this.attachToyDetails(item)));
  }

  getTypes(): Observable<ToyType[]> {
    return this.http.get<ToyType[]>(`${this.apiBaseUrl}/type`);
  }

  getAgeGroups(): Observable<AgeGroup[]> {
    return this.http.get<AgeGroup[]>(`${this.apiBaseUrl}/age-group`);
  }

  getReviews(toyId: number): any[] {
    const allReviews = JSON.parse(localStorage.getItem('toy_reviews') || '[]');
    return allReviews.filter((r: any) => r.toyId === toyId);
  }

  saveReview(reviewData: {
    toyId: number;
    rating: number;
    comment: string;
    user: string;
  }): void {
    const allReviews = JSON.parse(localStorage.getItem('toy_reviews') || '[]');
    allReviews.push({
      ...reviewData,
      date: new Date().toISOString(),
    });
    localStorage.setItem('toy_reviews', JSON.stringify(allReviews));
  }

  calculateAverageRating(toyId: number): string {
    const reviews = this.getReviews(toyId);
    if (reviews.length === 0) return '0';

    const totalSum = reviews.reduce((sum, item) => sum + item.rating, 0);
    return (totalSum / reviews.length).toFixed(1);
  }

  private attachToyDetails(toy: Toy): Toy {
    return {
      ...toy,
      rating: Number(this.calculateAverageRating(toy.toyId)) || 0,
      reviews: this.getReviews(toy.toyId),
    };
  }
}
