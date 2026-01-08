import { useDispatch, useSelector } from "react-redux";
import { openAuth, closeAuth } from "../../store/ui.slice";
import Login from "../../pages/auth/Login";
import { Link } from "react-router-dom";

export default function Navbar() {
  const dispatch = useDispatch();
  const showAuth = useSelector((state) => state.ui.showAuth);

  return (
    <>
      <nav className="navbar">
        <div className="logo">Grab<span>X</span> Bots</div>

        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/bots">Bots</Link></li>
          <li><Link to="/custom-bot">Custom Python Bot</Link></li>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li>
            <button className="btn" onClick={() => dispatch(openAuth())}>
              Login
            </button>
          </li>
        </ul>
      </nav>

      {/* AUTH MODAL */}
      {showAuth && <Login />}
    </>
  );
}
