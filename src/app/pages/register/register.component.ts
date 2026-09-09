import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/app.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  toyTypes: any[] = [];

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.createForm();
    this.loadToyTypes();
  }

  createForm(): void {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      favoriteTypes: [[]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  loadToyTypes(): void {
    this.http
      .get<any[]>('https://toy.pequla.com/api/type')
      .subscribe((data) => {
        this.toyTypes = data;
      });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const isRegistered = this.auth.register(this.registerForm.value);
      if (isRegistered) {
        this.router.navigate(['/login']);
      }
    }
  }
}
