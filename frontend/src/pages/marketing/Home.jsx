 import React from "react";
 import { Link } from "react-router-dom";
 
 export default function Home() {
   return (
     <div style={{ padding: 24, color: "#fff" }}>
       <div className="glass-panel" style={{ textAlign: "center" }}>
         <h1 style={{ marginTop: 0, fontSize: 52, marginBottom: 12 }}>
           Grab<span className="x">X</span>
         </h1>
         <p style={{ margin: 0, color: "#cfd3d8", fontSize: 18 }}>
           Trading bots, real-time prices, and strategy controls.
         </p>
         <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 18 }}>
           <Link className="cta-btn" to="/bots">Explore Bots</Link>
           <Link
             className="cta-btn"
             to="/custom-bot"
             style={{ background: "transparent", border: "1px solid rgba(93,169,255,0.3)", color: "#5da9ff" }}
           >
             Build Custom Bot
           </Link>
         </div>
       </div>
     </div>
   );
 }
