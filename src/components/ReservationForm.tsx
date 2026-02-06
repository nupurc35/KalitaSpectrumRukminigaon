import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ChangeEvent } from 'react';
import { saveReservationToLocalStorage, type ReservationData } from '../services/reservationService';
import { validateIndianPhoneNumber } from '../utils/phoneValidation';
import analytics from '../services/analytics';
import { supabase } from "../lib/superbase";

export default function ReservationForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    time: '',
    guests: 2,
    occasion: ''
  });

  type FormErrors = {
    name?: string;
    phone?: string;
    date?: string;
    time?: string;
    guests?: string;
    occasion?: string;
  };

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate time slots (every 30 minutes from 12:00 PM to 10:00 PM)
  const generateTimeSlots = () => {
    const slots: string[] = [];
    for (let hour = 12; hour < 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    slots.push('22:00');
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      const phoneValidation = validateIndianPhoneNumber(formData.phone);
      if (!phoneValidation.isValid) {
        newErrors.phone = phoneValidation.error || 'Please enter a valid phone number';
      }
    }

    if (!formData.date) {
      newErrors.date = 'Reservation date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.date = 'Please select a future date';
      }
    }

    if (!formData.time) {
      newErrors.time = 'Reservation time is required';
    }

    if (!formData.guests || formData.guests < 1) {
      newErrors.guests = 'Number of guests must be at least 1';
    } else if (formData.guests > 20) {
      newErrors.guests = 'Maximum 20 guests per reservation';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Handle guests as number
    if (name === 'guests') {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue)) {
        setFormData(prev => ({ ...prev, [name]: numValue }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error for this field when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const formatTimeForDisplay = (time: string): string => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const isPhoneValid = formData.phone.trim()
    ? validateIndianPhoneNumber(formData.phone).isValid
    : false;

  const isReadyToSubmit = Boolean(
    formData.name.trim() &&
    isPhoneValid &&
    formData.date &&
    formData.time &&
    formData.guests &&
    formData.guests > 0
  );

  const inputBaseClasses =
    'h-14 w-full px-5 rounded-lg border text-gray-900 bg-white placeholder:font-semibold placeholder:text-gray-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-400 outline-none transition';

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submittedAt = new Date().toISOString();

      // 1. Clean / validate phone
      const phoneValidation = validateIndianPhoneNumber(formData.phone);
      const cleanedPhone = phoneValidation.cleaned || formData.phone;

      // 2. Prepare reservation payload
      const reservationData = {
        restaurant_id: import.meta.env.VITE_RESTAURANT_ID || "63bfceb5-1fad-4d42-b0c0-80a29c3e4be2",
        name: formData.name.trim(),
        phone: cleanedPhone,
        date: formData.date,
        time: formData.time,
        guests: Number(formData.guests),
        occasion: formData.occasion?.trim() || null,
        status: "confirmed",
        created_at: submittedAt,
      };

      // 3. Save to Supabase
      const { error } = await supabase
        .from("reservations")
        .insert([reservationData]);

      if (error) {
        throw error;
      }

      const localReservation: ReservationData = {
        name: reservationData.name,
        phone: reservationData.phone,
        date: reservationData.date,
        time: reservationData.time,
        guests: reservationData.guests,
        occasion: reservationData.occasion || undefined,
        submittedAt,
      };

      // Keep a local copy so the Thank You page can show the details even after refresh.
      saveReservationToLocalStorage(localReservation);

      // Track conversion (avoid PII in analytics payload).
      analytics.trackReservationSubmit({
        guests: localReservation.guests,
        date: localReservation.date,
        time: localReservation.time,
      });

      // 4. Navigate to thank-you page (pass state for immediate display)
      navigate("/thank-you", { state: { reservation: localReservation } });

    } catch (error: any) {
      console.error("Reservation error:", {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code,
      });

      alert(error?.message || "Reservation failed");
      setIsSubmitting(false);
    }
  };

  return (
    <section id="reservation-section" className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">
            Book Your Table at <span className="text-amber-400">Kalita Spectrum</span>
          </h2>
        </div>

        {/* Reservation Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h3 className="text-3xl font-bold text-gray-800 text-center mb-6">
            Reserve Your Table
          </h3>

          <div className="space-y-6">
            {/* Name and Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="reservation-name" className="text-sm text-gray-700 mb-1 block font-semibold">
                  Your Name *
                </label>
                <input
                  id="reservation-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Full Name"
                  aria-required="true"
                  aria-invalid={errors.name ? 'true' : 'false'}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                  className={`${inputBaseClasses} ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.name && (
                  <p id="name-error" className="text-red-500 text-xs mt-1" role="alert">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="reservation-phone" className="text-sm text-gray-700 mb-1 block font-semibold">
                  Phone Number *
                </label>
                <input
                  id="reservation-phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone Number (e.g., +91 9876543210)"
                  aria-required="true"
                  aria-invalid={errors.phone ? 'true' : 'false'}
                  aria-describedby={errors.phone ? 'phone-error' : undefined}
                  className={`${inputBaseClasses} ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.phone && (
                  <p id="phone-error" className="text-red-500 text-xs mt-1" role="alert">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="reservation-date" className="text-sm text-gray-700 mb-1 block font-semibold">
                  Reservation Date *
                </label>
                <input
                  id="reservation-date"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  aria-required="true"
                  aria-invalid={errors.date ? 'true' : 'false'}
                  aria-describedby={errors.date ? 'date-error' : undefined}
                  className={`${inputBaseClasses} ${errors.date ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.date && (
                  <p id="date-error" className="text-red-500 text-xs mt-1" role="alert">{errors.date}</p>
                )}
              </div>

              <div>
                <label htmlFor="reservation-time" className="text-sm text-gray-700 mb-1 block font-semibold">
                  Select Time
                </label>
                <select
                  id="reservation-time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  aria-required="true"
                  aria-invalid={errors.time ? 'true' : 'false'}
                  aria-describedby={errors.time ? 'time-error' : undefined}
                  className={`${inputBaseClasses} ${errors.time ? 'border-red-500' : 'border-gray-300'} bg-white`}
                >
                  <option value="">Select Time</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {formatTimeForDisplay(time)}
                    </option>
                  ))}
                </select>
                {errors.time && (
                  <p id="time-error" className="text-red-500 text-xs mt-1" role="alert">{errors.time}</p>
                )}
              </div>
            </div>

            {/* Guests and Occasion */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="reservation-guests" className="text-sm text-gray-700 mb-1 block font-semibold">
                  Number of Guests *
                </label>
                <input
                  id="reservation-guests"
                  type="number"
                  name="guests"
                  value={formData.guests}
                  onChange={handleChange}
                  min="1"
                  max="20"
                  aria-required="true"
                  aria-invalid={errors.guests ? 'true' : 'false'}
                  aria-describedby={errors.guests ? 'guests-error' : undefined}
                  className={`${inputBaseClasses} ${errors.guests ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.guests && (
                  <p id="guests-error" className="text-red-500 text-xs mt-1" role="alert">{errors.guests}</p>
                )}
              </div>

              <div>
                <label htmlFor="reservation-occasion" className="text-sm text-gray-700 mb-1 block font-semibold">
                  Occasion
                </label>
                <input
                  id="reservation-occasion"
                  type="text"
                  name="occasion"
                  value={formData.occasion}
                  onChange={handleChange}
                  placeholder="Birthday, Anniversary, etc."
                  className={`${inputBaseClasses} border-gray-300`}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !isReadyToSubmit}
              aria-label={isSubmitting ? 'Submitting reservation...' : 'Submit reservation form'}
              className="mt-6 w-full h-16 rounded-lg bg-amber-500 text-white text-lg md:text-xl font-semibold hover:bg-amber-600 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:bg-amber-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Submit Reservation
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-3">
              * Required fields
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
