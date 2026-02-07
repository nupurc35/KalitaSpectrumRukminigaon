import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { WHATSAPP_LINK, MAP_LINK } from '../constants/menu';
import { getReservationsFromLocalStorage, type ReservationData } from '../services/reservationService';
import { useRestaurant } from '../hooks/useRestaurant';

const ThankYou: React.FC = () => {
  const { restaurant, loading } = useRestaurant();
  const [latestReservation, setLatestReservation] = useState<ReservationData | null>(null);
  const location = useLocation();

  useEffect(() => {
    const reservationFromState = (location.state as { reservation?: ReservationData } | null)?.reservation;
    if (reservationFromState) {
      setLatestReservation(reservationFromState);
      return;
    }

    // Get the most recent reservation from local storage
    const reservations = getReservationsFromLocalStorage();
    if (reservations.length > 0) {
      // Sort by submittedAt (most recent first) and get the latest
      const sorted = reservations.sort((a, b) => {
        const aTime = Date.parse(a.submittedAt);
        const bTime = Date.parse(b.submittedAt);
        return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
      });
      setLatestReservation(sorted[0]);
    }
  }, [location.state]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string): string => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return null;
  }

  const displayPhone = restaurant?.phone ?? '';
  const phoneHref = displayPhone ? `tel:${displayPhone.replace(/\s/g, '')}` : undefined;
  const name = restaurant?.name ?? 'our restaurant';

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6 py-24">
      <div className="max-w-3xl mx-auto w-full">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 mb-6">
          <div className="text-center mb-8">
            <div className="mb-6">
              <svg className="w-24 h-24 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h1 className="text-4xl md:text-5xl font-serif mb-4 text-gray-800">
              Reservation Confirmed!
            </h1>

            <p className="text-lg text-gray-600 mb-2 leading-relaxed">
              Thank you for choosing <span className="font-bold text-primary">{name}</span>
            </p>

            <p className="text-base text-gray-500">
              Your table has been successfully booked. We look forward to serving you!
            </p>
          </div>

          {/* Reservation Details */}
          {latestReservation && (
            <div className="bg-accent rounded-xl p-6 mb-8 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Your Reservation Details</h2>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Name</p>
                  <p className="font-semibold text-gray-800">{latestReservation.name}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Phone</p>
                  <p className="font-semibold text-gray-800">{latestReservation.phone}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Date</p>
                  <p className="font-semibold text-gray-800">{formatDate(latestReservation.date)}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Time</p>
                  <p className="font-semibold text-gray-800">{formatTime(latestReservation.time)}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Number of Guests</p>
                  <p className="font-semibold text-gray-800">{latestReservation.guests} {latestReservation.guests === 1 ? 'Guest' : 'Guests'}</p>
                </div>
                {latestReservation.occasion && (
                  <div>
                    <p className="text-gray-500 mb-1">Occasion</p>
                    <p className="font-semibold text-gray-800">{latestReservation.occasion}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              What to Expect
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">✓</span>
                <span>Your reservation is confirmed and saved in our system</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">✓</span>
                <span>Please arrive 10 minutes before your reservation time</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">✓</span>
                <span>If you need to modify or cancel, please contact us using the details below</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-block bg-primary text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest transition-all duration-300 hover:bg-secondary hover:shadow-xl hover:-translate-y-1 text-center"
            >
              Return Home
            </Link>
            <Link
              to="/menu"
              className="inline-block bg-secondary text-primary px-8 py-4 rounded-full font-bold uppercase tracking-widest transition-all duration-300 hover:bg-secondary/90 hover:shadow-xl hover:-translate-y-1 text-center"
            >
              View Menu
            </Link>
          </div>
        </div>

        {/* Backup Contact Details Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Need Help? Contact Us
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Phone Contact */}
            <div className="bg-accent rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Call Us</h3>
              </div>
              <a
                href={phoneHref}
                className="text-2xl font-bold text-primary hover:text-secondary transition-colors block mb-2"
                aria-label={`Call ${name} at ${displayPhone}`}
              >
                {displayPhone}
              </a>
              <p className="text-sm text-gray-600">
                Available during restaurant hours
              </p>
            </div>

            {/* WhatsApp Contact */}
            <div className="bg-accent rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800">WhatsApp</h3>
              </div>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-semibold text-[#25D366] hover:text-[#20BA5A] transition-colors block mb-2"
                aria-label={`Contact ${name} on WhatsApp`}
              >
                Message Us on WhatsApp
              </a>
              <p className="text-sm text-gray-600">
                Quick response guaranteed
              </p>
            </div>
          </div>

          {/* Address and Hours */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Visit Us
                </h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  {restaurant?.address}
                </p>
                <a
                  href={MAP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-secondary text-sm font-semibold inline-flex items-center gap-1"
                  aria-label={`Open ${name} location in Google Maps`}
                >
                  View on Google Maps
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Opening Hours
                </h3>
                <div className="space-y-2 text-gray-700">
                  <p className="flex justify-between">
                    <span className="font-medium">Mon – Fri:</span>
                    <span>12:00 PM – 11:30 PM</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-medium">Sat – Sun:</span>
                    <span>11:30 AM – 12:00 AM</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ThankYou;
