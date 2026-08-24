const express = require('express');
const axios = require('axios');
const app = express();

app.get('/api/get-user-passes', async (req, res) => {
    const username = req.query.username;
    if (!username) return res.json({ success: false });

    try {
        const userRes = await axios.post('https://users.roproxy.com/v1/usernames/users', {
            usernames: [username],
            excludeBannedUsers: true
        });

        if (!userRes.data.data || userRes.data.data.length === 0) {
            return res.json({ success: false, error: "User not found" });
        }
        const userId = userRes.data.data[0].id;

        const gamesRes = await axios.get(`https://games.roproxy.com/v2/users/${userId}/games?accessFilter=2&limit=1`);
        if (!gamesRes.data.data || gamesRes.data.data.length === 0) {
            return res.json({ success: false, error: "No public games" });
        }
        const universeId = gamesRes.data.data[0].id;

        const detailsRes = await axios.get(`https://games.roproxy.com/v1/games?universeIds=${universeId}`);
        const rootPlaceId = detailsRes.data.data[0].rootPlaceId;

        return res.json({
            success: true,
            placeId: rootPlaceId
        });

    } catch (error) {
        console.error("API Error Details:", error.response?.data || error.message);
        return res.json({ 
            success: false, 
            error: error.response?.data ? JSON.stringify(error.response.data) : error.message 
        });
    }
});

// Use the port assigned by the hosting container or fallback to 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
