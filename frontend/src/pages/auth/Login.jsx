import Modal from "../../components/common/Modal";
import { useDispatch } from "react-redux";
import { closeAuth } from "../../store/ui.slice";

export default function Login() {
  const dispatch = useDispatch();

  return (
    <Modal onClose={() => dispatch(closeAuth())}>
      <h2 style={{ marginBottom: "10px" }}>Welcome to GrabX</h2>
      <p style={{ marginBottom: "20px", color: "#9aa1aa" }}>
        Access your market edge
      </p>

      <input
        placeholder="Email"
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "12px",
          borderRadius: "8px",
          border: "1px solid #2a2f36",
          background: "#0e1116",
          color: "#fff"
        }}
      />

      <input
        type="password"
        placeholder="Password"
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "16px",
          borderRadius: "8px",
          border: "1px solid #2a2f36",
          background: "#0e1116",
          color: "#fff"
        }}
      />

      <button
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "10px",
          border: "none",
          background: "#5da9ff",
          color: "#0e1116",
          fontWeight: "700",
          cursor: "pointer"
        }}
      >
        Login
      </button>
    </Modal>
  );
}
