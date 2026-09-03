import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { CosmicScreenBackdrop } from '../components/CosmicScreenBackdrop';
import { PetAvatar } from '../components/PetAvatar';
import { DayPillarColumn } from '../components/DayPillarColumn';
import { ClickablePillarColumn } from '../components/ClickablePillarColumn';
import {
  ReadingPageContent,
  useReadingLayout,
} from '../components/ReadingPageContent';
import { colors } from '../constants/colors';
import {
  readingScrollContent,
  READING_WIDE_BREAKPOINT,
} from '../constants/readingLayout';

const HERO_TABLET_BREAKPOINT = 640;
import { formatSpeciesLabel, normalizeSpecies } from '../constants/petSpecies';
import { hanziFont, serifFont, sansFont } from '../constants/typography';
import { DAY_PILLAR_LIBRARY } from '../data/dayPillarLibrary';
import {
  buildPillarStages,
  getPillarStageReading,
} from '../utils/pillarStageCopy';
import { buildYearChildhoodStageReading } from '../utils/yearPillarChildhoodReading';
import { buildMonthYoungGrowthStageReading } from '../utils/monthPillarYoungGrowthReading';
import { buildHourInnerSelfStageReading } from '../utils/hourPillarInnerSelfReading';
import {
  getDayMasterElement,
  getHeroBondLabel,
} from '../utils/readingDisplay';
import {
  getKanjiTextStyle,
  getStemKanjiTextStyle,
  getBranchElement,
} from '../utils/pillarElements';
import { ElementBadge } from '../components/ElementBadge';
import { ReportFrame } from '../components/ReportOrnament';

const STAGE_PILLARS = new Set(['year', 'month', 'hour']);

function getDayPillarKey(chart) {
  const day = chart?.pillars?.day;
  if (!day?.stem || !day?.branch) return null;
  return `${day.stem}${day.branch}`;
}

function KanjiPairVertical({ stem, branch, size = 32, stemPillarKey = 'day' }) {
  const branchEl = getBranchElement(branch);
  return (
    <View style={styles.kanjiPair}>
      <Text style={getStemKanjiTextStyle(stem, stemPillarKey, size, size + 6)}>{stem}</Text>
      <Text style={[getKanjiTextStyle(branchEl, size, size + 6), { marginTop: 2 }]}>
        {branch}
      </Text>
    </View>
  );
}

function ChartHint({ isWide }) {
  return (
    <Text style={[styles.chartHint, isWide && styles.chartHintWide]}>
      Tap Year, Month, or Hour to read that chapter.
    </Text>
  );
}

function FourPillarsChart({ stages, selectedPillar, onSelectPillar, isWide }) {
  return (
    <View style={[styles.pillarRow, isWide && styles.pillarRowWide]}>
      {stages.map((stage) => {
        if (stage.key === 'day') {
          const selected = selectedPillar === 'day';
          return (
            <DayPillarColumn
              key={stage.key}
              stage={stage}
              selected={selected}
              isWide={isWide}
              onPress={() => onSelectPillar(selected ? null : 'day')}
            />
          );
        }
        const selected = selectedPillar === stage.key;
        return (
          <ClickablePillarColumn
            key={stage.key}
            stage={stage}
            selected={selected}
            isWide={isWide}
            onPress={() => onSelectPillar(selected ? null : stage.key)}
          />
        );
      })}
    </View>
  );
}

function CoreProfileField({ label, value, isScore = false, showDivider }) {
  return (
    <View style={[styles.coreProfileField, showDivider && styles.coreProfileFieldDivider]}>
      <Text style={styles.coreProfileLabel}>{label}</Text>
      {isScore ? (
        <Text style={styles.coreProfileScore}>{value}</Text>
      ) : (
        <Text style={styles.coreProfileValue}>{value}</Text>
      )}
    </View>
  );
}

