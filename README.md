# EV Charging Tracker

A full-stack React and Node.js application to track your electric vehicle charging sessions and costs. Features a React frontend with a Node.js/Express backend using SQLite for persistent data storage.

## Features

- 📱 **Modern React Interface** - Clean, responsive design that works on all devices
- 🗄️ **SQLite Database** - Persistent server-side storage with full CRUD operations
- ⚡ **AmpUp Integration** - Automatic parsing of AmpUp charging receipts
- 📊 **Real-time Statistics** - Track total sessions, costs, energy consumption, and efficiency
- 🚗 **Vehicle-Specific** - Pre-configured for Polestar 2 2022 Long Range Dual Motor
- 🔌 **Extensible** - Ready for additional charging network parsers
- 🚀 **Full-Stack Architecture** - Secure API with rate limiting and CORS protection
- 📦 **Docker Ready** - Easy deployment with Docker and docker-compose

## Quick Start

### Local Development

#### Option 1: Automated Setup
```bash
# Run the setup script
npm run setup

# Start both frontend and backend
npm run dev
```

#### Option 2: Manual Setup
1. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd server
   npm install
   cd ..
   ```

2. **Start the backend server**
   ```bash
   npm run dev:server
   # Backend will run on http://localhost:3001
   ```

3. **Start the frontend (in a new terminal)**
   ```bash
   npm start
   # Frontend will run on http://localhost:3000
   ```

### Docker Deployment

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

2. **Access the app at http://localhost:3000**

### Manual Docker Build

```bash
# Build the image
docker build -t ev-charging-tracker .

# Run the container
docker run -d -p 3000:80 --name ev-tracker ev-charging-tracker
```

## Usage

1. **Paste your AmpUp receipt** in the text area
2. **Click "Parse & Add Session"** to automatically extract and store the data
3. **View your statistics** and session history in real-time
4. **Track your charging patterns** and costs over time

### Example AmpUp Receipt Format

The app can parse receipts that look like this:

```
Here is a full summary of your charging session with AmpUp.

EVSE ID: IIEMJLOSKS
Location Name: EVC918-83091-4663 W Maplewood Ave / IIEMJLOSKS
Location Address: 4663 W Maplewood Ave, Los Angeles, CA 90004, USA
Transaction Start: Oct 23, 2025 3:59:41 PM
Transaction End: Oct 23, 2025 8:39:23 PM
Transaction Duration: 04 hr 39 min 42 sec
Total Energy: 31.7655 kWh
Maximum Power: 7.0000 kW (AC)
Total Price: $10.65
Session ID: TLI5PD
```

## Project Structure

```
src/
├── components/          # React components
│   ├── Header.js       # App header with vehicle info
│   ├── Stats.js        # Statistics dashboard
│   ├── ReceiptInput.js # Receipt parsing interface
│   ├── SessionsList.js # List of charging sessions
│   └── SessionCard.js  # Individual session display
├── services/           # Business logic
│   ├── DatabaseService.js  # SQLite database operations
│   └── ReceiptParser.js     # Receipt parsing logic
├── App.js              # Main application component
├── index.js            # React entry point
└── index.css           # Global styles
```

## Supported Charging Networks

- ✅ **AmpUp** - Full support with automatic parsing
- 🚧 **Electrify America** - Coming soon
- 🚧 **ChargePoint** - Coming soon
- 🚧 **EVgo** - Coming soon

## Data Storage

All data is stored locally in your browser using:
- **SQL.js** - SQLite database running in WebAssembly
- **localStorage** - Persistent storage between sessions
- **No server required** - Everything runs client-side

## Contributing

### Adding New Charging Network Parsers

1. **Add parser method** to `src/services/ReceiptParser.js`
2. **Follow the existing pattern** for AmpUp parser
3. **Update the auto-detection logic** in `autoParseReceipt()`
4. **Add provider icon** in `SessionCard.js` `getProviderIcon()` method

### Example Parser Structure

```javascript
static parseNewProvider(receiptText) {
  const data = {
    provider: 'NewProvider',
    // ... other fields
  };
  
  // Parse receipt text and populate data
  
  return data;
}
```

## Deployment Options

### Static Hosting (GitHub Pages, Netlify, Vercel)

```bash
npm run build
# Deploy the /build folder to your static host
```

### Docker on Your Server

```bash
# Using docker-compose (recommended)
docker-compose up -d

# Or manual Docker commands
docker build -t ev-charging-tracker .
docker run -d -p 3000:80 ev-charging-tracker
```

### Reverse Proxy Configuration

The included `nginx.conf` provides:
- Gzip compression
- Static asset caching
- Security headers
- Client-side routing support

## Environment Variables

The app runs entirely client-side, so no environment variables are required for basic functionality.

## Troubleshooting

### Installation Issues

If you encounter issues with `npm install`, try:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### SQL.js Loading Issues

If the database doesn't initialize:
- Check that your browser supports WebAssembly
- Ensure you have a stable internet connection for CDN loading
- Try refreshing the page

## License

MIT License - feel free to modify and distribute as needed.

## Support

For issues or feature requests, please create an issue in the repository.

---

**Vehicle Compatibility**: Currently optimized for Polestar 2 2022 Long Range Dual Motor, but can be easily adapted for other EVs by updating the vehicle info in `Header.js`.