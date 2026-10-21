/**
 * Dynamic Event Bus for inter-component and inter-button communication.
 * Employs window CustomEvents and reactive subscriber callbacks.
 */

import { BusEventPayload } from '../types.ts';

type EventHandler<T = any> = (data: T, eventPayload: BusEventPayload) => void;

class AppEventBus {
  private subscribers: Map<string, Set<EventHandler>> = new Map();
  private eventLogs: BusEventPayload[] = [];
  private logListeners: Set<(logs: BusEventPayload[]) => void> = new Set();
  private maxLogs = 30;

  constructor() {
    // Also listen to window level custom events for external compatibility
    if (typeof window !== 'undefined') {
      window.addEventListener('anantham:event', (e: Event) => {
        const customEvent = e as CustomEvent<BusEventPayload>;
        if (customEvent.detail) {
          this.recordLog(customEvent.detail);
        }
      });
    }
  }

  public emit<T = any>(action: string, data: T, source: string = 'UI Button', target?: string): BusEventPayload {
    const payload: BusEventPayload = {
      action,
      data,
      source,
      target,
      timestamp: Date.now(),
    };

    // Record into log
    this.recordLog(payload);

    // Notify registered subscribers
    const handlers = this.subscribers.get(action);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data, payload);
        } catch (err) {
          console.error(`Error in event listener for action ${action}:`, err);
        }
      });
    }

    // Dispatch DOM CustomEvent so vanilla JS and external DOM listeners also intercept
    if (typeof window !== 'undefined') {
      const domEvent = new CustomEvent('anantham:event', { detail: payload, bubbles: true });
      window.dispatchEvent(domEvent);

      // Also dispatch action-specific custom event
      const specificEvent = new CustomEvent(`anantham:${action}`, { detail: payload, bubbles: true });
      window.dispatchEvent(specificEvent);
    }

    return payload;
  }

  public on<T = any>(action: string, handler: EventHandler<T>): () => void {
    if (!this.subscribers.has(action)) {
      this.subscribers.set(action, new Set());
    }
    const set = this.subscribers.get(action)!;
    set.add(handler as EventHandler);

    // Return unbind function
    return () => {
      set.delete(handler as EventHandler);
      if (set.size === 0) {
        this.subscribers.delete(action);
      }
    };
  }

  public getRecentLogs(): BusEventPayload[] {
    return [...this.eventLogs];
  }

  public subscribeToLogs(cb: (logs: BusEventPayload[]) => void): () => void {
    this.logListeners.add(cb);
    cb(this.getRecentLogs());
    return () => {
      this.logListeners.delete(cb);
    };
  }

  public clearLogs(): void {
    this.eventLogs = [];
    this.notifyLogListeners();
  }

  private recordLog(payload: BusEventPayload) {
    this.eventLogs.unshift(payload);
    if (this.eventLogs.length > this.maxLogs) {
      this.eventLogs.pop();
    }
    this.notifyLogListeners();
  }

  private notifyLogListeners() {
    const logs = this.getRecentLogs();
    this.logListeners.forEach((cb) => cb(logs));
  }
}

export const eventBus = new AppEventBus();

// Specific Event Names enum/constants for type safety
export const BUS_EVENTS = {
  LISTING_SELECT_FOR_APPOINTMENT: 'listing:select_for_appointment',
  CATEGORY_FILTER_CHANGE: 'category:filter_change',
  TRIGGER_POST_LISTING: 'ui:trigger_post_listing',
  NAVIGATE_TO_BROWSE: 'ui:navigate_to_browse',
  SEARCH_QUERY_CHANGE: 'search:query_change',
  APPOINTMENT_SUBMITTED: 'appointment:submitted',
  LISTING_CREATED: 'listing:created',
  TRIGGER_SUBSCRIPTION: 'ui:trigger_subscription',
  TOGGLE_APPOINTMENTS_DRAWER: 'ui:toggle_appointments_drawer',
  NOTIFICATION_SHOW: 'notification:show',
} as const;
