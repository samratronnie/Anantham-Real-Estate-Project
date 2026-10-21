import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Listing, Appointment, Subscription } from '../types.ts';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is currently offline or unreachable.');
      return false;
    }
    // Permission denied on test/connection is expected if rules deny it, but indicates server reachability
    return true;
  }
}

// Initial Seed Data matching the user's template
export const INITIAL_LISTINGS: Listing[] = [
  {
    id: 'listing-luxury-house-1',
    title: 'Luxury House',
    category: 'House',
    location: 'Kolkata, West Bengal',
    price: 7500000,
    priceFormatted: '₹75 Lakhs',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
    description: '4 BHK premium villa located in New Town, Kolkata with private lawn, marble flooring, and 2 car parking.',
    sellerName: 'Debraj Mukherjee',
    sellerContact: '+91 98301 23456',
    createdAt: new Date('2026-03-01T10:00:00Z').toISOString(),
    featured: true,
  },
  {
    id: 'listing-used-suv-2',
    title: 'Used SUV',
    category: 'Car',
    location: 'Delhi',
    price: 1200000,
    priceFormatted: '₹12 Lakhs',
    imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80',
    description: '2022 Hyundai Creta SX Diesel, single owner, comprehensive insurance till 2027, driven 28,000 km.',
    sellerName: 'Vikram Sethi',
    sellerContact: '+91 98111 54321',
    createdAt: new Date('2026-03-02T11:00:00Z').toISOString(),
    featured: true,
  },
  {
    id: 'listing-royal-enfield-3',
    title: 'Royal Enfield',
    category: 'Bike',
    location: 'Bangalore',
    price: 150000,
    priceFormatted: '₹1.5 Lakhs',
    imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80',
    description: 'Royal Enfield Classic 350 Stealth Black, showroom condition, dual channel ABS, only 6,500 km run.',
    sellerName: 'Arjun Rao',
    sellerContact: '+91 98450 78901',
    createdAt: new Date('2026-03-03T12:00:00Z').toISOString(),
    featured: true,
  },
  {
    id: 'listing-prime-land-4',
    title: 'Prime Residential Plot',
    category: 'Land',
    location: 'Hyderabad, Telangana',
    price: 4500000,
    priceFormatted: '₹45 Lakhs',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80',
    description: '2400 sq.ft HMDA approved corner plot with 40ft wide road access, water and electricity connections.',
    sellerName: 'K. S. Reddy',
    sellerContact: '+91 98490 11223',
    createdAt: new Date('2026-03-04T09:30:00Z').toISOString(),
    featured: false,
  },
  {
    id: 'listing-vintage-curio-5',
    title: 'Rare Brass Gramophone',
    category: 'Curios',
    location: 'Jaipur, Rajasthan',
    price: 35000,
    priceFormatted: '₹35 Thousand',
    imageUrl: 'https://images.unsplash.com/photo-1584679109597-c656b19974c9?auto=format&fit=crop&w=600&q=80',
    description: 'Authentic 1940s His Master Voice working brass gramophone with 10 vintage 78rpm shellac records.',
    sellerName: 'Rathore Antiques',
    sellerContact: '+91 94140 33445',
    createdAt: new Date('2026-03-05T14:15:00Z').toISOString(),
    featured: false,
  },
  {
    id: 'listing-teakwood-dining-6',
    title: 'Solid Teak 6-Seater Dining Set',
    category: 'Household',
    location: 'Pune, Maharashtra',
    price: 48000,
    priceFormatted: '₹48 Thousand',
    imageUrl: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=600&q=80',
    description: 'Handcrafted CP teak dining table with 6 cushioned chairs and 10mm tempered glass top. Mint condition.',
    sellerName: 'Anil Kulkarni',
    sellerContact: '+91 98220 55667',
    createdAt: new Date('2026-03-06T16:00:00Z').toISOString(),
    featured: false,
  },
];

// Seed initial listings into Firestore if empty
export async function seedInitialListingsIfEmpty(currentCount: number): Promise<void> {
  if (currentCount > 0) return;
  const path = 'listings';
  try {
    for (const listing of INITIAL_LISTINGS) {
      await setDoc(doc(db, path, listing.id), listing);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Subscribe to real-time listings updates
export function subscribeToListings(callback: (listings: Listing[]) => void): () => void {
  const path = 'listings';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: Listing[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as Listing);
      });
      // Sort newest first
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// Add a new listing
export async function addListing(listing: Listing): Promise<void> {
  const path = 'listings';
  try {
    await setDoc(doc(db, path, listing.id), listing);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${path}/${listing.id}`);
  }
}

// Subscribe to real-time appointments updates
export function subscribeToAppointments(callback: (appointments: Appointment[]) => void): () => void {
  const path = 'appointments';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: Appointment[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as Appointment);
      });
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// Book an appointment
export async function bookAppointment(appointment: Appointment): Promise<void> {
  const path = 'appointments';
  try {
    await setDoc(doc(db, path, appointment.id), appointment);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${path}/${appointment.id}`);
  }
}

// Update appointment status
export async function updateAppointmentStatus(
  id: string,
  status: 'pending' | 'confirmed' | 'cancelled'
): Promise<void> {
  const path = `appointments/${id}`;
  try {
    await updateDoc(doc(db, 'appointments', id), { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Delete an appointment
export async function cancelAppointment(id: string): Promise<void> {
  const path = `appointments/${id}`;
  try {
    await deleteDoc(doc(db, 'appointments', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Subscribe to subscriptions
export function subscribeToSubscriptions(callback: (subs: Subscription[]) => void): () => void {
  const path = 'subscriptions';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: Subscription[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as Subscription);
      });
      callback(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// Save subscription
export async function saveSubscription(sub: Subscription): Promise<void> {
  const path = 'subscriptions';
  try {
    await setDoc(doc(db, path, sub.id), sub);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${path}/${sub.id}`);
  }
}
