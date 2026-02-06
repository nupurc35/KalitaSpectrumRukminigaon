// Chat controller - handles business logic for ChatConcierge

import React from "react";
import { supabase } from "../../../lib/superbase";
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

    // 🔹 INSERT INTO SUPABASE
    const { error } = await supabase.from("leads").insert({
        restaurant_id: import.meta.env.VITE_RESTAURANT_ID,
        phone: phone,
        intent: "callback",
        source: "chat_concierge"
    });

    if (error) {
        console.error("Supabase insert failed:", error);
        return { success: false, error: "Request failed" };
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
        const { error } = await supabase.from("reservations").insert({
            restaurant_id: import.meta.env.VITE_RESTAURANT_ID,
            name: data.get("name"),
            phone: data.get("phone"),
            date: data.get("date"),
            time: data.get("time"),
            guests: Number(data.get("guests")),
            status: "confirmed",
            created_at: new Date().toISOString()
        });

        if (error) {
            console.error("Reservation insert failed:", error);
            return { success: false, error: "Reservation failed" };
        }

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
