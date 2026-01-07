import React from "react";

export default function Header() {
  return (
    <header className="site-header">
      <div className="logo">Grab<span className="accent">X</span></div>

      <nav className="nav">
        <a href="/">Home</a>
        <a href="/strategy">Strategy</a>
        <a href="/dashboard">Dashboard</a>
        <button className="btn-ghost">Login</button>
      </nav>
    </header>
  );
}
