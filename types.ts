export enum Screen {
  Home,
  Profile,
  Flavors,
  Orders,
  Checkout,
  OrderSuccess,
  AdminLogin,
  Admin
}

export interface Review {
  user: string;
  rating: number;
  comment: string;
}

export interface Cupcake {
  id: number;
  name: string;
  price: number;
  image: string;
  weight: number; // in grams
  ingredients: string[];
  reviews: Review[];
}

export interface CartItem {
  cupcake: Cupcake;
  quantity: number;
}

export interface Address {
  street: string;
  number: string;
  city: string;
  state: string;
  zip: string;
}

export interface Order {
  id: string;
  date: Date;
  items: CartItem[];
  total: number;
  paymentMethod: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  address: Address;
  changeDetails?: {
    needsChange: boolean;
    forAmount?: number;
  };
}