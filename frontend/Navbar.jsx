import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { openAuth } from "../../store/ui.slice";
import { logout } from "../../store/auth.slice";

export default function Navbar() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);

  return (
    <nav className="navbar">
      <div className="logo">
        Grab<span>X</span>
        <span
          style={{
            fontSize: "14px",
            marginLeft: "12px",
            color: "#9aa1aa",
            fontWeight: "500"
          }}
        >
          Earn more by taking risk
        </span>
      </div>

      <ul className="nav-links">
        <li>
          <Link to="/">Home</Link>
        </li>

        <li>
          <Link to="/strategy">Strategy</Link>
        </li>

        <li>
          <Link to="/dashboard">Dashboard</Link>
        </li>

        {!token ? (
          <li>
            <button
              className="btn"
              onClick={() => dispatch(openAuth())}
            >
              Login
            </button>
          </li>
        ) : (
          <li>
            <button
              className="btn"
              onClick={() => dispatch(logout())}
            >
              Logout
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}

