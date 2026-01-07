import { Routes, Route } from "react-router-dom";

import Home from "../pages/marketing/Home";
import Bots from "../pages/bots/Bots";
import BotDetail from "../pages/bots/BotDetail";
import CustomBot from "../pages/custom/CustomBot";
import Dashboard from "../pages/dashboard/Dashboard";
import Analytics from "../pages/dashboard/Analytics";
import Settings from "../pages/dashboard/Settings";
import NotFound from "../pages/NotFound";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
  <Route path="/bots" element={<Bots />} />
  <Route path="/bots/:id" element={<BotDetail />} />
  <Route path="/custom-bot" element={<CustomBot />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
