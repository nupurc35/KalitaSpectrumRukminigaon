// Shared types for ChatConcierge module

export type Message = {
    from: "bot" | "user";
    text: string;
};

export type ExpectingInput = null | "phone";

export type ChatState = {
    messages: Message[];
    expecting: ExpectingInput;
    showReservationForm: boolean;
};
