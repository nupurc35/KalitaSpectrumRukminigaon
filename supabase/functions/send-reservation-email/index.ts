import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

type ReservationEmailPayload = {
  reservationId?: string | null;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  restaurantName: string;
  restaurantPhone?: string;
  reservationDate: string;
  reservationTime: string;
  reservationGuests: number;
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RESEND_FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL");
const RESEND_ADMIN_EMAIL = Deno.env.get("RESEND_ADMIN_EMAIL");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const sendEmail = async (payload: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) => {
  if (!RESEND_API_KEY) {
    throw new Error("Missing RESEND_API_KEY");
  }
  if (!RESEND_FROM_EMAIL) {
    throw new Error("Missing RESEND_FROM_EMAIL");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: RESEND_FROM_EMAIL,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "Email send failed");
    throw new Error(text);
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ success: false, error: "Method not allowed" }, 405);
  }

  if (!RESEND_ADMIN_EMAIL) {
    return jsonResponse({ success: false, error: "Missing RESEND_ADMIN_EMAIL" }, 500);
  }

  let payload: ReservationEmailPayload | null = null;
  try {
    payload = (await req.json()) as ReservationEmailPayload;
  } catch {
    return jsonResponse({ success: false, error: "Invalid JSON payload" }, 400);
  }

  if (
    !payload ||
    !payload.customerEmail ||
    !payload.customerName ||
    !payload.customerPhone ||
    !payload.restaurantName ||
    !payload.reservationDate ||
    !payload.reservationTime ||
    !payload.reservationGuests
  ) {
    return jsonResponse({ success: false, error: "Missing required fields" }, 400);
  }

  if (!isEmail(payload.customerEmail)) {
    return jsonResponse({ success: false, error: "Invalid customer email" }, 400);
  }

  const reservationDetails = `
Reservation ID: ${payload.reservationId ?? "N/A"}
Name: ${payload.customerName}
Email: ${payload.customerEmail}
Phone: ${payload.customerPhone}
Date: ${payload.reservationDate}
Time: ${payload.reservationTime}
Guests: ${payload.reservationGuests}
`.trim();

  const customerSubject = `Your reservation is confirmed at ${payload.restaurantName}`;
  const customerHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <h2 style="margin: 0 0 12px;">Reservation Confirmed</h2>
      <p>Hello ${payload.customerName},</p>
      <p>Your table has been confirmed at <strong>${payload.restaurantName}</strong>.</p>
      <div style="background:#f9fafb; padding:16px; border-radius:12px; margin:16px 0;">
        <p><strong>Date:</strong> ${payload.reservationDate}</p>
        <p><strong>Time:</strong> ${payload.reservationTime}</p>
        <p><strong>Guests:</strong> ${payload.reservationGuests}</p>
      </div>
      <p>If you need to make changes, please contact us at ${payload.restaurantPhone ?? "the restaurant"}.</p>
      <p>We look forward to serving you.</p>
    </div>
  `;
  const customerText = `Reservation Confirmed\n\n${payload.customerName}, your table is confirmed at ${payload.restaurantName}.\nDate: ${payload.reservationDate}\nTime: ${payload.reservationTime}\nGuests: ${payload.reservationGuests}\nContact: ${payload.restaurantPhone ?? "N/A"}`;

  const adminSubject = `New reservation: ${payload.customerName} (${payload.reservationDate} ${payload.reservationTime})`;
  const adminHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <h2 style="margin: 0 0 12px;">New Reservation</h2>
      <div style="background:#f9fafb; padding:16px; border-radius:12px; margin:16px 0;">
        <p><strong>Name:</strong> ${payload.customerName}</p>
        <p><strong>Email:</strong> ${payload.customerEmail}</p>
        <p><strong>Phone:</strong> ${payload.customerPhone}</p>
        <p><strong>Date:</strong> ${payload.reservationDate}</p>
        <p><strong>Time:</strong> ${payload.reservationTime}</p>
        <p><strong>Guests:</strong> ${payload.reservationGuests}</p>
        <p><strong>Reservation ID:</strong> ${payload.reservationId ?? "N/A"}</p>
      </div>
    </div>
  `;
  const adminText = `New Reservation\n\n${reservationDetails}`;

  try {
    await Promise.all([
      sendEmail({
        to: payload.customerEmail,
        subject: customerSubject,
        html: customerHtml,
        text: customerText,
      }),
      sendEmail({
        to: RESEND_ADMIN_EMAIL,
        subject: adminSubject,
        html: adminHtml,
        text: adminText,
      }),
    ]);
  } catch (error) {
    console.error("Resend email error:", error);
    return jsonResponse({ success: false, error: "Email send failed" }, 502);
  }

  return jsonResponse({ success: true });
});
