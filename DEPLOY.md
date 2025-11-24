# Deployment Guide

## Quick Deploy to Firebase

The project is configured for **one-command deployment**:

```bash
firebase deploy
```

That's it! Firebase automatically:
1. Installs dependencies (`npm install`)
2. Builds the app (`npm run build`)
3. Deploys to hosting

## Live URLs

- **Production**: https://nicu-app-9e772.web.app
- **GitHub**: https://github.com/penguingoober14/nicu-care-platform

## Development

```bash
cd web-app
npm install
npm run dev
```

Access at: http://localhost:3000

### Fast Dev Mode (Network Access)

```bash
npm run dev:fast
```

Access from any device on your network.

## Build Commands

- `npm run build` - Fast build (no type checking)
- `npm run build:check` - Build with TypeScript type checking
- `npm run preview` - Preview production build locally

## Firebase Commands

```bash
firebase deploy                    # Deploy everything
firebase deploy --only hosting     # Deploy hosting only
firebase serve                     # Test locally before deploy
```

## Project Structure

```
web-app/
├── src/
│   ├── components/
│   │   ├── common/        # Task-specific components
│   │   ├── nurse/         # Nurse interface components
│   │   └── shared/        # Reusable UI components
│   ├── data/              # Mock data (domain-organized)
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Helper functions
│   ├── context/           # React context providers
│   └── pages/             # Main pages
└── dist/                  # Build output (auto-generated)
```

## Notes

- Build time: ~5 seconds
- Bundle size: 1.07 MB (306 KB gzipped)
- No manual build step required for deployment
- TypeScript files compile automatically during build