function buildProfileEssenceLines(coreElement, heroBond) {
  const lines = [];
  if (coreElement) {
    const bondClause = heroBond
      ? ` with a ${heroBond.toLowerCase()} bond pattern`
      : '';
    lines.push(`A ${coreElement} Day Master${bondClause}.`);
  } else if (heroBond) {
    lines.push(`Bond pattern: ${heroBond}.`);
  }
  lines.push('Core reading is anchored by the Day Pillar.');
  return lines.slice(0, 2);
}

const CORE_STATS = [
  { field: 'extroversion', label: 'Energy' },
  { field: 'likelyCatBreed', label: 'Cat type' },
  { field: 'likelyDogBreed', label: 'Dog type' },
  { field: 'troublemakingScore', label: 'Mischief', isScore: true },
  { field: 'attachmentLevel', label: 'Bond', isScore: true },
];

function CoreComboMedallion({ chart, comboKey, isWide }) {
  const stem = chart?.pillars?.day?.stem;
  const branch = chart?.pillars?.day?.branch;
  const size = isWide ? 48 : 42;
  if (!stem || !branch) {
    return (
      <View style={[styles.coreComboBlock, isWide && styles.coreComboBlockWide]}>
        <Text style={[styles.coreComboHanziFallback, { color: colors.cream }]}>
          {comboKey}
        </Text>
      </View>
    );
  }
  return (
    <View style={[styles.coreComboBlock, isWide && styles.coreComboBlockWide]}>
      <KanjiPairVertical stem={stem} branch={branch} size={size} />
      <Text style={styles.coreComboCn}>日柱</Text>
    </View>
  );
}

function CorePersonalityCard({ comboKey, entry, chart, isWide }) {
  const traitsList =
    entry && CORE_STATS.length > 0 ? (
      <View style={styles.coreTraitsStack}>
        {CORE_STATS.map(({ field, label, isScore }, index) => (
          <CoreProfileField
            key={field}
            label={label}
            value={entry[field]}
            isScore={isScore}
            showDivider={index < CORE_STATS.length - 1}
          />
        ))}
      </View>
    ) : null;

  const readingBlock = entry?.reading ? (
    <View style={styles.coreNarrative}>
      <Text style={styles.coreReadingLabel}>Reading</Text>
      <Text style={[styles.coreReading, isWide && styles.coreReadingWide]}>
        {entry.reading}
      </Text>
    </View>
  ) : null;

  return (
    <ReportFrame variant="core" style={[styles.coreCard, isWide && styles.coreCardWide]}>
      <View style={[styles.coreCardInner, isWide && styles.coreCardInnerWide]}>
        <View style={[styles.coreHeader, isWide && styles.coreHeaderWide]}>
          {comboKey ? (
            <Text style={styles.coreKicker}>{comboKey} · 日柱</Text>
          ) : (
            <Text style={styles.coreKicker}>日柱</Text>
          )}
          <Text style={[styles.coreTitle, isWide && styles.coreTitleWide]}>
            Core Personality
          </Text>
        </View>

        {entry ? (
          isWide ? (
            <View style={styles.coreMainRow}>
              <View style={styles.corePillarCol}>
                <CoreComboMedallion chart={chart} comboKey={comboKey} isWide={isWide} />
              </View>
              <View style={styles.coreContentCol}>
                {traitsList}
                {readingBlock}
              </View>
            </View>
          ) : (
            <View style={styles.coreMainStack}>
              <CoreComboMedallion chart={chart} comboKey={comboKey} isWide={false} />
              {traitsList}
              {readingBlock}
            </View>
          )
        ) : (
          <View style={styles.coreMissing}>
            <Text style={styles.coreMissingText}>
              This Day Pillar is not yet in the Hachi library.
            </Text>
            {comboKey ? <Text style={styles.coreMissingKey}>{comboKey}</Text> : null}
          </View>
        )}
      </View>
    </ReportFrame>
  );
}

function StageDetailRow({ label, value, showDivider }) {
  return (
    <View style={[styles.stageDetailRow, showDivider && styles.stageDetailRowDivider]}>
      <Text style={styles.stageDetailLabel}>{label}</Text>
      <Text style={styles.stageDetailValue}>{value}</Text>
    </View>
  );
}

