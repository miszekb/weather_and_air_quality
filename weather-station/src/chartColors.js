// Color mapping for chart.js compatibility
export const chartColorMap = {
  "teal.500": "#319795",
  "blue.500": "#3182CE",
  "red.500": "#E53E3E",
  "purple.500": "#805AD5",
  "orange.500": "#ED8936",
  "green.500": "#38A169",
  "yellow.500": "#D69E2E",
  "pink.500": "#F56565",
  "indigo.500": "#667EEA",
  "cyan.500": "#00B5D8"
};

// Helper function to convert Chakra UI color names to hex values
export const getChartColor = (chakraColor) => {
  return chartColorMap[chakraColor] || chakraColor;
};