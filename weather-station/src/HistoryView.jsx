import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  ButtonGroup,
  HStack,
  Icon,
  IconButton,
  Input,
  Text,
  Wrap,
  Alert,
  AlertIcon,
  AlertDescription,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

import MetricChart from './MetricChart';
import { useHistoryRange, useAvailableDates } from './useHistoryRange';
import { useI18n } from './i18nContext';
import { METRICS, toPoints, formatDate, addDays, daysBetween, dateWindow } from './metrics';

// The server accepts at most 92 days per request.
const MAX_DAYS = 90;
const PRESET_DAYS = [7, 30, 90];

function DateField({ label, ...inputProps }) {
  const labelColor = useColorModeValue("gray.600", "gray.400");
  return (
    <Box>
      <Text fontSize="xs" color={labelColor} mb={1}>{label}</Text>
      <Input type="date" size="sm" borderRadius="md" w="auto" {...inputProps} />
    </Box>
  );
}

DateField.propTypes = { label: PropTypes.string.isRequired };

export default function HistoryView() {
  const { t } = useI18n();
  const today = useMemo(() => formatDate(new Date()), []);
  const [from, setFrom] = useState(() => addDays(today, -29));
  const [to, setTo] = useState(today);
  const [metricKey, setMetricKey] = useState(METRICS[0].key);

  const available = useAvailableDates();
  const window = useMemo(() => dateWindow(from, to), [from, to]);
  const { readings, loading, error } = useHistoryRange(window.start, window.end);

  const metric = METRICS.find((m) => m.key === metricKey);
  const points = useMemo(() => toPoints(readings, metricKey), [readings, metricKey]);

  const spanDays = daysBetween(from, to) + 1;
  // Stored days are named in UTC; compare them with the local dates loosely, a day either way is harmless.
  const canGoBack = !available.from || from > available.from;
  const canGoForward = to < today;

  const changeFrom = (value) => {
    if (!value) return;
    const newTo = to < value ? value : to;
    setFrom(value);
    setTo(daysBetween(value, newTo) >= MAX_DAYS ? addDays(value, MAX_DAYS - 1) : newTo);
  };

  const changeTo = (value) => {
    if (!value) return;
    const newFrom = from > value ? value : from;
    setTo(value);
    setFrom(daysBetween(newFrom, value) >= MAX_DAYS ? addDays(value, -(MAX_DAYS - 1)) : newFrom);
  };

  const showPreset = (days) => {
    setFrom(addDays(today, -(days - 1)));
    setTo(today);
  };

  // Moves the whole window by its own length, keeping it within today.
  const shift = (direction) => {
    let newFrom = addDays(from, direction * spanDays);
    let newTo = addDays(to, direction * spanDays);
    if (newTo > today) {
      newTo = today;
      newFrom = addDays(today, -(spanDays - 1));
    }
    setFrom(newFrom);
    setTo(newTo);
  };

  return (
    <Box>
      {/* Metric picker */}
      <Wrap spacing={2} mb={4} role="group" aria-label={t("history.metric")}>
        {METRICS.map((m) => (
          <Button
            key={m.key}
            size="sm"
            leftIcon={<Icon as={m.icon} />}
            colorScheme={metricKey === m.key ? "blue" : undefined}
            variant={metricKey === m.key ? "solid" : "outline"}
            aria-pressed={metricKey === m.key}
            onClick={() => setMetricKey(m.key)}
          >
            {t(`metric.${m.key}`)}
          </Button>
        ))}
      </Wrap>

      {/* Date range */}
      <Wrap spacing={4} align="flex-end" mb={6}>
        <HStack spacing={1} align="flex-end">
          <IconButton
            aria-label={t("history.previous")}
            icon={<FaChevronLeft />}
            size="sm"
            onClick={() => shift(-1)}
            isDisabled={!canGoBack}
          />
          <DateField
            label={t("history.from")}
            value={from}
            min={available.from ?? undefined}
            max={to}
            onChange={(e) => changeFrom(e.target.value)}
          />
          <DateField
            label={t("history.to")}
            value={to}
            min={from}
            max={today}
            onChange={(e) => changeTo(e.target.value)}
          />
          <IconButton
            aria-label={t("history.next")}
            icon={<FaChevronRight />}
            size="sm"
            onClick={() => shift(1)}
            isDisabled={!canGoForward}
          />
        </HStack>

        <ButtonGroup size="sm" isAttached variant="outline" aria-label={t("history.presets")}>
          {PRESET_DAYS.map((days) => (
            <Button key={days} onClick={() => showPreset(days)}>
              {t("history.lastDays", { n: days })}
            </Button>
          ))}
        </ButtonGroup>
      </Wrap>

      {error && (
        <Alert status="error" mb={6}>
          <AlertIcon />
          <AlertDescription>{t("history.error")}</AlertDescription>
        </Alert>
      )}

      <MetricChart metric={metric} points={points} window={window} loading={loading} />
    </Box>
  );
}
