import React from "react";
import LiveFeed from "../components/LiveFeed";
import AlertsPanel from "../components/AlertsPanel";
import Analytics from "../components/Analytics";

export default function Dashboard() {
  return (
    <div style={{ padding: "20px" }}>
      <h2>Dashboard</h2>

      <LiveFeed />
      <AlertsPanel />
      <Analytics />
    </div>
  );
}
