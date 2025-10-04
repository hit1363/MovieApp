# 🎬 MovieApp

A comprehensive React Native movie and TV show discovery app built with Expo, featuring TMDB integration, video streaming, and watch provider information.

## ✨ Features

- 🎥 **Movie & TV Show Discovery** - Browse popular and trending content
- 🔍 **Advanced Search** - Find movies and TV shows instantly
- 📺 **Video Integration** - Watch trailers, teasers, and behind-the-scenes content
- 🎪 **Streaming Providers** - Find where to watch on Netflix, Hulu, Disney+, and more
- 📱 **Cross-Platform** - Runs on iOS, Android, and Web
- 🎨 **Modern UI** - Built with NativeWind (Tailwind CSS)
- 🔐 **Secure** - Environment-based API key management

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- TMDB API Account (free)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/hit1363/MovieApp.git
   cd MovieApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables Setup**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   ```

4. **Get TMDB API Credentials**
   - Visit [TMDB API Settings](https://www.themoviedb.org/settings/api)
   - Create an account if you don't have one
   - Generate an API Read Access Token (v4)
   - Copy your credentials to `.env`:
   ```env
   EXPO_PUBLIC_MOVIE_API_KEY=your_api_read_access_token_here
   ```

5. **Start the development server**
   ```bash
   npx expo start
   ```

6. **Run the app**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Press `w` for web browser
   - Scan QR code with Expo Go app on your device

## 📱 App Structure

```
MovieApp/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Home screen
│   │   ├── search.tsx     # Search screen
│   │   ├── save.tsx       # Saved items
│   │   └── profile.tsx    # User profile
│   └── movie/[id].tsx     # Movie/TV details
├── components/            # Reusable components
│   ├── MovieCard.tsx      # Movie display card
│   ├── SearchBar.tsx      # Search input
│   └── TrendingCard.tsx   # Trending content card
├── services/              # API and data services
│   ├── api.ts            # TMDB API integration
│   ├── appwrite.ts       # Backend services
│   └── useFetch.ts       # Custom fetch hook
├── interfaces/            # TypeScript interfaces
├── constants/            # App constants
└── assets/              # Images, icons, fonts
```

## 🔧 Tech Stack

- **Framework**: [Expo](https://expo.dev) & React Native
- **Language**: TypeScript
- **Styling**: [NativeWind](https://www.nativewind.dev/) (Tailwind CSS)
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/)
- **API**: [TMDB API](https://developer.themoviedb.org/docs)
- **Backend**: [Appwrite](https://appwrite.io/) (optional)
- **State Management**: React Hooks

## 🎯 Core Features

### Movie & TV Show Discovery
- Browse trending movies and TV shows
- Search by title, genre, or keyword
- View detailed information including cast, crew, ratings
- Access high-quality posters and backdrop images

### Video Integration
- Watch official trailers and teasers
- Behind-the-scenes content and featurettes
- Direct links to YouTube and Vimeo
- Video quality and type filtering

### Streaming Providers
- Find where to watch movies and TV shows
- Support for subscription services (Netflix, Hulu, Disney+)
- Purchase and rental options (iTunes, Google Play, Amazon)
- Free ad-supported platforms (Tubi, Crackle)
- Region-specific availability

## 🔐 Security & Best Practices

### Environment Variables
- All API keys are stored in `.env` files
- `.env` files are excluded from version control
- Use `.env.example` as a template for required variables
- Never hardcode sensitive data in source code

### API Key Protection
```typescript
// ✅ Correct - Using environment variables
const API_KEY = process.env.EXPO_PUBLIC_MOVIE_API_KEY;

// ❌ Wrong - Hardcoded API key
const API_KEY = "your_actual_api_key_here";
```

## 📚 API Endpoints Used

- **Movies**: `/movie/popular`, `/movie/{id}`, `/search/movie`
- **TV Shows**: `/tv/popular`, `/tv/{id}`, `/search/tv`
- **Videos**: `/movie/{id}/videos`, `/tv/{id}/videos`
- **Watch Providers**: `/movie/{id}/watch/providers`, `/tv/{id}/season/{season}/watch/providers`
- **Trending**: `/trending/movie/week`, `/trending/tv/week`

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npx expo start

# Run on specific platform
npx expo start --ios
npx expo start --android
npx expo start --web

# Build for production
npx expo build

# Type checking
npm run type-check

# Linting
npm run lint
```

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Tailwind CSS classes via NativeWind

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [TMDB API](https://www.themoviedb.org/) for movie and TV show data
- [Expo](https://expo.dev) for the amazing development platform
- [React Native](https://reactnative.dev) community for excellent documentation
- [NativeWind](https://www.nativewind.dev/) for Tailwind CSS integration

## 📞 Support

If you have any questions or run into issues:
- Open an [issue](https://github.com/hit1363/MovieApp/issues)
- Check the [Expo documentation](https://docs.expo.dev/)
- Visit [TMDB API documentation](https://developer.themoviedb.org/docs)

---

**Happy coding! 🎬✨**
