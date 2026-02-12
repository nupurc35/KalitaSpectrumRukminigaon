// Chat controller - handles business logic for ChatConcierge

import React from "react";
import { createLead } from "@/services/leadService";
import { createReservation } from "@/services/reservationService";
import { BOT_MESSAGES } from "./prompts";
import type { Message } from "./types";

const WHATSAPP_NUMBER = "918453708792"; // 🔁 change if needed

/**
 * Opens WhatsApp with a pre-filled message
 */
export function openWhatsApp(message: string): void {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
}

/**
 * Handles phone number submission for callback requests
 * Validates and inserts into Supabase (in-chat flow, no WhatsApp redirect)
 */
export async function handlePhoneSubmit(
    rawPhone: string
): Promise<{ success: boolean; error?: string }> {
    const phone = rawPhone.replace(/\D/g, "");

    if (phone.length < 10) {
        return { success: false, error: "Invalid phone number" };
    }

    const { error } = await createLead({
        phone,
        intent: "callback",
        source: "chat_concierge",
    });

    if (error) {
        console.error("Lead insert failed:", error);
        return { success: false, error };
    }

    return { success: true };
}

/**
 * Handles option selection from quick options
 */
export function handleOption(
    option: "call" | "reserve" | "availability" | "other",
    pushUser: (text: string) => void,
    pushBot: (text: string) => void,
    setExpecting: (value: null | "phone") => void,
    setShowReservationForm: (value: boolean) => void
): void {
    if (option === "call") {
        pushUser("📞 Call me back");
        pushBot(BOT_MESSAGES.PHONE_REQUEST);
        setExpecting("phone");
    }

    if (option === "reserve") {
        pushUser("🍽 Reserve a table");
        pushBot(BOT_MESSAGES.RESERVATION_PROMPT);
        setShowReservationForm(true);
    }

    if (option === "availability") {
        pushUser("📅 Today's availability");
        pushBot(BOT_MESSAGES.AVAILABILITY_PROMPT);
        setExpecting("phone");
    }

    if (option === "other") {
        pushUser("❓ Ask something else");
        pushBot(BOT_MESSAGES.OTHER_HELP);
    }
}

/**
 * Handles reservation form submission from chat concierge
 * Saves to Supabase with status='confirmed' (no WhatsApp redirect)
 */
export async function handleReservationSubmit(
    e: React.FormEvent<HTMLFormElement>,
    setShowReservationForm: (value: boolean) => void
): Promise<{ success: boolean; error?: string }> {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    try {
        // Save to Supabase
        await createReservation({
            name: String(data.get("name") ?? "").trim(),
            phone: String(data.get("phone") ?? "").trim(),
            date: String(data.get("date") ?? ""),
            time: String(data.get("time") ?? ""),
            guests: Number(data.get("guests") ?? 0),
            status: "confirmed",
        });

        setShowReservationForm(false);
        return { success: true };
    } catch (error) {
        console.error("Reservation error:", error);
        return { success: false, error: "Reservation failed" };
    }
}

/**
 * Resets chat to initial state
 */
export function getInitialMessages(): Message[] {
    return [];
}
