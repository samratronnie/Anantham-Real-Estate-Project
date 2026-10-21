export type Category = 'Land' | 'House' | 'Car' | 'Bike' | 'Commercial' | 'Household' | 'Curios';

export interface Listing {
  id: string;
  title: string;
  category: Category;
  location: string;
  price: number;
  priceFormatted?: string;
  imageUrl?: string;
  description?: string;
  sellerName?: string;
  sellerContact?: string;
  createdAt: string;
  featured?: boolean;
}

export interface Appointment {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  date: string;
  listingId: string;
  listingTitle: string;
  listingLocation: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface Subscription {
  id: string;
  planName: string;
  price: number;
  subscriberName: string;
  subscriberEmail?: string;
  status: 'active' | 'cancelled';
  createdAt: string;
}

export interface BusEventPayload {
  source: string;
  target?: string;
  action: string;
  timestamp: number;
  data: any;
}
