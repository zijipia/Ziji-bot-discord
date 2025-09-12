# Overview

Zibot V7 is a comprehensive Discord bot built with Discord.js v14 and discord-player v7, designed to enhance Discord servers with music playback, moderation tools, games, and utility features. The bot supports multiple languages (Vietnamese and English), includes AI integration via Google's Gemini, and provides a web control interface for remote management.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Core Framework
- **Discord.js v14**: Main Discord API wrapper with full intent support for guilds, voice states, messages, and reactions
- **Discord-player v7**: Advanced music playback system with multiple extractors (YouTube, Spotify, SoundCloud)
- **Node.js**: Runtime environment with ES6+ features and async/await patterns

## Database Design
- **MongoDB with Mongoose**: Primary data storage using custom schemas for users, guilds, autoresponders, and welcome messages
- **File-based Storage**: JSON files for developer configurations and giveaway data
- **Schema Structure**: 
  - ZiUser: User profiles with XP, levels, coins, language preferences, and volume settings
  - ZiGuild: Server configurations including voice logging and join-to-create settings
  - ZiAutoresponder: Automated message responses with configurable trigger modes
  - ZiWelcome: Welcome/goodbye message system with custom channels and content

## Command Architecture
- **Slash Commands**: Modern Discord command system with autocomplete support
- **Context Menu Commands**: Right-click actions for messages and users
- **Subcommand Groups**: Organized command structure (play/next, play/assistant, etc.)
- **Permission System**: Role-based access control with owner-only commands
- **Cooldown Management**: Built-in rate limiting and spam protection

## Audio System
- **Multi-Platform Support**: YouTube, Spotify, SoundCloud, and custom extractors
- **Voice Recognition**: TTS integration and voice command processing (planned)
- **Queue Management**: Advanced playlist features with shuffle, repeat, and search
- **Audio Processing**: Volume control, filters, and real-time audio manipulation

## Moderation Features
- **Auto-moderation**: Automated response system with customizable triggers
- **Member Management**: Ban, kick, timeout functionality with audit logging
- **Message Control**: Bulk delete, content filtering
- **Welcome System**: Customizable member join/leave messages with image generation

## Gaming System
- **Mini-games**: Built-in games like 2048, Snake, TicTacToe, Blackjack, Slots
- **Economy System**: Coin-based rewards and betting mechanics
- **Leaderboards**: XP and level progression tracking
- **Statistics Tracking**: Game performance and user engagement metrics

## Web Interface
- **Express.js Server**: RESTful API for remote bot control
- **Real-time Communication**: WebSocket support for live updates
- **CORS Configuration**: Cross-origin resource sharing for web clients
- **Ngrok Integration**: Secure tunneling for development and testing

## Localization
- **Multi-language Support**: Vietnamese (primary) and English
- **Dynamic Language Loading**: Runtime language switching per user
- **Configurable Responses**: Customizable message templates and error handling

## Worker Threads
- **Image Processing**: Dedicated workers for card generation (rankings, quotes, music search)
- **Performance Optimization**: Non-blocking image generation using Canvas and Sharp
- **Memory Management**: Isolated processes for resource-intensive operations

## Configuration Management
- **Environment Variables**: Secure token and API key management
- **Runtime Configuration**: Hot-reloadable settings without restarts
- **Feature Toggles**: Conditional feature enablement based on environment

# External Dependencies

## Core Dependencies
- **Discord.js v14**: Discord API client library
- **discord-player v7**: Music playback framework
- **@discordjs/voice**: Voice connection management
- **mongoose**: MongoDB object modeling

## Music Extractors
- **@discord-player/extractor**: Official extractors package
- **discord-player-youtubei**: YouTube integration
- **@zibot/ziextractor**: Custom audio extractors
- **youtubei.js**: YouTube data fetching

## AI and Language Processing
- **@google/generative-ai**: Google Gemini AI integration
- **@iamtraction/google-translate**: Translation services

## Image and Media Processing
- **canvacord**: Canvas-based image generation
- **sharp**: High-performance image processing
- **ffmpeg-static**: Audio/video processing

## Web and Networking
- **express**: Web server framework
- **cors**: Cross-origin resource sharing
- **ngrok**: Secure tunneling service
- **ws**: WebSocket implementation

## Utilities and Tools
- **winston**: Advanced logging system
- **node-cron**: Scheduled task management
- **simple-git**: Git operations and updates
- **chalk**: Terminal output styling

## Database and Storage
- **MongoDB**: Primary database system
- **@zibot/db**: Custom database utilities

## Gaming and Entertainment
- **discord-gamecord**: Game integration library
- **txtgen**: Text generation utilities
- **makeitaquote**: Quote image generation

## Development Tools
- **nodemon**: Development server with hot reload
- **prettier**: Code formatting
- **dotenv**: Environment variable management