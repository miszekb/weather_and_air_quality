import { useState, useEffect } from "react";
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

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const theme = extendTheme({
  config: { initialColorMode: "dark", useSystemColorMode: true },
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
};

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

function MetricChart({ title, metricKey, historyData, color }) {
  const [view, setView] = useState("today");
  const bg = useColorModeValue("gray.200", "gray.800");

  const todayString = new Date().toISOString().split("T")[0];

  const todayData = historyData
    .filter((d) => d.timestamp.startsWith(todayString))
    .map((d) => ({
      time: new Date(d.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      value: d[metricKey],
    }));

  const historicalData = historyData.map((d) => ({
    time: new Date(d.timestamp).toLocaleDateString("en-US", {
      month: "short",
    }),
    value: d[metricKey],
  }));

  const chartData = {
    labels:
      view === "today"
        ? todayData.map((d) => d.time)
        : historicalData.map((d) => d.time),
    datasets: [
      {
        label: title,
        data:
          view === "today"
            ? todayData.map((d) => d.value)
            : historicalData.map((d) => d.value),
        borderColor: color,
        backgroundColor: color,
      },
    ],
  };

  return (
    <Box
      p={6}
      borderRadius="xl"
      bg={bg}
      boxShadow="xl"
      transition="0.3s"
      _hover={{ transform: "translateY(-5px)" }}
    >
      <HStack justify="space-between" mb={4}>
        <Heading
          size="md"
          color={useColorModeValue("gray.800", "whiteAlpha.900")}
        >
          {title}
        </Heading>
        <Button
          size="sm"
          onClick={() => setView(view === "today" ? "history" : "today")}
        >
          {view === "today" ? "History" : "Today"}
        </Button>
      </HStack>

      <Box h={{ base: "250px", md: "320px" }} w="100%">
        <Line data={chartData} options={chartOptions} />
      </Box>
    </Box>
  );
}

function Dashboard() {
  const { colorMode, toggleColorMode } = useColorMode();
  const [latest, setLatest] = useState({});
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLatest = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://192.168.1.37:5000/latest");
      const data = await res.json();
      setLatest(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch("http://192.168.1.37:5000/history");
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLatest();
    fetchHistory();
  }, []);

  const bg = useColorModeValue("gray.50", "gray.900");

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
              onClick={() => {
                fetchLatest();
                fetchHistory();
              }}
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

        {/* Latest Measurements */}
        <Box overflowX="auto" mb={8}>
          <SimpleGrid minChildWidth="140px" spacing={4}>
            <MetricCard
              title="Temperature"
              value={latest.temperature}
              unit="°C"
              icon={FaTemperatureHigh}
              color="#4FD1C5"
            />
            <MetricCard
              title="Temp2"
              value={latest.temp2}
              unit="°C"
              icon={FaTemperatureHigh}
              color="#63B3ED"
            />
            <MetricCard
              title="PM2.5"
              value={latest.pm25}
              unit="µg/m³"
              icon={FaSmog}
              color="#F56565"
            />
            <MetricCard
              title="NO2"
              value={latest.no2}
              unit="ppb"
              icon={FaWind}
              color="#63B3ED"
            />
            <MetricCard
              title="Humidity"
              value={latest.humidity}
              unit="%"
              icon={FaTint}
              color="#9F7AEA"
            />
            <MetricCard
              title="Pressure"
              value={latest.hPa}
              unit="hPa"
              icon={FaTemperatureHigh}
              color="#F6AD55"
            />
          </SimpleGrid>
        </Box>

        {/* Charts */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
          <MetricChart title="Temperature" metricKey="temperature" historyData={history} color="#4FD1C5" />
          <MetricChart title="Temp2" metricKey="temp2" historyData={history} color="#63B3ED" />
          <MetricChart title="PM2.5" metricKey="pm25" historyData={history} color="#F56565" />
          <MetricChart title="NO2" metricKey="no2" historyData={history} color="#63B3ED" />
          <MetricChart title="Humidity" metricKey="humidity" historyData={history} color="#9F7AEA" />
          <MetricChart title="Pressure" metricKey="hPa" historyData={history} color="#F6AD55" />
        </SimpleGrid>
      </Box>
    </Box>
  );
}

export default function App() {
  return (
    <ChakraProvider theme={theme}>
      <Dashboard />
    </ChakraProvider>
  );
}