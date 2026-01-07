import { useDispatch, useSelector } from "react-redux";
import { openAuth, closeAuth } from "../../store/ui.slice";
import Login from "../../pages/auth/Login";

export default function Navbar() {
  const dispatch = useDispatch();
  const showAuth = useSelector((state) => state.ui.showAuth);

  return (
    <>
      <nav className="navbar">
        <div className="logo">Grab<span>X</span> Bots</div>

        <ul className="nav-links">
          <li><a href="/">Home</a></li>
          <li><a href="/bots">Bots</a></li>
          <li><a href="/custom-bot">Custom Python Bot</a></li>
          <li><a href="/dashboard">Dashboard</a></li>
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
