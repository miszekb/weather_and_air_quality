import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import Modal from './Modal';
import {
  Box,
  HStack,
  Button,
  Text,
  Skeleton,
  Center,
  useColorModeValue
} from '@chakra-ui/react';
import { Line } from "react-chartjs-2";

import './chartSetup';
import { getChartColor } from './chartColors';
import { pointsInWindow, getStats, formatValue } from './metrics';
import { useI18n } from './i18nContext';

const HOUR = 60 * 60 * 1000;
const TICK_STEPS = [1, 2, 3, 6, 12, 24, 48, 168].map((h) => h * HOUR);

const timeFormat = { hour: "2-digit", minute: "2-digit" };
const dateFormat = { month: "short", day: "numeric" };
const dayTimeFormat = { ...dateFormat, hour: "2-digit", minute: "2-digit" };

/** Puts x ticks on whole local hours (or days), with a step that gives about 7 labels or fewer. */
function alignTicks(axis) {
  const step = TICK_STEPS.find((s) => (axis.max - axis.min) / s <= 7) ?? TICK_STEPS.at(-1);
  const offset = new Date(axis.min).getTimezoneOffset() * 60000;
  const ticks = [];
  for (let t = Math.ceil((axis.min - offset) / step) * step + offset; t <= axis.max; t += step) {
    ticks.push({ value: t });
  }
  axis.ticks = ticks;
}

function buildOptions({ metric, window, tickColor, gridColor, lang }) {
  // Spans of several days only get date labels; shorter ones get times.
  const tickFormat = window.end - window.start > 3 * 24 * HOUR ? dateFormat : timeFormat;
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    parsing: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: ([item]) => new Date(item.parsed.x).toLocaleString(lang, dayTimeFormat),
          label: (item) => `${formatValue(item.parsed.y, metric.decimals, lang)} ${metric.unit}`,
        },
      },
    },
    scales: {
      x: {
        type: "linear",
        min: window.start,
        max: window.end,
        afterBuildTicks: alignTicks,
        ticks: {
          color: tickColor,
          maxRotation: 0,
          callback: (value) => new Date(value).toLocaleString(lang, tickFormat),
        },
        grid: { color: gridColor },
      },
      y: {
        beginAtZero: Boolean(metric.zero),
        ticks: { color: tickColor },
        grid: { color: gridColor },
      },
    },
  };
}

function StatItem({ label, value, metric }) {
  const { lang } = useI18n();
  return (
    <Box>
      <Text fontSize="xs" opacity={0.7}>{label}</Text>
      <Text fontSize="sm" fontWeight="semibold">
        {formatValue(value, metric.decimals, lang)} {metric.unit}
      </Text>
    </Box>
  );
}

StatItem.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number,
  metric: PropTypes.object.isRequired,
};

const MetricChart = ({ metric, points, window, loading }) => {
  const { t, lang } = useI18n();
  const [isMaximized, setIsMaximized] = useState(false);

  const title = t(`metric.${metric.key}`);
  const bg = useColorModeValue("gray.100", "gray.800");
  const textColor = useColorModeValue("gray.800", "whiteAlpha.900");
  const tickColor = useColorModeValue("#4A5568", "#A0AEC0");
  const gridColor = useColorModeValue("rgba(0,0,0,0.08)", "rgba(255,255,255,0.1)");

  const visible = useMemo(() => pointsInWindow(points, window), [points, window]);
  const stats = useMemo(() => getStats(visible), [visible]);

  const chartData = useMemo(() => {
    const chartColor = getChartColor(metric.color);
    return {
      datasets: [
        {
          label: title,
          data: visible,
          borderColor: chartColor,
          backgroundColor: chartColor,
          borderWidth: 2,
          pointRadius: visible.length > 150 ? 0 : 2,
          pointHoverRadius: 4,
          tension: 0.2,
        },
      ],
    };
  }, [visible, metric, title]);

  const options = useMemo(
    () => buildOptions({ metric, window, tickColor, gridColor, lang }),
    [metric, window, tickColor, gridColor, lang]
  );

  let body;
  if (loading && points.length === 0) {
    body = <Skeleton h="100%" borderRadius="md" />;
  } else if (visible.length === 0) {
    body = <Center h="100%" opacity={0.7}>{t("chart.noData")}</Center>;
  } else {
    body = <Line data={chartData} options={options} />;
  }

  return (
    <>
      <Box
        p={{ base: 4, md: 6 }}
        borderRadius="xl"
        bg={bg}
        boxShadow="xl"
        transition="0.3s"
        _hover={{ transform: "translateY(-5px)" }}
      >
        <HStack justify="space-between" mb={4}>
          <Box fontSize="md" fontWeight="bold" color={textColor}>{title}</Box>
          <Button size="sm" colorScheme="blue" onClick={() => setIsMaximized(true)}>
            {t("chart.maximize")}
          </Button>
        </HStack>

        <Box h={{ base: "250px", md: "320px" }} w="100%">{body}</Box>

        {stats && (
          <HStack justify="space-around" mt={4} color={textColor}>
            <StatItem label={t("chart.min")} value={stats.min} metric={metric} />
            <StatItem label={t("chart.avg")} value={stats.avg} metric={metric} />
            <StatItem label={t("chart.max")} value={stats.max} metric={metric} />
          </HStack>
        )}
      </Box>

      {isMaximized && (
        <Modal onClose={() => setIsMaximized(false)}>
          <Box p={6} bg={bg} color={textColor}>
            <Box fontSize="25px" fontWeight="bold" mb={4}>{title}</Box>
            <Box h="60vh">{body}</Box>
          </Box>
        </Modal>
      )}
    </>
  );
};

MetricChart.propTypes = {
  metric: PropTypes.object.isRequired,
  points: PropTypes.arrayOf(PropTypes.object).isRequired,
  window: PropTypes.shape({ start: PropTypes.number, end: PropTypes.number }).isRequired,
  loading: PropTypes.bool,
};

export default MetricChart;
