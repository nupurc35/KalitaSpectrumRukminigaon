import { useState} from "react";

type Message = {
  from: "bot" | "user";
  text: string;
};

export default function ChatConcierge() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { from: "bot", text: "Hi 👋 How can I help you today?" }
  ]);
  const [expecting, setExpecting] = useState<null | "phone">(null);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const WHATSAPP_NUMBER = "918453708792"; // 🔁 change if needed

  const pushUser = (text: string) =>
    setMessages((prev) => [...prev, { from: "user", text }]);

  const pushBot = (text: string) =>
    setMessages((prev) => [...prev, { from: "bot", text }]);
  
 const openWhatsApp = (message: string) => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      message
    )}`;
    window.open(url, "_blank");
  };

  const handlePhoneSubmit = (rawPhone: string) => {
    const phone = rawPhone.replace(/\D/g, "");

    if (phone.length < 10) {
      pushBot("Please enter a valid 10-digit phone number 😊");
      return;
    }

    pushUser(phone);
    pushBot("Thank you! Our team will contact you shortly 🙏");

    openWhatsApp(
      `New Call-back Request\nPhone: ${phone}\nSource: Website Concierge`
    );

    setExpecting(null);
  };
  
const handleOption = (option: "call" | "reserve" | "availability" | "other") => {
    if (option === "call") {
      pushUser("📞 Call me back");
      pushBot("Sure 😊 Please share your phone number.");
      setExpecting("phone");
    }

    if (option === "reserve") {
      pushUser("🍽 Reserve a table");
      pushBot("Great! Please fill in your reservation details below 👇");
      setShowReservationForm(true);
    }

    if (option === "availability") {
      pushUser("📅 Today’s availability");
      pushBot(
        "We’re open today 😊 Please share your phone number and preferred time, and our team will confirm availability."
      );
      setExpecting("phone");
    }

    if (option === "other") {
      pushUser("❓ Ask something else");
      pushBot(
        "I can help with call-backs or table reservations. Please choose one of the options above 😊"
      );
    }
  };
const handleReservationSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const message = `New Table Reservation Request
Name: ${data.get("name")}
Phone: ${data.get("phone")}
Date: ${data.get("date")}
Time: ${data.get("time")}
Guests: ${data.get("guests")}
Source: Website Concierge`;

    pushBot("Thank you! We’ve received your request 🙏");
    openWhatsApp(message);

    setShowReservationForm(false);
  };

const resetChat = () => {
  setMessages([
    { from: "bot", text: "Hi 👋 How can I help you today?" }
  ]);
  setExpecting(null);
  setShowReservationForm(false);
};
return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen((o) => !o)}
        
          style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: "50%",
          backgroundColor: "#25D366",
          color: "#ffffff",
          fontSize: 24,
          border: "none",
          cursor: "pointer",
          boxShadow: "0 8px 20px rgba(0,0,0,0.35)",
          zIndex: 1000}}
         aria-label="Chat with Kalita Concierge"
      >
        💬
      </button>

      {/* Chat Window */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 90,
            right: 20,
            width: 320,
            maxHeight: 420,
            background: "#0b1220",
            borderRadius: 14,
            padding: 12,
            color: "#e5e7eb",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 20px 40px rgba(0,0,0,0.45)",
            border: "1px solid rgba(255,255,255,0.08)"}}
        >
         
    {/* Chat Header */}
<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  }}
>
  <strong style={{ fontSize: 14 }}>Kalita Concierge</strong>

  <button
    onClick={() => setOpen(false)}
    style={{
      background: "transparent",
      border: "none",
      color: "#94a3b8",
      cursor: "pointer",
      fontSize: 16
    }}
    aria-label="Close chat"
  >
    ✕
  </button>
</div>
{/* ⬅ START OVER BUTTON — PUT IT HERE */}
           {messages.length > 1 && (
             <button onClick={resetChat} style={{
             background: "transparent",
             color: "#93c5fd",
             border: "none",
             cursor: "pointer",
             fontSize: 12,
             marginBottom: 6,
             alignSelf: "flex-start"}} >⬅ Start over</button>)}
         
         {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", marginBottom: 8 }}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                flex: 1,
                overflowY: "auto",
                marginBottom: 8,
                paddingRight: 4
                }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "6px 10px",
                    borderRadius: 8,
                    background:
                      m.from === "user" ? "#1e293b" : "#020617"
                  }}
                >
                  {m.text}
                </span>
              </div>
            ))}
          </div>

          {/* Quick Options (only at start) */}
          {messages.length === 1 && (
            <div style={{ display: "grid", gap: 8 }}>
              <button onClick={() => handleOption("call")}>📞 Call me back</button>
              <button onClick={() => handleOption("reserve")}>
                🍽 Reserve a table
              </button>
              <button onClick={() => handleOption("availability")}>
                📅 Today’s availability
              </button>
              <button onClick={() => handleOption("other")}>❓ Help</button>
            </div>
          )}

          {/* Phone Input */}
          {expecting === "phone" && (
            <input
              autoFocus
              placeholder="Enter your phone number"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handlePhoneSubmit(
                    (e.target as HTMLInputElement).value
                  );
                }
              }}
              style={{
                marginTop: 8,
                padding: 8,
                borderRadius: 8,
                border: "1px solid #cbd5f5",
                backgroundColor: "#ffffff",
                color: "#000000",
                fontSize: 13}}
              />
          )}

          {/* Reservation Form */}
          {showReservationForm && (
            <form
              onSubmit={handleReservationSubmit}
              style={{ padding: 8,borderRadius: 8,border: "1px solid #cbd5f5",backgroundColor: "#ffffff",
                     color: "#000000",fontSize: 13 }}>
              <input name="name" placeholder="Your name" required />
              <input name="phone" placeholder="Phone number" required />
              <input type="date" name="date" required />
              <input type="time" name="time" required />
              <input name="guests" placeholder="Number of guests" required />
              <button type="submit">Submit Reservation</button>
            </form>
          )}
        </div>
      )}
    </>
  );
}