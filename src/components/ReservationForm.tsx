import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ChangeEvent } from 'react';
import { saveReservation } from '../services/reservationService';
import { validateIndianPhoneNumber } from '../utils/phoneValidation';
import analytics from '../services/analytics';

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

  // Generate time slots (every 30 minutes from 12:00 PM to 11:30 PM)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 12; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    // Add 00:00 for midnight
    slots.push('00:00');
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

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Validate and clean phone number
      const phoneValidation = validateIndianPhoneNumber(formData.phone);
      const cleanedPhone = phoneValidation.cleaned || formData.phone;

      // Prepare reservation data
      const reservationData = {
        name: formData.name.trim(),
        phone: cleanedPhone,
        date: formData.date,
        time: formData.time,
        guests: formData.guests,
        occasion: formData.occasion.trim() || undefined,
        submittedAt: new Date().toISOString(),
      };

      // Save reservation data (non-blocking)
      await saveReservation(reservationData);

      // Track reservation submission
      analytics.trackReservationSubmit({
        guests: reservationData.guests,
        date: reservationData.date,
        time: reservationData.time,
      });

      // Format date for display
      const dateObj = new Date(formData.date);
      const formattedDate = dateObj.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Create WhatsApp message (unchanged flow)
      const message = `*Kalita Spectrum - Table Reservation*

*Name:* ${formData.name}
*Phone:* ${cleanedPhone}
*Date:* ${formattedDate}
*Time:* ${formatTimeForDisplay(formData.time)}
*Number of Guests:* ${formData.guests}
*Occasion:* ${formData.occasion || 'Not specified'}

I would like to reserve a table. Please confirm availability.`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappNumber = '918453708792';
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
      
      // Open WhatsApp (unchanged flow)
      window.open(whatsappUrl, '_blank');
      
      // Navigate to thank you page after a short delay
      setTimeout(() => {
        setIsSubmitting(false);
        navigate('/thank-you');
      }, 1000);
    } catch (error) {
      console.error('Error submitting reservation:', error);
      setIsSubmitting(false);
      // Still open WhatsApp even if save fails
      const message = `*Kalita Spectrum - Table Reservation*

*Name:* ${formData.name}
*Phone:* ${formData.phone}
*Date:* ${formData.date}
*Time:* ${formatTimeForDisplay(formData.time)}
*Number of Guests:* ${formData.guests}
*Occasion:* ${formData.occasion || 'Not specified'}

I would like to reserve a table. Please confirm availability.`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappNumber = '918453708792';
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');
      
      setTimeout(() => {
        navigate('/thank-you');
      }, 1000);
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
          
          <div className="space-y-5">
            {/* Name and Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reservation-name" className="text-sm text-gray-600 mb-1 block font-medium">
                  Your Name *
                </label>
                <input
                  id="reservation-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  aria-required="true"
                  aria-invalid={errors.name ? 'true' : 'false'}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                  className={`h-12 w-full px-4 rounded-lg border ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  } focus:border-green-500 focus:ring-2 focus:ring-green-500 outline-none transition`}
                />
                {errors.name && (
                  <p id="name-error" className="text-red-500 text-xs mt-1" role="alert">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="reservation-phone" className="text-sm text-gray-600 mb-1 block font-medium">
                  Phone Number *
                </label>
                <input
                  id="reservation-phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210 or +91 9876543210"
                  aria-required="true"
                  aria-invalid={errors.phone ? 'true' : 'false'}
                  aria-describedby={errors.phone ? 'phone-error' : undefined}
                  className={`h-12 w-full px-4 rounded-lg border ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  } focus:border-green-500 focus:ring-2 focus:ring-green-500 outline-none transition`}
                />
                {errors.phone && (
                  <p id="phone-error" className="text-red-500 text-xs mt-1" role="alert">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reservation-date" className="text-sm text-gray-600 mb-1 block font-medium">
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
                  className={`h-12 w-full px-4 rounded-lg border ${
                    errors.date ? 'border-red-500' : 'border-gray-300'
                  } focus:border-green-500 focus:ring-2 focus:ring-green-500 outline-none transition`}
                />
                {errors.date && (
                  <p id="date-error" className="text-red-500 text-xs mt-1" role="alert">{errors.date}</p>
                )}
              </div>

              <div>
                <label htmlFor="reservation-time" className="text-sm text-gray-600 mb-1 block font-medium">
                  Reservation Time *
                </label>
                <select
                  id="reservation-time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  aria-required="true"
                  aria-invalid={errors.time ? 'true' : 'false'}
                  aria-describedby={errors.time ? 'time-error' : undefined}
                  className={`h-12 w-full px-4 rounded-lg border ${
                    errors.time ? 'border-red-500' : 'border-gray-300'
                  } focus:border-green-500 focus:ring-2 focus:ring-green-500 outline-none transition bg-white`}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reservation-guests" className="text-sm text-gray-600 mb-1 block font-medium">
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
                  className={`h-12 w-full px-4 rounded-lg border ${
                    errors.guests ? 'border-red-500' : 'border-gray-300'
                  } focus:border-green-500 focus:ring-2 focus:ring-green-500 outline-none transition`}
                />
                {errors.guests && (
                  <p id="guests-error" className="text-red-500 text-xs mt-1" role="alert">{errors.guests}</p>
                )}
              </div>

              <div>
                <label htmlFor="reservation-occasion" className="text-sm text-gray-600 mb-1 block font-medium">
                  Occasion
                </label>
                <input
                  id="reservation-occasion"
                  type="text"
                  name="occasion"
                  value={formData.occasion}
                  onChange={handleChange}
                  placeholder="Birthday, Anniversary, etc."
                  className="h-12 w-full px-4 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500 outline-none transition"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              aria-label={isSubmitting ? 'Submitting reservation...' : 'Submit reservation form'}
              className="mt-6 w-full h-14 rounded-lg bg-[#25D366] text-white text-lg font-semibold hover:bg-[#20BA5A] transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving & Opening WhatsApp...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Confirm on WhatsApp
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
