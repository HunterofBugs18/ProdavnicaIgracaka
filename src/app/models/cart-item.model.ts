export interface CartItem {
  id: string;
  userEmail: string;
  toyId: number;
  toyName: string;
  toyPrice: number;
  toyImage: string;
  status: 'rezervisano' | 'pristiglo' | 'otkazano' | 'ocenjeno';
  orderDate: Date;
  toyDescription?: string;
  toyType?: string;
  toyTarget?: string;
  toyAge?: string;
}
