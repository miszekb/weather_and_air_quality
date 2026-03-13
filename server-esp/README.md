# Weather Station Backend

This is the backend component of the weather and air quality monitoring system, built with Node.js and Express.

## Features

- RESTful API for weather and air quality data
- Data storage with MongoDB
- Real-time data processing
- MQTT integration for sensor data
- CORS support for cross-origin requests
- Environment variable configuration

## Technologies Used

- Node.js with Express
- MongoDB for data storage
- MQTT for real-time sensor data streaming
- CORS middleware for API access
- dotenv for environment configuration
- Mongoose for MongoDB object modeling
- Express-rate-limit for rate limiting

## Project Structure

```
src/
├── server.js                # Main server file
├── config/                  # Configuration files
├── models/                  # Data models
├── routes/                  # API routes
├── controllers/             # Controller functions
├── middleware/              # Custom middleware
├── utils/                   # Utility functions
└── data/                    # Sample data files
```

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- MongoDB database

### Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd server-esp
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Configuration

Create a `.env` file in the root of the backend directory:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/weatherstation
MQTT_BROKER_URL=mqtt://localhost:1883
NODE_ENV=development
```

### Development

To start the development server:

```bash
npm run dev
```

### Production

To start the production server:

```bash
npm run start
```

## API Endpoints

- `GET /latest` - Get the latest weather measurements
- `GET /history` - Get historical weather data
- `POST /data` - Add new weather data (requires authentication)

## Database Schema

### WeatherData
```javascript
{
  timestamp: Date,
  temperature: Number,
  humidity: Number,
  pressure: Number,
  pm25: Number,
  pm10: Number,
  co2: Number,
  tvoc: Number
}
```

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.