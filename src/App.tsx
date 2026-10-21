/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Hero } from './components/Hero.tsx';
import { SearchSection } from './components/SearchSection.tsx';
import { CategoryGrid } from './components/CategoryGrid.tsx';
import { ListingGrid } from './components/ListingGrid.tsx';
import { PlanSection } from './components/PlanSection.tsx';
import { CommissionBanner } from './components/CommissionBanner.tsx';
import { Footer } from './components/Footer.tsx';
import { AppointmentModal } from './components/AppointmentModal.tsx';
import { PostListingModal } from './components/PostListingModal.tsx';
import { SubscriptionModal } from './components/SubscriptionModal.tsx';
import { AppointmentsDrawer } from './components/AppointmentsDrawer.tsx';
import { EventBusMonitor } from './components/EventBusMonitor.tsx';
import { Listing, Appointment, Subscription, Category } from './types.ts';
import {
  testConnection,
  subscribeToListings,
  subscribeToAppointments,
  subscribeToSubscriptions,
  seedInitialListingsIfEmpty,
  INITIAL_LISTINGS,
} from './services/firebase.ts';
import { eventBus, BUS_EVENTS } from './services/eventBus.ts';
import { CheckCircle2, Info, X } from 'lucide-react';

export default function App() {
  // Application Data States
  const [listings, setListings] = useState<Listing[]>(INITIAL_LISTINGS);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isDbConnected, setIsDbConnected] = useState<boolean>(true);
  const [isLoadingListings, setIsLoadingListings] = useState<boolean>(true);

  // Search and Filter States
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');

  // Modal / Drawer States
  const [appointmentModalOpen, setAppointmentModalOpen] = useState<boolean>(false);
  const [selectedListingForApt, setSelectedListingForApt] = useState<Listing | null>(null);
  const [postListingModalOpen, setPostListingModalOpen] = useState<boolean>(false);
  const [postListingCategory, setPostListingCategory] = useState<Category | undefined>(undefined);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState<boolean>(false);
  const [appointmentsDrawerOpen, setAppointmentsDrawerOpen] = useState<boolean>(false);
  const [showEventMonitor, setShowEventMonitor] = useState<boolean>(true);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize and subscribe to Live Firestore
  useEffect(() => {
    // 1. Connection check as required by Firebase skill
    testConnection().then((ok) => setIsDbConnected(ok));

    // 2. Real-time listings listener
    const unbindListings = subscribeToListings((liveListings) => {
      setIsLoadingListings(false);
      if (liveListings.length === 0) {
        // Seed initial items if database is empty
        seedInitialListingsIfEmpty(0).catch(console.error);
        setListings(INITIAL_LISTINGS);
      } else {
        setListings(liveListings);
      }
    });

    // 3. Real-time appointments listener
    const unbindAppointments = subscribeToAppointments((liveAppointments) => {
      setAppointments(liveAppointments);
    });

    // 4. Real-time subscriptions listener
    const unbindSubscriptions = subscribeToSubscriptions((liveSubs) => {
      setSubscriptions(liveSubs);
    });

    return () => {
      unbindListings();
      unbindAppointments();
      unbindSubscriptions();
    };
  }, []);

  // Set up inter-component dynamic event listeners
  useEffect(() => {
    // Listen to Listing selection for appointment
    const unbindApt = eventBus.on(
      BUS_EVENTS.LISTING_SELECT_FOR_APPOINTMENT,
      (data: { listing: Listing }) => {
        if (data?.listing) {
          setSelectedListingForApt(data.listing);
          setAppointmentModalOpen(true);
        }
      }
    );

    // Listen to Category filter changes
    const unbindCategory = eventBus.on(
      BUS_EVENTS.CATEGORY_FILTER_CHANGE,
      (data: { category: string }) => {
        if (data?.category) {
          setSelectedCategory(data.category);
        }
      }
    );

    // Listen to Search query changes
    const unbindSearch = eventBus.on(
      BUS_EVENTS.SEARCH_QUERY_CHANGE,
      (data: { keyword: string; category: string }) => {
        if (data) {
          setSearchKeyword(data.keyword || '');
          if (data.category) setSelectedCategory(data.category);
        }
      }
    );

    // Listen to Post Listing trigger
    const unbindPost = eventBus.on(
      BUS_EVENTS.TRIGGER_POST_LISTING,
      (data: { prefillCategory?: Category }) => {
        setPostListingCategory(data?.prefillCategory);
        setPostListingModalOpen(true);
      }
    );

    // Listen to Subscription trigger
    const unbindSub = eventBus.on(BUS_EVENTS.TRIGGER_SUBSCRIPTION, () => {
      setSubscriptionModalOpen(true);
    });

    // Listen to Appointments Submitted
    const unbindAptSubmitted = eventBus.on(
      BUS_EVENTS.APPOINTMENT_SUBMITTED,
      (data: { appointment: Appointment }) => {
        showToast(`Appointment booked successfully for ${data.appointment.listingTitle}!`);
      }
    );

    // Listen to Listing Created
    const unbindListingCreated = eventBus.on(
      BUS_EVENTS.LISTING_CREATED,
      (data: { listing: Listing }) => {
        showToast(`"${data.listing.title}" is now live on the marketplace!`);
      }
    );

    // Listen to generic notifications
    const unbindNotification = eventBus.on(
      BUS_EVENTS.NOTIFICATION_SHOW,
      (data: { message: string }) => {
        if (data?.message) showToast(data.message);
      }
    );

    return () => {
      unbindApt();
      unbindCategory();
      unbindSearch();
      unbindPost();
      unbindSub();
      unbindAptSubmitted();
      unbindListingCreated();
      unbindNotification();
    };
  }, []);

  // Expose global functions to window for backward compatibility with the user's legacy script
  useEffect(() => {
    (window as any).openAppointment = (listingId?: string) => {
      if (listingId) {
        const found = listings.find((l) => l.id === listingId);
        if (found) setSelectedListingForApt(found);
      } else if (!selectedListingForApt && listings.length > 0) {
        setSelectedListingForApt(listings[0]);
      }
      setAppointmentModalOpen(true);
    };

    (window as any).closeAppointment = () => {
      setAppointmentModalOpen(false);
    };

    return () => {
      delete (window as any).openAppointment;
      delete (window as any).closeAppointment;
    };
  }, [listings, selectedListingForApt]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 4500);
  };

  // Filter listings based on real-time search keyword and category
  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      const matchesCategory =
        !selectedCategory ||
        selectedCategory === 'All Categories' ||
        item.category.toLowerCase() === selectedCategory.toLowerCase();

      const kw = searchKeyword.toLowerCase().trim();
      const matchesKeyword =
        !kw ||
        item.title.toLowerCase().includes(kw) ||
        item.location.toLowerCase().includes(kw) ||
        item.category.toLowerCase().includes(kw) ||
        (item.description && item.description.toLowerCase().includes(kw));

      return matchesCategory && matchesKeyword;
    });
  }, [listings, selectedCategory, searchKeyword]);

  const handleSearchChange = (keyword: string, category: string) => {
    setSearchKeyword(keyword);
    setSelectedCategory(category);
  };

  const handleResetFilters = () => {
    setSearchKeyword('');
    setSelectedCategory('All Categories');
    eventBus.emit(
      BUS_EVENTS.SEARCH_QUERY_CHANGE,
      { keyword: '', category: 'All Categories' },
      'Reset Filter Button',
      'ListingGrid & SearchSection'
    );
  };

  const isBasicPlanActive = subscriptions.some((s) => s.status === 'active');

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa] text-gray-900 selection:bg-[#f9b234] selection:text-[#1c2331]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#1c2331] text-white px-4 py-3 rounded-xl shadow-2xl border border-[#f9b234] flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200 max-w-md">
          <CheckCircle2 className="w-5 h-5 text-[#f9b234] shrink-0" />
          <span className="text-sm font-medium flex-1">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-gray-400 hover:text-white p-1"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        appointmentCount={appointments.length}
        isDbConnected={isDbConnected}
        onOpenAppointments={() => setAppointmentsDrawerOpen(true)}
        onToggleMonitor={() => setShowEventMonitor(!showEventMonitor)}
        showMonitor={showEventMonitor}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <Hero />

        {/* Search Listings Section */}
        <SearchSection
          selectedCategory={selectedCategory}
          searchKeyword={searchKeyword}
          onSearchChange={handleSearchChange}
          resultCount={filteredListings.length}
        />

        {/* Popular Categories Grid */}
        <CategoryGrid activeCategory={selectedCategory} />

        {/* Featured Listings Grid */}
        <ListingGrid
          listings={filteredListings}
          isLoading={isLoadingListings}
          activeCategory={selectedCategory}
          searchKeyword={searchKeyword}
          onResetFilters={handleResetFilters}
        />

        {/* Seller Subscription Plans */}
        <PlanSection
          onSubscribe={() => setSubscriptionModalOpen(true)}
          isSubscribed={isBasicPlanActive}
        />

        {/* Commission Policy */}
        <CommissionBanner />
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals & Drawers */}
      <AppointmentModal
        isOpen={appointmentModalOpen}
        onClose={() => setAppointmentModalOpen(false)}
        selectedListing={selectedListingForApt}
      />

      <PostListingModal
        isOpen={postListingModalOpen}
        onClose={() => setPostListingModalOpen(false)}
        prefillCategory={postListingCategory}
      />

      <SubscriptionModal
        isOpen={subscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
        onSuccess={() => setSubscriptionModalOpen(false)}
      />

      <AppointmentsDrawer
        isOpen={appointmentsDrawerOpen}
        onClose={() => setAppointmentsDrawerOpen(false)}
        appointments={appointments}
      />

      {/* Dynamic Event Bus Live Activity Inspector */}
      <EventBusMonitor
        isOpen={showEventMonitor}
        onClose={() => setShowEventMonitor(false)}
      />
    </div>
  );
}