function StagePillarVisual({ combo, stem, branch, pillarKey, isWide }) {
  if (!stem || !branch) return null;
  return (
    <View style={[styles.stageComboBlock, isWide && styles.stageComboBlockWide]}>
      <KanjiPairVertical
        stem={stem}
        branch={branch}
        size={isWide ? 40 : 32}
        stemPillarKey={pillarKey || 'year'}
      />
      <Text style={styles.stageComboKey}>{combo}</Text>
    </View>
  );
}

function StageReadingNarrative({ content, isWide }) {
  if (!content.body && !content.missingKey) return null;
  return (
    <View style={styles.stageNarrative}>
      {content.readingLabel && content.body ? (
        <Text style={styles.stageReadingSectionLabel}>{content.readingLabel}</Text>
      ) : null}
      {content.body ? (
        <Text style={[styles.stageReadingBody, isWide && styles.stageReadingBodyWide]}>
          {content.body}
        </Text>
      ) : null}
      {content.missingKey ? (
        <Text style={styles.stageMissingKey}>{content.missingKey}</Text>
      ) : null}
    </View>
  );
}

function StageReadingCard({ content, isWide }) {
  const combo = content.combo;
  const stem = combo?.[0];
  const branch = combo?.[1];
  const fields = content.fields || [];
  const pillarKey = content.pillarKey || 'year';

  const traitsList =
    fields.length > 0 ? (
      <View style={[styles.stageTraitsCol, isWide && styles.stageTraitsColWide]}>
        {fields.map((row, index) => (
          <StageDetailRow
            key={row.label}
            label={row.label}
            value={row.value}
            showDivider={index < fields.length - 1}
          />
        ))}
      </View>
    ) : null;

  const pillarAndReading = (
    <View style={[styles.stagePillarCol, isWide && styles.stagePillarColWide]}>
      <StagePillarVisual
        combo={combo}
        stem={stem}
        branch={branch}
        pillarKey={pillarKey}
        isWide={isWide}
      />
      <StageReadingNarrative content={content} isWide={isWide} />
    </View>
  );

  return (
    <Card variant="glass" style={[styles.stageCard, isWide && styles.stageCardWide]}>
      <View style={[styles.stageHeader, isWide && styles.stageHeaderWide]}>
        <Text style={styles.stageEyebrow}>Life stage</Text>
        <Text style={[styles.stageReadingTitle, isWide && styles.stageReadingTitleWide]}>
          {content.title}
        </Text>
        {content.subtitle ? (
          <Text style={[styles.stageReadingSubtitle, isWide && styles.stageReadingSubtitleWide]}>
            {content.subtitle}
          </Text>
        ) : null}
        {content.age ? <Text style={styles.stageReadingAge}>{content.age}</Text> : null}
      </View>

      {isWide ? (
        <View style={styles.stageMainRow}>
          {traitsList ?? <View style={styles.stageTraitsColSpacer} />}
          {pillarAndReading}
        </View>
      ) : (
        <View style={styles.stageMainStack}>
          <StagePillarVisual
            combo={combo}
            stem={stem}
            branch={branch}
            pillarKey={pillarKey}
            isWide={false}
          />
          {traitsList}
          <StageReadingNarrative content={content} isWide={false} />
        </View>
      )}
    </Card>
  );
}

function HeroMetricTile({ label, children }) {
  return (
    <View style={styles.heroMetricTile}>
      <Text style={styles.heroMetricLabel}>{label}</Text>
      <View style={styles.heroMetricValue}>{children}</View>
    </View>
  );
}

function ProfileEssenceBlock({ lines, compact }) {
  return (
    <View style={[styles.heroEssenceBlock, compact && styles.heroEssenceBlockCompact]}>
      <Text style={styles.heroEssenceTitle}>Profile Essence</Text>
      {lines.map((line, index) => (
        <Text key={`essence-${index}`} style={styles.heroEssenceLine}>
          {line}
        </Text>
      ))}
    </View>
  );
}

