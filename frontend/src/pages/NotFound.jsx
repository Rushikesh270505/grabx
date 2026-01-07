export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0e1116",
        color: "#ffffff",
        textAlign: "center"
      }}
    >
      <h1 style={{ fontSize: "64px", marginBottom: "16px" }}>
        404
      </h1>

      <p style={{ fontSize: "22px", color: "#9aa1aa" }}>
        Page not found
      </p>
    </div>
  );
}
