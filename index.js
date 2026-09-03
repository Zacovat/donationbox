/*
  registration-backend-example.js

  Replaces the Open Cloud inventory check entirely. Connectors register
  themselves here on startup (plain HTTP, no Roblox credential involved);
  the hub asks here instead of asking Roblox.

  Registrations go stale after 24h with no re-registration, so a place
  that stops running servers naturally falls out of "installed" without
  needing an explicit unregister step -- every live server re-registers on
  its own boot, so an active place stays fresh automatically.

  In-memory storage -- swap for a real database before relying on this
  long-term, a restart currently forgets every registration (which just
  means a brief gap until connector servers next boot and re-register,
  not data loss that matters).
*/

const express = require("express");
const app = express();
app.use(express.json());

const STALE_MS = 24 * 60 * 60 * 1000; // 24 hours
const registered = new Map(); // universeId -> { registeredAt }

app.post("/api/register", (req, res) => {
	const { universeId } = req.body || {};
	if (!universeId) {
		return res.status(400).json({ ok: false });
	}
	registered.set(String(universeId), { registeredAt: Date.now() });
	return res.json({ ok: true });
});

app.get("/api/check", (req, res) => {
	const { universeId } = req.query;
	const record = registered.get(String(universeId));
	const installed = Boolean(record) && Date.now() - record.registeredAt < STALE_MS;
	return res.json({ installed });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