function ProfileSummaryCard({
  petName,
  species,
  coreElement,
  heroBond,
  zodiac,
  isWide,
}) {
  const { width } = useWindowDimensions();
  const isDesktop =
    Platform.OS === 'web' && width >= READING_WIDE_BREAKPOINT;
  const isTablet =
    Platform.OS === 'web' &&
    width >= HERO_TABLET_BREAKPOINT &&
    width < READING_WIDE_BREAKPOINT;

  const kind = normalizeSpecies(species);
  const speciesLine = [formatSpeciesLabel(kind), zodiac].filter(Boolean).join(' · ');
  const essenceLines = buildProfileEssenceLines(coreElement, heroBond);
  const avatarSize = isDesktop ? 76 : isTablet ? 68 : 64;

  const identityBlock = (
    <View style={styles.heroIdentityBlock}>
      <PetAvatar species={kind} size={avatarSize} />
      <View style={styles.heroIdentityText}>
        <Text style={[styles.petName, (isDesktop || isTablet) && styles.petNameWide]}>
          {petName}
        </Text>
        {speciesLine ? (
          <Text
            style={[
              styles.profileSpecies,
              (isDesktop || isTablet) && styles.profileSpeciesWide,
            ]}
          >
            {speciesLine}
          </Text>
        ) : null}
      </View>
    </View>
  );

  const metricsCol = (
    <View style={styles.heroMetricsCol}>
      <HeroMetricTile label="Day Master">
        {coreElement ? (
          <ElementBadge element={coreElement} size="small" variant="subtle" />
        ) : (
          <Text style={styles.heroMetricText}>—</Text>
        )}
      </HeroMetricTile>
      <HeroMetricTile label="Bond">
        <Text style={styles.heroMetricText} numberOfLines={1}>
          {heroBond || '—'}
        </Text>
      </HeroMetricTile>
    </View>
  );

  return (
    <ReportFrame variant="hero" style={[styles.profileCard, isDesktop && styles.profileCardWide]}>
      <View style={[styles.profileCardInner, isDesktop && styles.profileCardInnerWide]}>
        {isDesktop ? (
          <View style={styles.heroPlaqueRow}>
            <View style={styles.heroColLeft}>{identityBlock}</View>
            <View style={styles.heroDividerV} />
            <View style={styles.heroColCenter}>
              <ProfileEssenceBlock lines={essenceLines} />
            </View>
            <View style={styles.heroDividerV} />
            <View style={styles.heroColRight}>{metricsCol}</View>
          </View>
        ) : isTablet ? (
          <>
            <View style={styles.heroTabletTop}>
              <View style={styles.heroColLeftTablet}>{identityBlock}</View>
              <View style={styles.heroColRightTablet}>{metricsCol}</View>
            </View>
            <View style={styles.heroDividerH} />
            <ProfileEssenceBlock lines={essenceLines} compact />
          </>
        ) : (
          <View style={styles.heroMobileStack}>
            {identityBlock}
            <View style={styles.heroDividerH} />
            <ProfileEssenceBlock lines={essenceLines} compact />
            <View style={styles.heroDividerH} />
            {metricsCol}
          </View>
        )}
      </View>
    </ReportFrame>
  );
}

function MethodNoteCard({ chart }) {
  const notes = [];
  if (chart.input?.birthTimeWasDefaulted) {
    notes.push('Birth time estimated at 12:00 PM. Hour Pillar is approximate.');
  }
  if (chart.input?.birthLocationWasDefaulted) {
    notes.push('Location set to Chengdu, China (Beijing Time).');
  }
  if (notes.length === 0) return null;

  return (
    <View style={styles.methodCard}>
      {notes.map((text) => (
        <Text key={text} style={styles.methodNoteText}>
          {text}
        </Text>
      ))}
    </View>
  );
}

function ChartErrorCard({ chart }) {
  return (
    <Card variant="glass" style={styles.errorCard}>
      <Text style={styles.errorTitle}>Chart unavailable</Text>
      <Text style={styles.errorDetail}>
        {chart?.error || 'Please return and confirm birth details.'}
      </Text>
    </Card>
  );
}

