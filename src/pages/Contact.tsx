import React, { useState } from "react";
import { MAP_LINK, MAP_EMBED_URL } from "../constants/menu";
import { createLead } from "../services/leadService";
import { useRestaurant } from "../hooks/useRestaurant";
import { indianPhone, required, validateField } from "../utils/validation";

const Contact: React.FC = () => {
  const { restaurant, loading: restaurantLoading } = useRestaurant();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (restaurantLoading) {
    return null;
  }

  const displayPhone = restaurant?.phone ?? "";
  const phoneHref = displayPhone ? `tel:${displayPhone.replace(/\s/g, "")}` : undefined;
  const phoneError = validateField(phone, [
    required("Please enter your phone number"),
    indianPhone(),
  ]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (phoneError) {
      setFormError(phoneError);
      return;
    }

    setFormError(null);
    setLoading(true);

    const { error } = await createLead({
      name: name.trim() || undefined,
      phone: phone.trim(),
      message: message.trim() || undefined,
      intent: "contact",
      source: "website",
    });

    setLoading(false);

    if (error) {
      setFormError(error);
      return;
    }

    setName("");
    setPhone("");
    setMessage("");
    setSubmitted(true);
  };

  return (
    <section className="py-24 px-6 bg-accent min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto w-full">
        <div className="bg-primary rounded-[40px] overflow-hidden flex flex-col lg:flex-row shadow-2xl border border-white/5">
          
          {/* LEFT: CONTACT INFO */}
          <div className="p-8 md:p-16 lg:w-2/5">
            <span className="text-secondary uppercase text-[10px] tracking-widest font-bold mb-4">
              Contact Us
            </span>

              <h3 className="text-4xl md:text-5xl font-serif mb-8 text-white italic">
              Get in Touch
            </h3>

            <div className="space-y-6">
              <p className="text-white/70">{restaurant?.address}</p>

              <a
                href={phoneHref}
                className="text-secondary text-2xl font-serif hover:text-white"
              >
                {displayPhone}
              </a>

              {/* CONTACT FORM */}
              {!submitted ? (
              <form onSubmit={handleContactSubmit} className="space-y-4 pt-6">
              {formError && (
                <div className="rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {formError}
                </div>
              )}
              <input type="text" placeholder="Your Name (optional)"value={name}onChange={(e) => setName(e.target.value)}
                     className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-white/50"/>
              <input type="tel"placeholder="Phone Number *"value={phone}onChange={(e) => setPhone(e.target.value)}required
                      className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-white/50"/>
              {phoneError && (
                <p className="text-xs text-red-200">{phoneError}</p>
              )}
              <textarea placeholder="Message (optional)"value={message}onChange={(e) => setMessage(e.target.value)}
                       className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-white/50"/>
              <button type="submit" disabled={loading}className="w-full bg-secondary text-primary py-3 rounded-full font-bold uppercase tracking-widest hover:bg-white transition">
                      {loading ? "Submitting..." : "Request a Callback"}</button>
              </form> ) 
              : (
              <div className="mt-6 p-6 rounded-2xl bg-secondary/10 border border-secondary/30">
              <h4 className="text-secondary text-xl font-serif mb-2">
                      Request Submitted
               </h4>
              <p className="text-white/80 leading-relaxed">
                      Thank you! We’ve received your request and will contact you shortly.
              </p>
              </div>)}
              </div>
          </div>

          {/* RIGHT: MAP */}
          <div className="lg:w-3/5 min-h-[500px] relative">
            <iframe
              src={MAP_EMBED_URL}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: "500px" }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
