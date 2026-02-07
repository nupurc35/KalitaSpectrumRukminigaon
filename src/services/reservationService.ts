export interface ReservationData {
  name: string;
  email?: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  occasion?: string;
  submittedAt: string;
}

const RESERVATION_STORAGE_KEY = 'kalita_spectrum_reservations';
const API_ENDPOINT = 'https://jsonplaceholder.typicode.com/posts'; // Placeholder API

/**
 * Save reservation to local storage
 */
export const saveReservationToLocalStorage = (data: ReservationData): void => {
  try {
    const existingReservations = getReservationsFromLocalStorage();
    const newReservation = {
      ...data,
      id: Date.now().toString(),
    };
    existingReservations.push(newReservation);
    localStorage.setItem(RESERVATION_STORAGE_KEY, JSON.stringify(existingReservations));
  } catch (error) {
    console.error('Failed to save reservation to local storage:', error);
  }
};

/**
 * Get all reservations from local storage
 */
export const getReservationsFromLocalStorage = (): ReservationData[] => {
  try {
    const stored = localStorage.getItem(RESERVATION_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to get reservations from local storage:', error);
    return [];
  }
};

/**
 * Save reservation to placeholder API
 * This is a mock API call - in production, replace with actual backend endpoint
 */
export const saveReservationToAPI = async (data: ReservationData): Promise<boolean> => {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: `Reservation for ${data.name}`,
        body: JSON.stringify(data),
        userId: 1,
      }),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    return true;
  } catch (error) {
    console.error('Failed to save reservation to API:', error);
    return false;
  }
};

/**
 * Save reservation (tries API first, falls back to local storage)
 */
export const saveReservation = async (data: ReservationData): Promise<void> => {
  // Always save to local storage as backup
  saveReservationToLocalStorage(data);

  // Try to save to API (non-blocking)
  try {
    await saveReservationToAPI(data);
  } catch (error) {
    // API save failed, but local storage save succeeded
    console.warn('API save failed, reservation saved to local storage only');
  }
};
