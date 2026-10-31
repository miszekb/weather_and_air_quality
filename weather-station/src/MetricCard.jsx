import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Flex, HStack, Icon, Text, Badge, Skeleton, Box, useColorModeValue } from '@chakra-ui/react';
import { Line } from 'react-chartjs-2';

import './chartSetup';
import { getChartColor } from './chartColors';
import { airQualityLevel, formatValue } from './metrics';
import { useI18n } from './i18nContext';

const ARROWS = { up: "↑", down: "↓", flat: "→" };

const sparklineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  parsing: false,
  events: [],
  plugins: { legend: { display: false }, tooltip: { enabled: false } },
  scales: { x: { type: "linear", display: false }, y: { display: false } },
  elements: { point: { radius: 0 } },
};

function Sparkline({ points, color }) {
  const data = useMemo(() => {
    const chartColor = getChartColor(color);
    return {
      datasets: [{ data: points, borderColor: chartColor, borderWidth: 2, tension: 0.3 }],
    };
  }, [points, color]);

  return <Line data={data} options={sparklineOptions} />;
}

Sparkline.propTypes = {
  points: PropTypes.arrayOf(PropTypes.object).isRequired,
  color: PropTypes.string.isRequired,
};

function MetricCard({ metric, value, trend, sparkPoints, loading }) {
  const { t, lang } = useI18n();
  const bg = useColorModeValue("gray.200", "gray.800");
  const textColor = useColorModeValue("gray.800", "whiteAlpha.900");
  const subTextColor = useColorModeValue("gray.600", "gray.400");

  const level = airQualityLevel(metric.key, value);
  const waiting = loading && value === undefined;

  return (
    <Flex p={{ base: 3, md: 4 }} borderRadius="xl" bg={bg} direction="column" align="center" w="100%" gap={1}>
      <Icon as={metric.icon} boxSize={8} color={metric.color} mb={1} />
      <Text fontSize="sm" color={subTextColor}>{t(`metric.${metric.key}`)}</Text>

      {waiting ? (
        <Skeleton h="32px" w="100px" />
      ) : (
        <Text fontSize={{ base: "lg", md: "2xl" }} fontWeight="bold" color={textColor} whiteSpace="nowrap">
          {formatValue(value, metric.decimals, lang)} {metric.unit}
        </Text>
      )}

      <HStack minH="22px" spacing={2}>
        {level && <Badge colorScheme={level.colorScheme}>{t(level.labelKey)}</Badge>}
        {trend && (
          <Text
            fontSize="xs"
            color={subTextColor}
            title={t("trend.hint")}
          >
            {ARROWS[trend.direction]}{" "}
            {trend.direction === "flat"
              ? t("trend.steady")
              : t("trend.perHour", { delta: formatValue(Math.abs(trend.delta), metric.decimals, lang) })}
          </Text>
        )}
      </HStack>

      <Box h="40px" w="100%" mt={1}>
        {sparkPoints.length > 1 && <Sparkline points={sparkPoints} color={metric.color} />}
      </Box>
    </Flex>
  );
}

MetricCard.propTypes = {
  metric: PropTypes.object.isRequired,
  value: PropTypes.number,
  trend: PropTypes.shape({ direction: PropTypes.string, delta: PropTypes.number }),
  sparkPoints: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool,
};

export default MetricCard;
