import { useState, useEffect } from "react";
import MetricChart from './MetricChart';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  HStack,
  Icon,
  Button,
  useColorMode,
  IconButton,
  Flex,
  ChakraProvider,
  extendTheme,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";

import {
  FaTemperatureHigh,
  FaSmog,
  FaTint,
  FaWind,
  FaMoon,
  FaSun,
  FaSync,
} from "react-icons/fa";

function MetricCard({ title, value, unit, icon, color }) {
  const bg = useColorModeValue("gray.200", "gray.800");
  const textColor = useColorModeValue("gray.800", "whiteAlpha.900");
  const subTextColor = useColorModeValue("gray.600", "gray.400");

  return (
    <Flex
      p={4}
      borderRadius="xl"
      bg={bg}
      direction="column"
      align="center"
      justify="center"
      w="100%"
    >
      <Icon as={icon} boxSize={8} color={color} mb={2} />
      <Text fontSize="sm" color={subTextColor}>
        {title}
      </Text>
      <Text fontSize="2xl" fontWeight="bold" color={textColor}>
        {value ?? "-"} {unit}
      </Text>
    </Flex>
  );
}

function Dashboard() {
  const { colorMode, toggleColorMode } = useColorMode();
  const [latest, setLatest] = useState({});
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeatherData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Combine both fetches into one call
      const [latestRes, historyRes] = await Promise.all([
        fetch("https://weather.mbialecki.pl/latest"),
        fetch("https://weather.mbialecki.pl/history")
      ]);
      
      if (!latestRes.ok || !historyRes.ok) {
        throw new Error(`API error: ${latestRes.status} ${historyRes.status}`);
      }
      
      const latestData = await latestRes.json();
      const historyData = await historyRes.json();
      
      setLatest(latestData);
      setHistory(historyData);
    } catch (err) {
      console.error("Failed to fetch weather data:", err);
      setError("Failed to load weather data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, []);

  // Define theme-related props
  const bg = useColorModeValue("gray.50", "gray.900");
  const textColor = useColorModeValue("gray.800", "whiteAlpha.900");

  return (
    <Box minH="100vh" minW="100vw" bg={bg} py={8}>
      <Box maxW="1200px" mx="auto" px={4}>
        {/* Header */}
        <HStack justify="space-between" mb={6}>
          <Heading
            size="lg"
            color={useColorModeValue("gray.800", "white")}
          >
            Weather Station Dashboard
          </Heading>

          <HStack spacing={3}>
            <Button
              leftIcon={loading ? <Spinner size="sm" /> : <Icon as={FaSync} />}
              size="sm"
              onClick={fetchWeatherData}
              isDisabled={loading}
            >
              Refresh
            </Button>

            <IconButton
              icon={colorMode === "dark" ? <FaSun /> : <FaMoon />}
              onClick={toggleColorMode}
              size="sm"
            />
          </HStack>
        </HStack>

        {error && (
          <Alert status="error" mb={6}>
            <AlertIcon />
            <AlertTitle>Network Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Latest Measurements */}
        <Box overflowX="auto" mb={8}>
          <SimpleGrid minChildWidth="140px" spacing={4}>
            <MetricCard
              title="Temperature"
              value={latest.temperature}
              unit="°C"
              icon={FaTemperatureHigh}
              color="teal.500"
            />
            <MetricCard
              title="Temp2"
              value={latest.temp2}
              unit="°C"
              icon={FaTemperatureHigh}
              color="blue.500"
            />
            <MetricCard
              title="PM2.5"
              value={latest.pm25}
              unit="µg/m³"
              icon={FaSmog}
              color="red.500"
            />
            <MetricCard
              title="NO2"
              value={latest.no2}
              unit="ppb"
              icon={FaWind}
              color="blue.500"
            />
            <MetricCard
              title="Humidity"
              value={latest.humidity}
              unit="%"
              icon={FaTint}
              color="purple.500"
            />
            <MetricCard
              title="Pressure"
              value={latest.hPa}
              unit="hPa"
              icon={FaTemperatureHigh}
              color="orange.500"
            />
          </SimpleGrid>
        </Box>

        {/* Charts */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
          <MetricChart title="Temperature" metricKey="temperature" historyData={history} color="teal.500" bg={bg} textColor={textColor} />
          <MetricChart title="Temp2" metricKey="temp2" historyData={history} color="blue.500" bg={bg} textColor={textColor} />
          <MetricChart title="PM2.5" metricKey="pm25" historyData={history} color="red.500" bg={bg} textColor={textColor} />
          <MetricChart title="NO2" metricKey="no2" historyData={history} color="blue.500" bg={bg} textColor={textColor} />
          <MetricChart title="Humidity" metricKey="humidity" historyData={history} color="purple.500" bg={bg} textColor={textColor} />
          <MetricChart title="Pressure" metricKey="hPa" historyData={history} color="orange.500" bg={bg} textColor={textColor} />
        </SimpleGrid>
      </Box>
    </Box>
  );
}

const theme = extendTheme({
  config: { initialColorMode: "dark", useSystemColorMode: true },
});

export default function App() {
  return (
    <ChakraProvider theme={theme}>
      <Dashboard />
    </ChakraProvider>
  );
}
