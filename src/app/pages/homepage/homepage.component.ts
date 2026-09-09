import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToyService, AuthService } from '../../services/app.service';
import { Toy, ToyType, AgeGroup } from '../../models/toy.model';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css',
})
export class HomepageComponent implements OnInit {
  allToys: Toy[] = [];
  toys: Toy[] = [];
  types: ToyType[] = [];
  ageGroups: AgeGroup[] = [];

  searchCriteria = {
    name: '',
    description: '',
    typeId: '',
    ageGroupId: '',
    targetGroup: '',
    maxPrice: null as number | null,
    minRating: 0,
    dateAfter: '',
  };

  constructor(
    private toyService: ToyService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadCatalogData();
  }

  loadCatalogData(): void {
    this.toyService.getAllToys().subscribe((data) => {
      this.allToys = data;
      this.toys = data;
    });

    this.toyService.getTypes().subscribe((data) => {
      this.types = data;
    });

    this.toyService.getAgeGroups().subscribe((data) => {
      this.ageGroups = data;
    });
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  applyFilters(): void {
    this.toys = this.allToys.filter((toy) => {
      const matchName = toy.name
        .toLowerCase()
        .includes(this.searchCriteria.name.toLowerCase());
      const matchDesc = toy.description
        .toLowerCase()
        .includes(this.searchCriteria.description.toLowerCase());

      const matchType =
        !this.searchCriteria.typeId ||
        toy.type.typeId.toString() === this.searchCriteria.typeId;
      const matchAge =
        !this.searchCriteria.ageGroupId ||
        toy.ageGroup.ageGroupId.toString() === this.searchCriteria.ageGroupId;
      const matchTarget =
        !this.searchCriteria.targetGroup ||
        toy.targetGroup === this.searchCriteria.targetGroup;

      const matchPrice =
        !this.searchCriteria.maxPrice ||
        toy.price <= this.searchCriteria.maxPrice;
      const matchRating =
        (toy.rating || 0) >= Number(this.searchCriteria.minRating);

      let matchDate = true;
      if (this.searchCriteria.dateAfter) {
        matchDate =
          new Date(toy.productionDate) >=
          new Date(this.searchCriteria.dateAfter);
      }

      return (
        matchName &&
        matchDesc &&
        matchType &&
        matchAge &&
        matchTarget &&
        matchPrice &&
        matchRating &&
        matchDate
      );
    });
  }
}
