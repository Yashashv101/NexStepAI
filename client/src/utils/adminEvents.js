// Lightweight event bus for Admin UI updates
export const ADMIN_DATA_CHANGED_EVENT = 'admin:data-changed';

/**
 * Emit an admin data change notification.
 * detail: { type: 'goal'|'roadmap'|'user'|string, action: 'created'|'updated'|'deleted', countDelta?: number }
 */
export function emitAdminDataChanged(detail = {}) {
  try {
    const event = new CustomEvent(ADMIN_DATA_CHANGED_EVENT, { detail });
    window.dispatchEvent(event);
  } catch (err) {
    // Fallback for environments lacking CustomEvent
    const event = { type: ADMIN_DATA_CHANGED_EVENT, detail };
    window.dispatchEvent(event);
  }
}

/**
 * Subscribe to admin data change notifications.
 * Returns an unsubscribe function.
 */
export function subscribeAdminDataChanged(handler) {
  const wrapped = (e) => handler(e.detail || {});
  window.addEventListener(ADMIN_DATA_CHANGED_EVENT, wrapped);
  return () => window.removeEventListener(ADMIN_DATA_CHANGED_EVENT, wrapped);
}