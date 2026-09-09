export interface AgeGroup {
  ageGroupId: number;
  name: string;
  description: string;
}

export interface ToyType {
  typeId: number;
  name: string;
  description: string;
}

export interface Review {
  user: string;
  comment: string;
  rating: number;
}

export interface Toy {
  toyId: number;
  name: string;
  permalink: string;
  description: string;
  targetGroup: 'devojčica' | 'dečak' | 'svi';
  productionDate: string;
  price: number;
  imageUrl: string;
  ageGroup: AgeGroup;
  type: ToyType;
  reviews?: Review[];
  rating?: number;
}
