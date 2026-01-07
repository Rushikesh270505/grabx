import { useDispatch, useSelector } from "react-redux";
import { closeAuth } from "../../store/ui.slice";
import { loginUser } from "../../store/auth.slice";
import { useState } from "react";

export default function AuthModal() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = () => {
    dispatch(loginUser({ email, password }))
      .unwrap()
      .then(() => dispatch(closeAuth()));
  };

  return (
    <div className="auth-modal" onClick={() => dispatch(closeAuth())}>
      <div className="auth-box" onClick={e => e.stopPropagation()}>
        <h2>Welcome to <span>GrabX</span></h2>
        <p className="subtitle">Access your market edge</p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button onClick={submit} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}

