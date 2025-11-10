# 🏥 Hormone Final - Expo Mobile App

A React Native mobile application built with Expo and integrated with Supabase backend.

## 🚀 Features

- ✅ Expo React Native setup
- ✅ Supabase integration with authentication
- ✅ Secure environment configuration
- ✅ AsyncStorage for data persistence
- ✅ Connection status monitoring

## 📦 Installation

```bash
npm install
```

## 🔧 Configuration

### Supabase Credentials

The app is configured with the following Supabase project:

- **Project ID**: xyxhvvpyyfgwssimntxs
- **Project URL**: https://xyxhvvpyyfgwssimntxs.supabase.co
- **Anon Key**: Configured in `lib/supabase.js`

### Environment Variables

Environment variables are stored in `.env` (not committed to git):

```env
EXPO_PUBLIC_SUPABASE_URL=https://xyxhvvpyyfgwssimntxs.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 🏃 Running the App

### Start Development Server
```bash
npm start
```

### Run on iOS
```bash
npm run ios
```

### Run on Android
```bash
npm run android
```

### Run on Web
```bash
npm run web
```

### Using Expo Go App
1. Install "Expo Go" on your mobile device
2. Run `npm start`
3. Scan the QR code with your device

## 📁 Project Structure

```
hormonefinal/
├── App.js              # Main application component
├── lib/
│   └── supabase.js     # Supabase client configuration
├── assets/             # App icons and images
├── package.json        # Dependencies
├── app.json           # Expo configuration
└── .env               # Environment variables (gitignored)
```

## 🔐 Security Notes

- Service role key should NEVER be used in client-side code
- The anon key is safe for client-side use (respects Row Level Security)
- `.env` file is gitignored to protect credentials

## 📱 Supabase Integration

The app includes:
- Supabase client setup with proper React Native configuration
- AsyncStorage for session persistence
- Auto token refresh
- Connection status checking
- Test query functionality

## 🛠️ Tech Stack

- **Frontend**: React Native (Expo)
- **Backend**: Supabase
- **Storage**: AsyncStorage
- **Authentication**: Supabase Auth

## 📞 Supabase MCP Communication

To enable MCP (Model Context Protocol) communication with Supabase in Cursor:

1. **Install Supabase MCP Server** (if not already installed):
   ```bash
   npm install -g @supabase/mcp-server
   ```

2. **Configure in Cursor Settings**:
   Add to your Cursor MCP settings (`~/.cursor/mcp.json` or through UI):
   ```json
   {
     "mcpServers": {
       "supabase": {
         "command": "npx",
         "args": ["@supabase/mcp-server"],
         "env": {
           "SUPABASE_URL": "https://xyxhvvpyyfgwssimntxs.supabase.co",
           "SUPABASE_SERVICE_ROLE_KEY": "your_service_role_key"
         }
       }
     }
   }
   ```

This allows the AI assistant to directly interact with your Supabase database!

## 🎯 Next Steps

- Set up database schema in Supabase
- Implement authentication screens
- Create data models for hormone tracking
- Build UI components
- Add navigation

## 📝 License

Private Project

