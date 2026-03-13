import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import Modal from './Modal'; // Import the Modal component
import {
  Box,
  HStack,
  Button,
  useColorModeValue
} from '@chakra-ui/react';

import {
  Line,
} from "react-chartjs-2";
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

// Import color mapping for chart.js compatibility
import { getChartColor } from './chartColors';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const MetricChart = ({ title, metricKey, historyData, color }) => {
  const [view, setView] = useState("today");
  const [isMaximized, setIsMaximized] = useState(false); // State to control modal visibility

  // Memoize expensive data processing operations
  const chartData = useMemo(() => {
    const todayString = new Date().toISOString().split("T")[0];
    
    // Filter and process today's data
    const todayData = historyData
      .filter((d) => d.timestamp.startsWith(todayString))
      .map((d) => ({
        time: new Date(d.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        value: d[metricKey],
      }));

    // Sort historical data by timestamp
    const sortedHistoryData = historyData.slice().sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // Process historical data
    const historicalData = sortedHistoryData.map((d) => ({
      time: new Date(d.timestamp).toLocaleString("en-US", {
        month: 'short', // short month name
        day: 'numeric', // numeric day
        hour: '2-digit', // 2-digit hour
        minute: '2-digit' // 2-digit minutes
      }),
      value: d[metricKey],
    }));

    const labels = 
      view === "today"
        ? todayData.map((d) => d.time)
        : historicalData.map((d) => d.time);
        
    const data = 
      view === "today"
        ? todayData.map((d) => d.value)
        : historicalData.map((d) => d.value);

    // Convert Chakra UI color name to actual color for chart.js
    const chartColor = getChartColor(color);

    return {
      labels,
      datasets: [
        {
          label: title,
          data,
          borderColor: chartColor,
          backgroundColor: chartColor,
        },
      ],
    };
  }, [historyData, metricKey, view, color]); // Added color to dependencies

  // Dynamic background and text colors based on theme
  const bg = useColorModeValue("gray.100", "gray.800");
  const textColor = useColorModeValue("gray.800", "whiteAlpha.900");

  return (
    <>
      <Box
        p={6}
        borderRadius="xl"
        bg={bg} // Use dynamic background color
        boxShadow="xl"
        transition="0.3s"
        _hover={{ transform: "translateY(-5px)" }}
      >
        <HStack justify="space-between" mb={4}>
          <Box fontSize="md" fontWeight="bold" color={textColor}>{title}</Box> // Use dynamic text color
          <Button size="sm" onClick={() => setView(view === "today" ? "history" : "today")}>
            {view === "today" ? "Last week" : "Today"}
          </Button>
          <Button size="sm" colorScheme="blue" onClick={() => setIsMaximized(true)}>
            Maximize
          </Button> {/* Add maximize button */}
        </HStack>

        <Box h={{ base: "250px", md: "320px" }} w="100%">
          <Line 
            data={chartData} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }} 
          />
        </Box>
      </Box>

      {/* Modal to show the chart in full size */}
      {isMaximized && (
        <Modal onClose={() => setIsMaximized(false)}>
          <Box p={6} maxH="70vh" bg={bg} color={textColor}>
            <HStack justify="space-between">
              <Box fontSize="25px" fontWeight="bold">{title}</Box>
            </HStack>
            <Line 
              data={chartData} 
              maxH="100%" 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }} 
            />
          </Box>
        </Modal>
      )}
    </>
  );
};

MetricChart.propTypes = {
  title: PropTypes.string.isRequired,
  metricKey: PropTypes.string.isRequired,
  historyData: PropTypes.arrayOf(PropTypes.object).isRequired,
  color: PropTypes.string.isRequired,
};

export default MetricChart;