# 🤖 BOBOLE-BOT  
Discord Bot Documentation

---

## 📌 How to Setup the Bot

1. **Create a Discord Application**  
   - Go to the [Discord Developer Portal](https://discord.com/developers/applications).  
   - Create a new application.  
   - Save your **Bot Token** and **Application ID**.  

2. **Install Node.js**  
   - Download and install [Node.js](https://nodejs.org/).  
   - Clone/download the bot repository to your local machine.  
   - Open a terminal inside the bot’s directory and run:  
     ```bash
     npm install
     ```

3. **Configure API Keys**  
   - Open your configuration file (e.g., `config.json`).  
   - Add your keys:  
     ```json
     {
       "token": "YOUR_DISCORD_BOT_TOKEN",
       "appId": "YOUR_APPLICATION_ID",
       "weatherApiKey": "WEATHER_API_KEY",
       "geminiApiKey": "GEMINI_API_KEY",
       "newsApiKey": "NEWS_API_KEY"
     }
     ```

4. **Run the Bot**  
   ```bash
   node index.js
   ```

## 🛠️ Available Commands

### 🔑 Admin
- ban.js → Ban a member  
- clear.js → Clear messages in a channel  
- clearuser.js → Clear messages from a specific user  
- kick.js → Kick a member  
- mpall.js → Send a DM to all members  
- mute.js → Mute a member  
- unban.js → Unban a user  
- unmute.js → Unmute a member  

### 🤖 AI
- ask.js → Ask the AI a question  

### 🎶 Radio
- radio.js → Play radio  
### 🧰 Utilities
- banner.js → Show a user’s banner  
- fake.js → Generate fake data  
- meteo.js → Get weather info  
- news.js → Show latest news  
- ping.js → Check bot latency  
- pp.js → Show a user’s profile picture  
- selfdeco.js → Self disconnect from voice channel  
- serverinfo.js → Show server information  
- tts.js → Convert text to speech  
- userinfo.js → Show user information  

---

## 📡 Bot Online Status
![Bot Status](https://discord.c99.nl/widget/theme-1/1246432025817256107.png)

---

