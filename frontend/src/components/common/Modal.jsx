import { createPortal } from "react-dom";

export default function Modal({ children, onClose }) {
  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(14,17,22,0.75)",
          backdropFilter: "blur(6px)",
          zIndex: 999
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "#141922",
          padding: "32px",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "420px",
          zIndex: 1000,
          boxShadow: "0 0 40px rgba(0,0,0,0.6)"
        }}
      >
        {children}
      </div>
    </>,
    document.body
  );
}
