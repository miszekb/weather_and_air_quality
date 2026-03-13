# Weather Station Frontend

This is the frontend component of the weather and air quality monitoring system, built with React and Vite.

## Features

- Real-time weather and air quality monitoring
- Data visualization with interactive charts
- Responsive design for all device sizes
- Dark/light theme support
- Automated data fetching and error handling
- Performance optimized with React.memo and useMemo

## Technologies Used

- React 18 with Vite
- Chakra UI for styling components
- Chart.js for data visualization
- React Icons for UI icons
- React Router for navigation
- TypeScript for type safety

## Project Structure

```
src/
├── App.jsx                  # Main application component
├── MetricChart.jsx          # Chart component with performance optimizations
├── chartColors.js           # Color mapping for chart.js compatibility
├── components/              # Reusable components
├── assets/                  # Static assets
└── styles/                  # Custom styles
```

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd weather-station
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Development

To start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:5173/

### Build

To create a production build:

```bash
npm run build
```

## API Integration

The frontend fetches data from the backend server at:
- `/latest` - Current weather measurements
- `/history` - Historical data

## Performance Optimizations

- Used `useMemo` in `MetricChart.jsx` to prevent expensive data processing on every render
- Implemented proper error boundaries and user feedback
- Combined API requests for better performance
- Used theme-based color system with proper chart.js compatibility

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.