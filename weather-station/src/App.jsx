import { useState, useMemo } from "react";
import MetricChart from './MetricChart';
import MetricCard from './MetricCard';
import HistoryView from './HistoryView';
import { useWeatherData, useNow } from './useWeatherData';
import { METRICS, RANGES, toPoints, pointsInWindow, rangeWindow, getTrend, formatAgo } from './metrics';
import { useI18n } from './i18nContext';
import LanguageProvider from './LanguageProvider';
import LanguageFlag from './LanguageFlag';
import { LANGUAGES, LANGUAGE_NAMES } from './translations';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  HStack,
  Icon,
  Button,
  ButtonGroup,
  Badge,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  useColorMode,
  IconButton,
  Wrap,
  ChakraProvider,
  extendTheme,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";

import { FaMoon, FaSun, FaSync } from "react-icons/fa";

// The station reports about every 10 minutes; flag the data when it has been silent for longer.
const STALE_AFTER = 15 * 60 * 1000;

function Dashboard() {
  const { colorMode, toggleColorMode } = useColorMode();
  const { t, lang, setLang } = useI18n();
  const { latest, sortedHistory, loading, error, refresh } = useWeatherData();
  const [range, setRange] = useState("24h");
  const [tab, setTab] = useState(0);
  const now = useNow(30 * 1000);

  const pointsByKey = useMemo(
    () => Object.fromEntries(METRICS.map((m) => [m.key, toPoints(sortedHistory, m.key)])),
    [sortedHistory]
  );

  const bg = useColorModeValue("gray.50", "gray.900");
  const headingColor = useColorModeValue("gray.800", "white");
  const subTextColor = useColorModeValue("gray.600", "gray.400");

  const latestTime = latest?.timestamp ? new Date(latest.timestamp).getTime() : null;
  const isStale = latestTime !== null && now - latestTime > STALE_AFTER;
  const sparkWindow = rangeWindow("24h", now);
  const liveWindow = useMemo(() => rangeWindow(range, now), [range, now]);

  return (
    <Box minH="100vh" minW="100vw" bg={bg} py={8}>
      <Box maxW="1200px" mx="auto" px={4}>
        {/* Header */}
        <Wrap justify="space-between" align="center" spacing={4} mb={6}>
          <Box>
            <Heading size={{ base: "md", md: "lg" }} color={headingColor}>
              {t("app.title")}
            </Heading>
            <HStack mt={1} spacing={2} fontSize="sm" color={subTextColor} flexWrap="wrap">
              <Text>
                {latestTime === null
                  ? t("header.noReading")
                  : t("header.lastReading", { ago: formatAgo(now - latestTime, t) })}
              </Text>
              {isStale && <Badge colorScheme="orange" whiteSpace="normal">{t("header.stale")}</Badge>}
            </HStack>
          </Box>

          <Wrap spacing={2} align="center">
            {tab === 0 && (
            <ButtonGroup size="sm" isAttached variant="outline" aria-label={t("header.range")}>
              {RANGES.map((id) => (
                <Button
                  key={id}
                  onClick={() => setRange(id)}
                  colorScheme={range === id ? "blue" : undefined}
                  variant={range === id ? "solid" : "outline"}
                  aria-pressed={range === id}
                >
                  {t(`range.${id}`)}
                </Button>
              ))}
            </ButtonGroup>
            )}

            <HStack spacing={1} role="group" aria-label={t("header.language")}>
              {LANGUAGES.map((code) => (
                <IconButton
                  key={code}
                  aria-label={LANGUAGE_NAMES[code]}
                  title={LANGUAGE_NAMES[code]}
                  aria-pressed={lang === code}
                  icon={<LanguageFlag code={code} />}
                  onClick={() => setLang(code)}
                  size="sm"
                  variant="ghost"
                  borderRadius="full"
                  opacity={lang === code ? 1 : 0.5}
                  boxShadow={lang === code ? "0 0 0 2px var(--chakra-colors-blue-400)" : "none"}
                />
              ))}
            </HStack>

            {/* Icon only on narrow screens so the controls fit */}
            <IconButton
              display={{ base: "inline-flex", sm: "none" }}
              aria-label={t("header.refresh")}
              icon={loading ? <Spinner size="sm" /> : <Icon as={FaSync} />}
              size="sm"
              onClick={() => refresh(true)}
              isDisabled={loading}
            />
            <Button
              display={{ base: "none", sm: "inline-flex" }}
              leftIcon={loading ? <Spinner size="sm" /> : <Icon as={FaSync} />}
              size="sm"
              onClick={() => refresh(true)}
              isDisabled={loading}
            >
              {t("header.refresh")}
            </Button>

            <IconButton
              aria-label={t("header.toggleColorMode")}
              icon={colorMode === "dark" ? <FaSun /> : <FaMoon />}
              onClick={toggleColorMode}
              size="sm"
            />
          </Wrap>
        </Wrap>

        <Tabs index={tab} onChange={setTab} isLazy variant="soft-rounded" colorScheme="blue" size="sm">
          <TabList mb={6}>
            <Tab>{t("tab.live")}</Tab>
            <Tab>{t("tab.history")}</Tab>
          </TabList>

          <TabPanels>
            <TabPanel p={0}>
              {error && (
                <Alert status="error" mb={6}>
                  <AlertIcon />
                  <AlertTitle>{t("error.title")}</AlertTitle>
                  <AlertDescription>{t("error.description")}</AlertDescription>
                </Alert>
              )}

              {/* Latest Measurements */}
              <SimpleGrid columns={{ base: 2, sm: 3, lg: 6 }} spacing={{ base: 3, md: 4 }} mb={8}>
                {METRICS.map((metric) => (
                  <MetricCard
                    key={metric.key}
                    metric={metric}
                    value={latest?.[metric.key]}
                    trend={latestTime === null ? null : getTrend(pointsByKey[metric.key], latest[metric.key], latestTime, metric)}
                    sparkPoints={pointsInWindow(pointsByKey[metric.key], sparkWindow)}
                    loading={loading}
                  />
                ))}
              </SimpleGrid>

              {/* Charts */}
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                {METRICS.map((metric) => (
                  <MetricChart
                    key={metric.key}
                    metric={metric}
                    points={pointsByKey[metric.key]}
                    window={liveWindow}
                    loading={loading}
                  />
                ))}
              </SimpleGrid>
            </TabPanel>

            <TabPanel p={0}>
              <HistoryView />
            </TabPanel>
          </TabPanels>
        </Tabs>
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
      <LanguageProvider>
        <Dashboard />
      </LanguageProvider>
    </ChakraProvider>
  );
}
