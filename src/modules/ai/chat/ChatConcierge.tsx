import { useRef, useState } from "react";
import { handlePhoneSubmit, handleReservationSubmit } from "./chat.controller";

type Mode = "home" | "call" | "reserve" | "done";

export default function ChatConcierge() {
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<Mode>("home");
    const [doneMessage, setDoneMessage] = useState("");

    const [phoneInput, setPhoneInput] = useState("");
    const [reservationName, setReservationName] = useState("");
    const [reservationPhone, setReservationPhone] = useState("");
    const [reservationDate, setReservationDate] = useState("");
    const [reservationTime, setReservationTime] = useState("");
    const [reservationGuests, setReservationGuests] = useState("");
    const [isReservationSubmitHover, setIsReservationSubmitHover] = useState(false);

    const reservationFormRef = useRef<HTMLFormElement | null>(null);

    const isPhoneValid = phoneInput.replace(/\D/g, "").length >= 10;
    const reservationPhoneDigits = reservationPhone.replace(/\D/g, "");
    const isReservationPhoneValid = reservationPhoneDigits.length >= 10;
    const reservationGuestsCount = Number(reservationGuests);
    const isReservationGuestsValid =
        reservationGuests.trim() !== "" &&
        !Number.isNaN(reservationGuestsCount) &&
        reservationGuestsCount > 0;
    const isReservationReady =
        reservationName.trim() !== "" &&
        isReservationPhoneValid &&
        reservationDate.trim() !== "" &&
        reservationTime.trim() !== "" &&
        isReservationGuestsValid;

    const timeSlots = (() => {
        const slots: string[] = [];
        for (let hour = 12; hour < 22; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeString = `${hour.toString().padStart(2, "0")}:${minute
                    .toString()
                    .padStart(2, "0")}`;
                slots.push(timeString);
            }
        }
        slots.push("22:00");
        return slots;
    })();

    const formatTimeLabel = (time: string): string => {
        if (!time) return "";
        const [hours, minutes] = time.split(":");
        const hour = Number(hours);
        const ampm = hour >= 12 ? "PM" : "AM";
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const resetChat = () => {
        setMode("home");
        setDoneMessage("");
        setPhoneInput("");
        setReservationName("");
        setReservationPhone("");
        setReservationDate("");
        setReservationTime("");
        setReservationGuests("");
        setIsReservationSubmitHover(false);
    };

    const onCallClick = () => {
        setPhoneInput("");
        setMode("call");
    };

    const onReserveClick = () => {
        setReservationName("");
        setReservationPhone("");
        setReservationDate("");
        setReservationTime("");
        setReservationGuests("");
        setIsReservationSubmitHover(false);
        setMode("reserve");
    };

    const onPhoneSubmit = async () => {
        if (!isPhoneValid) {
            return;
        }
        const result = await handlePhoneSubmit(phoneInput);
        if (result.success) {
            setPhoneInput("");
            setDoneMessage("Request Sent Successfully. Our team will call you back shortly.");
            setMode("done");
        } else {
            alert(result.error || "Request failed");
        }
    };

    const onReservationSubmit = async () => {
        if (!isReservationReady || !reservationFormRef.current) {
            return;
        }
        const syntheticEvent = {
            preventDefault: () => {},
            currentTarget: reservationFormRef.current
        } as React.FormEvent<HTMLFormElement>;

        const result = await handleReservationSubmit(
            syntheticEvent,
            () => {}
        );

        if (result.success) {
            setDoneMessage("Your table is confirmed! 🎉 We look forward to serving you 🙏");
            setMode("done");
        } else {
            alert(result.error || "Reservation failed");
        }
    };

    const inputStyle = {
        width: "100%",
        height: 46,
        padding: "10px 12px",
        borderRadius: 8,
        border: "1px solid #cbd5f5",
        backgroundColor: "#ffffff",
        color: "#0f172a",
        fontSize: 13,
        fontWeight: 600
    };

    const lightLabelStyle = {
        fontSize: 12,
        fontWeight: 600,
        color: "#e2e8f0"
    };

    const darkLabelStyle = {
        fontSize: 12,
        fontWeight: 600,
        color: "#0f172a"
    };

    return (
        <>
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
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                            marginBottom: 8
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center"
                            }}
                        >
                            <button
                                onClick={resetChat}
                                style={{
                                    background: "#f59e0b",
                                    color: "#0f172a",
                                    border: "1px solid #fbbf24",
                                    borderRadius: 4,
                                    cursor: "pointer",
                                    fontSize: 12,
                                    fontWeight: 600,
                                    padding: "6px 10px",
                                    boxShadow: "0 6px 14px rgba(245, 158, 11, 0.35)"
                                }}
                            >
                                ← Back to Home
                            </button>

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

                        <strong style={{ fontSize: 14 }}>Kalita Concierge</strong>
                    </div>

                    <div
                        style={{
                            flex: 1,
                            overflowY: "auto",
                            marginBottom: 8,
                            paddingRight: 4
                        }}
                    >
                        {mode === "home" && (
                            <div style={{ display: "grid", gap: 8 }}>
                                <button onClick={onCallClick}>📞 Call me back</button>
                                <button onClick={onReserveClick}>🍽 Reserve a table</button>
                            </div>
                        )}

                        {mode === "call" && (
                            <div style={{ display: "grid", gap: 10, marginTop: 8 }}>
                                <label style={lightLabelStyle} htmlFor="concierge-phone">
                                    Phone Number
                                </label>
                                <input
                                    id="concierge-phone"
                                    autoFocus
                                    placeholder="Enter your phone number"
                                    value={phoneInput}
                                    onChange={(e) => setPhoneInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && isPhoneValid) {
                                            onPhoneSubmit();
                                        }
                                    }}
                                    style={inputStyle}
                                />
                                <button
                                    type="button"
                                    onClick={onPhoneSubmit}
                                    disabled={!isPhoneValid}
                                    style={{
                                        padding: "8px 12px",
                                        borderRadius: 8,
                                        border: "1px solid #e2e8f0",
                                        backgroundColor: isPhoneValid ? "#0ea5e9" : "#94a3b8",
                                        color: "#ffffff",
                                        fontSize: 13,
                                        fontWeight: 600,
                                        cursor: isPhoneValid ? "pointer" : "not-allowed"
                                    }}
                                >
                                    Submit
                                </button>
                            </div>
                        )}

                        {mode === "reserve" && (
                            <form
                                ref={reservationFormRef}
                                onSubmit={(e) => e.preventDefault()}
                                style={{
                                    marginTop: 8,
                                    padding: 8,
                                    borderRadius: 8,
                                    border: "1px solid #cbd5f5",
                                    backgroundColor: "#ffffff",
                                    color: "#000000",
                                    fontSize: 13,
                                    display: "grid",
                                    gap: 10
                                }}
                            >
                                <label style={darkLabelStyle} htmlFor="concierge-res-name">Your Name</label>
                                <input
                                    id="concierge-res-name"
                                    name="name"
                                    placeholder="Full name"
                                    required
                                    value={reservationName}
                                    onChange={(e) => setReservationName(e.target.value)}
                                    style={inputStyle}
                                />
                                <label style={darkLabelStyle} htmlFor="concierge-res-phone">Phone Number</label>
                                <input
                                    id="concierge-res-phone"
                                    name="phone"
                                    placeholder="Phone number"
                                    required
                                    value={reservationPhone}
                                    onChange={(e) => setReservationPhone(e.target.value)}
                                    style={inputStyle}
                                />
                                <label style={darkLabelStyle} htmlFor="concierge-res-date">Reservation Date</label>
                                <input
                                    id="concierge-res-date"
                                    type="date"
                                    name="date"
                                    required
                                    value={reservationDate}
                                    onChange={(e) => setReservationDate(e.target.value)}
                                    style={inputStyle}
                                />
                                <label style={darkLabelStyle} htmlFor="concierge-res-time">Select Time</label>
                                <select
                                    id="concierge-res-time"
                                    name="time"
                                    required
                                    value={reservationTime}
                                    onChange={(e) => setReservationTime(e.target.value)}
                                    style={inputStyle}
                                >
                                    <option value="">Select Time</option>
                                    {timeSlots.map((time) => (
                                        <option key={time} value={time}>
                                            {formatTimeLabel(time)}
                                        </option>
                                    ))}
                                </select>
                                <label style={darkLabelStyle} htmlFor="concierge-res-guests">Number of Guests</label>
                                <input
                                    id="concierge-res-guests"
                                    type="number"
                                    name="guests"
                                    placeholder="Number of guests"
                                    required
                                    value={reservationGuests}
                                    onChange={(e) => setReservationGuests(e.target.value)}
                                    style={inputStyle}
                                />
                            </form>
                        )}

                        {mode === "done" && (
                            <div
                                style={{
                                    marginTop: 8,
                                    padding: 10,
                                    borderRadius: 8,
                                    backgroundColor: "rgba(16, 185, 129, 0.12)",
                                    border: "1px solid rgba(16, 185, 129, 0.4)",
                                    color: "#bbf7d0",
                                    fontSize: 13,
                                    fontWeight: 600
                                }}
                            >
                                {doneMessage}
                            </div>
                        )}
                    </div>

                    {mode === "reserve" && (
                        <div
                            style={{
                                paddingTop: 8,
                                borderTop: "1px solid rgba(148, 163, 184, 0.3)",
                                background: "#0b1220"
                            }}
                        >
                            <button
                                type="button"
                                onClick={onReservationSubmit}
                                disabled={!isReservationReady}
                                onMouseEnter={() => {
                                    if (isReservationReady) {
                                        setIsReservationSubmitHover(true);
                                    }
                                }}
                                onMouseLeave={() => setIsReservationSubmitHover(false)}
                                style={{
                                    width: "100%",
                                    height: 52,
                                    borderRadius: 8,
                                    border: "none",
                                    backgroundColor: !isReservationReady
                                        ? "#94a3b8"
                                        : isReservationSubmitHover
                                            ? "#d97706"
                                            : "#f59e0b",
                                    color: "#ffffff",
                                    fontSize: 16,
                                    fontWeight: 700,
                                    cursor: isReservationReady ? "pointer" : "not-allowed",
                                    boxShadow: "0 10px 18px rgba(245, 158, 11, 0.35)",
                                    transition: "background-color 0.2s ease, transform 0.2s ease"
                                }}
                            >
                                Submit Reservation
                            </button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
