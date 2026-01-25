const WHATSAPP_NUMBER = "918453708792"; 
const message =
  "Hi Kalita Spectrum 👋\n\n" +
  "I’d like to reserve a table.\n\n" +
  "Date:\n" +
  "Guests:\n" +
  "Occasion:";
const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  message
)}`;

export default function WhatsAppButton() {
  return (
    <a  href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        width: "56px",
        height: "56px",
        backgroundColor: "#25D366",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
        zIndex: 9999,
  }}>
   
     <img
        src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
        alt="WhatsApp"
        width="28"
        height="28"
      />
</a>
  );
}