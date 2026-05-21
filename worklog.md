---
Task ID: 1
Agent: Main Agent
Task: Fix WhatsApp Coach chat sync and UI scroll issues

Work Log:
- Cloned repo and investigated the chat sync issue
- Found ROOT CAUSE: Baileys fires 'messaging-history.set' event for chat list sync, NOT 'chats.upsert' which only fires for group creation
- Added 'messaging-history.set' event listener to server.js that processes chats, contacts, and messages from history sync
- Added 'contacts.upsert' and 'contacts.update' listeners for chat name resolution
- Added contacts Map to connection data structure
- Enabled syncFullHistory: true on makeWASocket config for full history sync
- Added historySyncConfig with maxInitialHistorySync: 100 and maxHistorySync: 500
- Preserved contacts Map across reconnections
- Added whatsapp:sync-progress event to notify frontend of sync progress
- Fixed UI scroll issues: added flex-shrink: 0 to chat header, signals bar, and input area
- Added min-height: 0 to wa-chat-list for proper flex scroll behavior
- Removed max-height: 50vh from select-chats-list that was limiting chat list display
- Added sync progress indicator in sidebar
- Deployed to Railway as v2.4.0, confirmed running
- Pushed frontend fixes to GitHub for Vercel auto-deploy

Stage Summary:
- ROOT CAUSE of chat sync: missing 'messaging-history.set' event listener (Baileys' primary chat sync event)
- Server v2.4.0 deployed to Railway with chat sync fix
- Frontend scroll fixes and sync progress indicator pushed to GitHub
- Backend confirmed running at https://whatsapp-coach-production-5a6a.up.railway.app/health
- Frontend at https://teamalliance.vercel.app
