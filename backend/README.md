# GrabX Backend Setup

## Prerequisites
- Node.js 16+
- MongoDB 4.4+
- npm or yarn

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd grabx/backend
```

2. Install dependencies
```bash
npm install
```

3. Create environment file
```bash
cp .env.example .env
```

4. Update .env with your configuration
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/grabx
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
BINANCE_API_KEY=your-binance-api-key
BINANCE_SECRET_KEY=your-binance-secret-key
FRONTEND_URL=http://localhost:3000
```

## Running the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user
- PUT /api/auth/profile - Update profile
- PUT /api/auth/password - Change password

### Users
- GET /api/users/profile - Get user profile
- PUT /api/users/profile - Update user profile
- POST /api/users/avatar - Upload avatar
- GET /api/users/stats - Get user stats
- GET /api/users/preferences - Get preferences
- PUT /api/users/preferences - Update preferences
- DELETE /api/users/account - Delete account

### Wallets
- GET /api/wallets - Get all wallets
- GET /api/wallets/:id - Get single wallet
- POST /api/wallets - Create wallet
- PUT /api/wallets/:id - Update wallet
- POST /api/wallets/:id/sync - Sync wallet balances
- DELETE /api/wallets/:id - Delete wallet
- GET /api/wallets/:id/stats - Get wallet stats

### Bots
- GET /api/bots - Get all bots
- GET /api/bots/:id - Get single bot
- POST /api/bots - Create bot
- PUT /api/bots/:id - Update bot
- POST /api/bots/:id/start - Start bot
- POST /api/bots/:id/stop - Stop bot
- DELETE /api/bots/:id - Delete bot
- GET /api/bots/:id/trades - Get bot trades
- GET /api/bots/:id/signals - Get bot signals
- GET /api/bots/:id/logs - Get bot logs

### Markets
- GET /api/markets/ticker/:symbol - Get ticker data
- GET /api/markets/klines/:symbol - Get candlestick data
- GET /api/markets/orderbook/:symbol - Get orderbook
- GET /api/markets/trades/:symbol - Get recent trades
- GET /api/markets/exchange-info - Get exchange info
- GET /api/markets/ticker/24hr - Get 24hr ticker
- GET /api/markets/search/:query - Search symbols
- GET /api/markets/popular - Get popular symbols

## WebSocket Events

The server supports WebSocket connections for real-time updates:

- `wallet_created` - New wallet created
- `wallet_updated` - Wallet updated
- `wallet_balance_updated` - Wallet balance updated
- `wallet_deleted` - Wallet deleted
- `bot_created` - New bot created
- `bot_updated` - Bot updated
- `bot_started` - Bot started
- `bot_stopped` - Bot stopped
- `bot_deleted` - Bot deleted

## Database Schema

### Users
- Authentication (email, password, JWT)
- Profile information (name, bio, avatar, etc.)
- Preferences (theme, language, notifications)
- Security settings (2FA, login attempts)
- Subscription plan
- Trading statistics

### Wallets
- Exchange integration (Binance, Coinbase, etc.)
- Balance tracking
- Trading permissions
- Risk settings
- Performance metrics

### Bots
- Bot configuration (all settings from frontend)
- Performance tracking
- Trade history
- Signal logs
- Activity logs

## Security Features

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet.js security headers
- Input validation with Joi

## Development

The server includes:
- Hot reload with nodemon
- Comprehensive error handling
- WebSocket support for real-time updates
- MongoDB connection with Mongoose
- Environment-based configuration

## Production Deployment

1. Set NODE_ENV=production
2. Use a strong JWT_SECRET
3. Configure MongoDB with authentication
4. Set up reverse proxy (nginx)
5. Use HTTPS
6. Configure environment variables properly