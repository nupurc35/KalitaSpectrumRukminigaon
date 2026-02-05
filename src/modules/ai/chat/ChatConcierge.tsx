import { useState } from "react";
import type { Message } from "./types";
import {
    handlePhoneSubmit,
    handleOption,
    handleReservationSubmit,
    getInitialMessages
} from "./chat.controller";

export default function ChatConcierge() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>(getInitialMessages());
    const [expecting, setExpecting] = useState<null | "phone">(null);
    const [showReservationForm, setShowReservationForm] = useState(false);

    const pushUser = (text: string) =>
        setMessages((prev) => [...prev, { from: "user", text }]);

    const pushBot = (text: string) =>
        setMessages((prev) => [...prev, { from: "bot", text }]);

    const onPhoneSubmit = async (rawPhone: string) => {
        const result = await handlePhoneSubmit(rawPhone, pushUser, pushBot);
        if (result.success) {
            setExpecting(null);
        }
    };

    const onOptionSelect = (option: "call" | "reserve" | "availability" | "other") => {
        handleOption(option, pushUser, pushBot, setExpecting, setShowReservationForm);
    };

    const onReservationSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        handleReservationSubmit(e, pushBot, setShowReservationForm);
    };

    const resetChat = () => {
        setMessages(getInitialMessages());
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
                    zIndex: 1000
                }}
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
                        border: "1px solid rgba(255,255,255,0.08)"
                    }}
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

                    {/* Start Over Button */}
                    {messages.length > 1 && (
                        <button
                            onClick={resetChat}
                            style={{
                                background: "transparent",
                                color: "#93c5fd",
                                border: "none",
                                cursor: "pointer",
                                fontSize: 12,
                                marginBottom: 6,
                                alignSelf: "flex-start"
                            }}
                        >
                            ⬅ Start over
                        </button>
                    )}

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
                                }}
                            >
                                <span
                                    style={{
                                        display: "inline-block",
                                        padding: "6px 10px",
                                        borderRadius: 8,
                                        background: m.from === "user" ? "#1e293b" : "#020617"
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
                            <button onClick={() => onOptionSelect("call")}>📞 Call me back</button>
                            <button onClick={() => onOptionSelect("reserve")}>
                                🍽 Reserve a table
                            </button>
                            <button onClick={() => onOptionSelect("availability")}>
                                📅 Today's availability
                            </button>
                            <button onClick={() => onOptionSelect("other")}>❓ Help</button>
                        </div>
                    )}

                    {/* Phone Input */}
                    {expecting === "phone" && (
                        <input
                            autoFocus
                            placeholder="Enter your phone number"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    onPhoneSubmit((e.target as HTMLInputElement).value);
                                }
                            }}
                            style={{
                                marginTop: 8,
                                padding: 8,
                                borderRadius: 8,
                                border: "1px solid #cbd5f5",
                                backgroundColor: "#ffffff",
                                color: "#000000",
                                fontSize: 13
                            }}
                        />
                    )}

                    {/* Reservation Form */}
                    {showReservationForm && (
                        <form
                            onSubmit={onReservationSubmit}
                            style={{
                                padding: 8,
                                borderRadius: 8,
                                border: "1px solid #cbd5f5",
                                backgroundColor: "#ffffff",
                                color: "#000000",
                                fontSize: 13
                            }}
                        >
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