export default function PetReadingScreen({ navigation, route }) {
  const { result } = route.params || {};
  const [selectedPillar, setSelectedPillar] = useState(null);
  const { isWide } = useReadingLayout();

  const chart = result?.chart;
  const chartOk = chart?.success === true;
  const petName = result?.petName;
  const species = normalizeSpecies(result?.species);

  const pillarStages = useMemo(
    () => (chartOk ? buildPillarStages(chart) : []),
    [chartOk, chart]
  );

  const dayPillarKey = useMemo(
    () => (chartOk ? getDayPillarKey(chart) : null),
    [chartOk, chart]
  );

  const dayPillarEntry = useMemo(
    () => (dayPillarKey ? DAY_PILLAR_LIBRARY[dayPillarKey] : null),
    [dayPillarKey]
  );

  const showCorePersonality = !selectedPillar || selectedPillar === 'day';

  const stageReading = useMemo(() => {
    if (!chartOk || !selectedPillar || !STAGE_PILLARS.has(selectedPillar)) {
      return null;
    }
    if (selectedPillar === 'year') {
      return buildYearChildhoodStageReading(chart);
    }
    if (selectedPillar === 'month') {
      return buildMonthYoungGrowthStageReading(chart);
    }
    if (selectedPillar === 'hour') {
      return buildHourInnerSelfStageReading(chart);
    }
    return getPillarStageReading(selectedPillar, petName, chart);
  }, [chartOk, selectedPillar, petName, chart]);

  const coreElement = useMemo(
    () => (chartOk ? getDayMasterElement(chart) : null),
    [chartOk, chart]
  );

  const heroBond = useMemo(() => {
    const fromLibrary = getHeroBondLabel(dayPillarEntry);
    if (fromLibrary) return fromLibrary;
    return result?.petProfile?.bondingLabel || null;
  }, [dayPillarEntry, result?.petProfile?.bondingLabel]);

  if (!result) {
    navigation.replace('Welcome');
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <CosmicScreenBackdrop glowY={0.05} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={readingScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ReadingPageContent style={styles.content}>
          <ProfileSummaryCard
            petName={petName}
            species={species}
            coreElement={coreElement}
            heroBond={heroBond}
            zodiac={chartOk ? chart.zodiac : null}
            isWide={isWide}
          />

          {chartOk ? (
            <View style={styles.chartSection}>
              <View style={[styles.chartFocusHeader, isWide && styles.chartFocusHeaderWide]}>
                <View style={styles.chartFocusRule} />
                <Text style={[styles.chartHeroTitle, isWide && styles.chartHeroTitleWide]}>
                  Four Pillars
                </Text>
                <Text style={styles.chartSubtitle}>八字命盘</Text>
              </View>

              <ChartHint isWide={isWide} />

              <ReportFrame
                variant="board"
                style={[styles.boardCard, isWide && styles.boardCardWide]}
              >
                <View style={[styles.boardInner, isWide && styles.boardInnerWide]}>
                  <FourPillarsChart
                    stages={pillarStages}
                    selectedPillar={selectedPillar}
                    onSelectPillar={setSelectedPillar}
                    isWide={isWide}
                  />
                </View>
              </ReportFrame>

              {showCorePersonality ? (
                <CorePersonalityCard
                  comboKey={dayPillarKey}
                  entry={dayPillarEntry}
                  chart={chart}
                  isWide={isWide}
                />
              ) : stageReading ? (
                <StageReadingCard content={stageReading} isWide={isWide} />
              ) : null}

              <MethodNoteCard chart={chart} />
            </View>
          ) : (
            <ChartErrorCard chart={chart} />
          )}

          <Button
            title="Compatibility reading"
            onPress={() => navigation.navigate('Compatibility', { result })}
            variant="primary"
            style={[styles.cta, isWide && styles.ctaWide]}
          />
        </ReadingPageContent>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1, zIndex: 1 },
  content: {
    paddingTop: Platform.OS === 'web' ? 28 : 20,
    paddingBottom: 48,
  },
  profileCard: {
    marginBottom: 20,
    width: '100%',
  },
  profileCardWide: {
    marginBottom: 28,
  },
  profileCardInner: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  profileCardInnerWide: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  heroPlaqueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 88,
  },
  heroColLeft: {
    width: '28%',
    minWidth: 200,
    maxWidth: 280,
    flexShrink: 0,
    paddingRight: 8,
  },
  heroColCenter: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  heroColRight: {
    width: '26%',
    minWidth: 200,
    maxWidth: 260,
    flexShrink: 0,
    paddingLeft: 8,
  },
  heroColLeftTablet: {
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
  },
  heroColRightTablet: {
    width: 220,
    flexShrink: 0,
  },
  heroTabletTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  heroMobileStack: {
    gap: 0,
  },
  heroIdentityBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  heroIdentityText: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  petName: {
    fontFamily: serifFont,
    fontSize: 22,
    fontWeight: '600',
    color: colors.cream,
    lineHeight: 28,
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  petNameWide: {
    fontSize: 26,
    lineHeight: 32,
    marginBottom: 5,
  },
  profileSpecies: {
    fontFamily: sansFont,
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  profileSpeciesWide: {
    fontSize: 13,
    letterSpacing: 0.6,
  },
  heroDividerV: {
    width: 1,
    alignSelf: 'stretch',
    marginVertical: 2,
    marginHorizontal: 18,
    backgroundColor: 'rgba(201, 169, 98, 0.22)',
  },
  heroDividerH: {
    height: 1,
    marginVertical: 14,
    backgroundColor: 'rgba(201, 169, 98, 0.18)',
  },
  heroEssenceBlock: {
    justifyContent: 'center',
    minWidth: 0,
  },
  heroEssenceBlockCompact: {
    paddingVertical: 2,
  },
  heroEssenceTitle: {
    fontFamily: sansFont,
    fontSize: 9,
    fontWeight: '600',
    color: colors.goldMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  heroEssenceLine: {
    fontFamily: sansFont,
    fontSize: 13,
    lineHeight: 20,
    color: 'rgba(245, 240, 232, 0.78)',
    marginBottom: 6,
  },
  heroMetricsCol: {
    gap: 10,
    width: '100%',
  },
  heroMetricTile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(8, 12, 22, 0.48)',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    minHeight: 44,
  },
  heroMetricLabel: {
    fontFamily: sansFont,
    fontSize: 9,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    flexShrink: 0,
  },
  heroMetricValue: {
    flex: 1,
    alignItems: 'flex-end',
    minWidth: 0,
  },
  heroMetricText: {
    fontFamily: sansFont,
    fontSize: 14,
    fontWeight: '500',
    color: colors.cream,
    textAlign: 'right',
  },
  chartSection: {
    marginBottom: 12,
    marginTop: 4,
  },
  chartFocusHeader: {
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 8,
  },
  chartFocusHeaderWide: {
    marginBottom: 28,
    paddingTop: 12,
  },
  chartFocusRule: {
    width: 64,
    height: 1,
    backgroundColor: 'rgba(201, 169, 98, 0.55)',
    marginBottom: 20,
  },
  chartHeroTitle: {
    fontFamily: serifFont,
    fontSize: 32,
    fontWeight: '600',
    color: colors.cream,
    textAlign: 'center',
    lineHeight: 38,
    letterSpacing: 0.5,
  },
  chartHeroTitleWide: {
    fontSize: 42,
    lineHeight: 50,
    letterSpacing: 0.6,
  },
  chartSubtitle: {
    fontFamily: hanziFont,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 10,
    letterSpacing: 5,
    opacity: 0.7,
  },
  chartHint: {
    fontFamily: sansFont,
    fontSize: 11,
    lineHeight: 16,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 18,
    paddingHorizontal: 12,
    maxWidth: 360,
    alignSelf: 'center',
    opacity: 0.85,
  },
  chartHintWide: {
    marginBottom: 22,
    maxWidth: 420,
  },
  boardCard: {
    marginBottom: 36,
    width: '100%',
    overflow: 'visible',
  },
  boardCardWide: {
    marginBottom: 48,
  },
  boardInner: {
    paddingVertical: 26,
    paddingHorizontal: 12,
    overflow: 'visible',
  },
  boardInnerWide: {
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  pillarRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    alignItems: 'stretch',
    overflow: 'visible',
  },
  pillarRowWide: {
    gap: 14,
    maxWidth: 1100,
    alignSelf: 'center',
    width: '100%',
  },
  kanjiPair: {
    alignItems: 'center',
  },
  coreCard: {
    marginTop: 8,
    marginBottom: 28,
  },
  coreCardWide: {
    marginTop: 12,
    marginBottom: 36,
  },
  coreCardInner: {
    paddingVertical: 22,
    paddingHorizontal: 20,
  },
  coreCardInnerWide: {
    paddingVertical: 28,
    paddingHorizontal: 32,
  },
  coreHeader: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201, 169, 98, 0.14)',
  },
  coreHeaderWide: {
    marginBottom: 22,
    paddingBottom: 18,
  },
  coreKicker: {
    fontFamily: hanziFont,
    fontSize: 13,
    color: colors.goldMuted,
    letterSpacing: 3,
    marginBottom: 8,
    opacity: 0.95,
  },
  coreTitle: {
    fontFamily: serifFont,
    fontSize: 22,
    fontWeight: '600',
    color: colors.cream,
    lineHeight: 28,
    letterSpacing: 0.3,
  },
  coreTitleWide: {
    fontSize: 26,
    lineHeight: 32,
  },
  coreMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 28,
  },
  coreMainStack: {
    gap: 4,
  },
  corePillarCol: {
    width: '32%',
    maxWidth: 200,
    flexShrink: 0,
    alignItems: 'center',
  },
  coreContentCol: {
    flex: 1,
    minWidth: 0,
    paddingLeft: 28,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(168, 180, 196, 0.12)',
  },
  coreComboBlock: {
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(8, 12, 22, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 98, 0.18)',
    alignSelf: 'center',
    width: '100%',
  },
  coreComboBlockWide: {
    marginBottom: 0,
    paddingVertical: 22,
    paddingHorizontal: 22,
  },
  coreComboCn: {
    fontFamily: hanziFont,
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: 3,
    marginTop: 12,
    opacity: 0.9,
  },
  coreComboHanziFallback: {
    fontFamily: hanziFont,
    fontSize: 34,
    letterSpacing: 4,
  },
  coreTraitsStack: {
    marginBottom: 20,
    width: '100%',
  },
  coreProfileField: {
    gap: 6,
    paddingVertical: 10,
  },
  coreProfileFieldDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  coreProfileLabel: {
    fontFamily: sansFont,
    fontSize: 9,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    opacity: 0.92,
  },
  coreProfileValue: {
    fontFamily: sansFont,
    fontSize: 15,
    lineHeight: 23,
    color: colors.cream,
  },
  coreProfileScore: {
    fontFamily: sansFont,
    fontSize: 15,
    fontWeight: '500',
    color: colors.goldLight,
  },
  coreNarrative: {
    width: '100%',
    minWidth: 0,
    paddingTop: 4,
  },
  coreReadingLabel: {
    fontFamily: sansFont,
    fontSize: 9,
    fontWeight: '600',
    color: colors.goldMuted,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  coreReading: {
    fontFamily: serifFont,
    fontSize: 15,
    lineHeight: 27,
    color: 'rgba(245, 240, 232, 0.84)',
    letterSpacing: 0.15,
    width: '100%',
  },
  coreReadingWide: {
    fontSize: 16,
    lineHeight: 29,
    maxWidth: '100%',
  },
  coreMissing: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  coreMissingText: {
    fontFamily: sansFont,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  coreMissingKey: {
    fontFamily: hanziFont,
    fontSize: 18,
    color: colors.textMuted,
    marginTop: 12,
    opacity: 0.55,
  },
  stageCard: {
    borderColor: colors.borderSubtle,
    marginBottom: 28,
    paddingVertical: 24,
    paddingHorizontal: 22,
    backgroundColor: colors.surfaceElevated,
  },
  stageCardWide: {
    paddingVertical: 32,
    paddingHorizontal: 36,
  },
  stageHeader: {
    marginBottom: 22,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201, 169, 98, 0.14)',
  },
  stageHeaderWide: {
    marginBottom: 28,
    paddingBottom: 22,
  },
  stageEyebrow: {
    fontFamily: sansFont,
    fontSize: 9,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 2.2,
    marginBottom: 10,
    textTransform: 'uppercase',
    opacity: 0.9,
  },
  stageReadingTitle: {
    fontFamily: serifFont,
    fontSize: 22,
    fontWeight: '600',
    color: colors.cream,
    lineHeight: 30,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  stageReadingTitleWide: {
    fontSize: 26,
    lineHeight: 34,
  },
  stageReadingSubtitle: {
    fontFamily: sansFont,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 21,
    marginBottom: 6,
  },
  stageReadingSubtitleWide: {
    fontSize: 14,
    lineHeight: 22,
    maxWidth: 720,
  },
  stageReadingAge: {
    fontFamily: sansFont,
    fontSize: 12,
    fontWeight: '500',
    color: colors.goldMuted,
    letterSpacing: 0.3,
  },
  stageMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 32,
  },
  stageMainStack: {
    gap: 4,
  },
  stageTraitsCol: {
    width: '100%',
    marginBottom: 8,
  },
  stageTraitsColWide: {
    width: '40%',
    maxWidth: 320,
    flexShrink: 0,
    marginBottom: 0,
    paddingRight: 4,
  },
  stageTraitsColSpacer: {
    width: '40%',
    maxWidth: 340,
    flexShrink: 0,
  },
  stagePillarCol: {
    width: '100%',
    minWidth: 0,
  },
  stagePillarColWide: {
    flex: 1,
    minWidth: 0,
    paddingLeft: 28,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(168, 180, 196, 0.12)',
  },
  stageComboBlock: {
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 18,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  stageComboBlockWide: {
    alignSelf: 'center',
    marginBottom: 20,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(8, 12, 22, 0.45)',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  stageComboKey: {
    fontFamily: hanziFont,
    fontSize: 13,
    color: colors.goldMuted,
    marginTop: 10,
    letterSpacing: 3,
    opacity: 0.92,
  },
  stageDetailRow: {
    gap: 6,
    paddingVertical: 10,
  },
  stageDetailRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  stageDetailLabel: {
    fontFamily: sansFont,
    fontSize: 9,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    opacity: 0.92,
  },
  stageDetailValue: {
    fontFamily: sansFont,
    fontSize: 15,
    lineHeight: 23,
    color: colors.cream,
  },
  stageNarrative: {
    width: '100%',
    minWidth: 0,
  },
  stageReadingSectionLabel: {
    fontFamily: sansFont,
    fontSize: 9,
    fontWeight: '600',
    color: colors.goldMuted,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  stageMissingKey: {
    fontFamily: hanziFont,
    fontSize: 15,
    color: colors.textMuted,
    marginTop: 12,
    opacity: 0.5,
    letterSpacing: 2,
  },
  stageReadingBody: {
    fontFamily: serifFont,
    fontSize: 15,
    lineHeight: 27,
    color: 'rgba(245, 240, 232, 0.84)',
    width: '100%',
  },
  stageReadingBodyWide: {
    fontSize: 16,
    lineHeight: 29,
    maxWidth: '100%',
  },
  methodCard: {
    marginTop: 8,
    marginBottom: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.ink,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: 6,
  },
  methodNoteText: {
    fontFamily: sansFont,
    fontSize: 11,
    lineHeight: 17,
    color: colors.textMuted,
    opacity: 0.85,
  },
  errorCard: {
    marginBottom: 28,
    borderColor: colors.borderSubtle,
  },
  errorTitle: {
    fontFamily: serifFont,
    fontSize: 18,
    fontWeight: '600',
    color: colors.cream,
    marginBottom: 8,
  },
  errorDetail: {
    fontFamily: sansFont,
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 22,
  },
  cta: { marginTop: 32, marginBottom: 12 },
  ctaWide: {
    marginTop: 40,
    maxWidth: 360,
    alignSelf: 'center',
    width: '100%',
  },
});
