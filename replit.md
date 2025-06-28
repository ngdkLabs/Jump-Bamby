# Pixel Platformer

## Overview

This is a pixel art platformer game built with React, TypeScript, and HTML5 Canvas. The application uses a modern full-stack architecture with Express.js backend, React frontend, and PostgreSQL database integration through Drizzle ORM. The game features a retro-style 2D platformer with collectible coins, multiple platform types, and responsive controls including virtual controls for mobile devices.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: TailwindCSS with Radix UI components for modern UI elements
- **Game Engine**: Custom HTML5 Canvas-based game engine
- **State Management**: Zustand for both game state and audio management
- **Build Tool**: Vite with React plugin
- **3D Support**: React Three Fiber integration (though primarily used for 2D game)

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: connect-pg-simple for PostgreSQL session storage
- **Development**: Hot module reloading with Vite middleware integration

### Game Architecture
- **Canvas Rendering**: Custom pixel-perfect rendering system
- **Physics Engine**: Custom collision detection and physics simulation
- **Input System**: Unified input manager supporting keyboard and virtual controls
- **Audio System**: HTML5 Audio API integration with mute/unmute functionality
- **Level System**: Procedural level generation with platforms and collectibles

## Key Components

### Game Engine Components
1. **GameEngine**: Main game loop and render management
2. **Player**: Character controller with physics and animations
3. **Level**: Platform and coin management system
4. **CollisionManager**: AABB collision detection system
5. **InputManager**: Cross-platform input handling

### UI Components
1. **GameCanvas**: HTML5 Canvas wrapper component
2. **MainMenu**: Game start screen with branding
3. **GameUI**: In-game HUD showing score and lives
4. **VirtualControls**: Touch-based controls for mobile devices

### State Management
1. **useGameStore**: Game state (score, lives, game phase)
2. **useAudio**: Audio management and mute controls
3. **useGame**: Core game phase management

## Data Flow

1. **Game Initialization**: Canvas setup → Game engine creation → Input system initialization
2. **Game Loop**: Input processing → Physics update → Collision detection → Rendering
3. **State Updates**: Game events → Zustand store updates → UI re-renders
4. **Audio Events**: Game actions → Audio store → Sound playback (if not muted)

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **zustand**: Lightweight state management

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **tailwindcss**: Utility-first CSS framework
- **eslint**: Code linting and formatting

### Game-Specific Dependencies
- **@react-three/fiber**: 3D rendering capabilities
- **@react-three/drei**: 3D utilities and helpers
- **nanoid**: Unique ID generation

## Deployment Strategy

### Development Environment
- Vite development server with HMR
- Express middleware integration for API routes
- Hot reloading for both frontend and backend code

### Production Build
- **Frontend**: Vite static build to `dist/public`
- **Backend**: ESBuild bundling to `dist/index.js`
- **Database**: Drizzle migrations with PostgreSQL

### Environment Configuration
- Database URL configuration via environment variables
- Separate development and production database instances
- Static asset serving from Express in production

Changelog:
- June 28, 2025. Initial setup
- June 28, 2025. Added heart-shaped lives display, game timer, double jump functionality
- June 28, 2025. Implemented infinite level generation with procedural obstacles

## Recent Features Added

### Heart Lives Display
- Visual heart-shaped indicators showing remaining lives (3 total)
- Red hearts for active lives, transparent for lost lives

### Game Timer
- Displays current game time in MM:SS format
- Resets when starting new games
- Tracks total play time per session

### Double Jump System
- Players can jump twice before landing
- Second jump provides 20% more height than regular jump
- Visual indicator (blue circle) shows when double jump is available
- Player animation adjusts for jumping pose

### Infinite Level Generation
- Procedural chunk-based level generation (800px chunks)
- Automatic generation of new obstacles as player progresses
- Progressive difficulty scaling every 5 chunks
- Four different obstacle patterns: vertical towers, walls with gaps, staircases, scattered obstacles
- Memory management with cleanup of distant objects
- No level completion - endless gameplay

## User Preferences

Preferred communication style: Simple, everyday language.