import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { PlayerNameInput, PrimaryButton } from '#/components/shared';
import { ThemedText } from '#/components/themed-text';
import { ThemedView } from '#/components/themed-view';
import { useColorScheme } from '#/hooks/use-color-scheme';
import { useMatch } from '#/state/MatchContext';
import type { MatchType } from '#/types/match';

type TeamKey = 'sideA' | 'sideB';

type PlayerNamesState = Record<TeamKey, [string, string]>;

const initialPlayerNames: PlayerNamesState = {
  sideA: ['', ''],
  sideB: ['', ''],
};

export default function SetupScreen() {
  const router = useRouter();
  const { startMatch } = useMatch();
  const [matchType, setMatchType] = useState<MatchType>('singles');
  const [playerNames, setPlayerNames] = useState<PlayerNamesState>(initialPlayerNames);
  const [showValidation, setShowValidation] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';

  const courtBackground = colorScheme === 'light' ? '#0a8f3d' : '#064e3b';
  const courtLineColor = '#f8fafc';
  const sideContainerOverlay = colorScheme === 'light' ? 'rgba(255,255,255,0.14)' : 'rgba(15,23,42,0.4)';
  const sideBorderColor = colorScheme === 'light' ? 'rgba(255,255,255,0.4)' : 'rgba(226,232,240,0.5)';
  const sideLabelColor = colorScheme === 'light' ? '#f8fafc' : '#e0f2fe';
  const inputBackground = colorScheme === 'light' ? 'rgba(255,255,255,0.92)' : 'rgba(15,23,42,0.92)';
  const inputTextColor = colorScheme === 'light' ? '#0f172a' : '#f8fafc';
  const inputLabelColor = colorScheme === 'light' ? '#065f46' : '#bfdbfe';

  const requiredNames = useMemo(() => {
    if (matchType === 'singles') {
      return [playerNames.sideA[0], playerNames.sideB[0]];
    }

    return [
      playerNames.sideA[0],
      playerNames.sideA[1],
      playerNames.sideB[0],
      playerNames.sideB[1],
    ];
  }, [matchType, playerNames]);

  const allNamesProvided = useMemo(
    () => requiredNames.every((name) => name.trim().length > 0),
    [requiredNames],
  );

  useEffect(() => {
    if (showValidation && allNamesProvided) {
      setShowValidation(false);
    }
  }, [allNamesProvided, showValidation]);

  const handleMatchTypeChange = useCallback((type: MatchType) => {
    setMatchType(type);
    setShowValidation(false);
  }, []);

  const handleNameChange = useCallback((team: TeamKey, index: 0 | 1, value: string) => {
    setPlayerNames((current) => {
      const updatedTeam = [...current[team]] as [string, string];
      updatedTeam[index] = value;

      return {
        ...current,
        [team]: updatedTeam,
      };
    });
  }, []);

  const handleStartMatch = useCallback(() => {
    if (!allNamesProvided) {
      setShowValidation(true);
      return;
    }

    startMatch({ matchType, playerNames });
    router.push('/scoreboard');
  }, [allNamesProvided, matchType, playerNames, router, startMatch]);

  const nameError = showValidation ? 'Please enter a name' : undefined;

  return (
    <ThemedView style={styles.container} lightColor={courtBackground} darkColor={courtBackground}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flexContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <ThemedText type="title" style={styles.heading}>
            Match Setup
          </ThemedText>

          <View style={styles.matchTypeSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Match Type
            </ThemedText>
            <View style={styles.matchTypeRow}>
              <MatchTypeToggle
                label="Singles"
                isActive={matchType === 'singles'}
                onPress={() => handleMatchTypeChange('singles')}
                style={styles.matchTypeToggleSpacing}
              />
              <MatchTypeToggle
                label="Doubles"
                isActive={matchType === 'doubles'}
                onPress={() => handleMatchTypeChange('doubles')}
              />
            </View>
          </View>

          <View style={styles.courtWrapper}>
            <View
              style={[
                styles.court,
                {
                  borderColor: courtLineColor,
                  backgroundColor: courtBackground,
                },
              ]}
            >
              <View
                style={[
                  styles.horizontalLine,
                  styles.topServiceLine,
                  { backgroundColor: courtLineColor },
                ]}
              />
              <View
                style={[
                  styles.horizontalLine,
                  styles.bottomServiceLine,
                  { backgroundColor: courtLineColor },
                ]}
              />
              <View
                style={[
                  styles.verticalLine,
                  styles.leftServiceLine,
                  { backgroundColor: courtLineColor },
                ]}
              />
              <View
                style={[
                  styles.verticalLine,
                  styles.rightServiceLine,
                  { backgroundColor: courtLineColor },
                ]}
              />
              <View
                style={[
                  styles.verticalLine,
                  styles.singlesLine,
                  styles.singlesLeft,
                  { backgroundColor: courtLineColor },
                ]}
              />
              <View
                style={[
                  styles.verticalLine,
                  styles.singlesLine,
                  styles.singlesRight,
                  { backgroundColor: courtLineColor },
                ]}
              />
              <View style={[styles.centerLine, { borderColor: courtLineColor }]} />

              <View
                style={[
                  styles.sideContainer,
                  styles.sideAContainer,
                  { backgroundColor: sideContainerOverlay, borderColor: sideBorderColor },
                ]}
              >
                <ThemedText style={[styles.sideLabel, { color: sideLabelColor }]}>Side A</ThemedText>
                <View style={[styles.inputSlot, matchType === 'singles' ? styles.inputSlotLast : null]}>
                  <PlayerNameInput
                    label={matchType === 'doubles' ? 'Player 1' : 'Player'}
                    value={playerNames.sideA[0]}
                    onChangeText={(text) => handleNameChange('sideA', 0, text)}
                    returnKeyType="next"
                    autoCapitalize="words"
                    errorMessage={
                      showValidation && playerNames.sideA[0].trim().length === 0 ? nameError : undefined
                    }
                    labelStyle={[styles.inputLabel, { color: inputLabelColor }]}
                    style={[
                      styles.inputOnCourt,
                      { backgroundColor: inputBackground, color: inputTextColor },
                    ]}
                  />
                </View>
                {matchType === 'doubles' && (
                  <View style={[styles.inputSlot, styles.inputSlotLast]}>
                    <PlayerNameInput
                      label="Player 2"
                      value={playerNames.sideA[1]}
                      onChangeText={(text) => handleNameChange('sideA', 1, text)}
                      returnKeyType="next"
                      autoCapitalize="words"
                      errorMessage={
                        showValidation && playerNames.sideA[1].trim().length === 0 ? nameError : undefined
                      }
                      labelStyle={[styles.inputLabel, { color: inputLabelColor }]}
                      style={[
                        styles.inputOnCourt,
                        { backgroundColor: inputBackground, color: inputTextColor },
                      ]}
                    />
                  </View>
                )}
              </View>

              <View
                style={[
                  styles.sideContainer,
                  styles.sideBContainer,
                  { backgroundColor: sideContainerOverlay, borderColor: sideBorderColor },
                ]}
              >
                <ThemedText style={[styles.sideLabel, { color: sideLabelColor }]}>Side B</ThemedText>
                <View style={[styles.inputSlot, matchType === 'singles' ? styles.inputSlotLast : null]}>
                  <PlayerNameInput
                    label={matchType === 'doubles' ? 'Player 1' : 'Player'}
                    value={playerNames.sideB[0]}
                    onChangeText={(text) => handleNameChange('sideB', 0, text)}
                    returnKeyType="next"
                    autoCapitalize="words"
                    errorMessage={
                      showValidation && playerNames.sideB[0].trim().length === 0 ? nameError : undefined
                    }
                    labelStyle={[styles.inputLabel, { color: inputLabelColor }]}
                    style={[
                      styles.inputOnCourt,
                      { backgroundColor: inputBackground, color: inputTextColor },
                    ]}
                  />
                </View>
                {matchType === 'doubles' && (
                  <View style={[styles.inputSlot, styles.inputSlotLast]}>
                    <PlayerNameInput
                      label="Player 2"
                      value={playerNames.sideB[1]}
                      onChangeText={(text) => handleNameChange('sideB', 1, text)}
                      returnKeyType="done"
                      autoCapitalize="words"
                      errorMessage={
                        showValidation && playerNames.sideB[1].trim().length === 0 ? nameError : undefined
                      }
                      labelStyle={[styles.inputLabel, { color: inputLabelColor }]}
                      style={[
                        styles.inputOnCourt,
                        { backgroundColor: inputBackground, color: inputTextColor },
                      ]}
                    />
                  </View>
                )}
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          {showValidation && !allNamesProvided && (
            <ThemedText style={styles.validationMessage}>
              Please fill in all player names to start the match.
            </ThemedText>
          )}
          <PrimaryButton label="Start Match" onPress={handleStartMatch} />
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

type MatchTypeToggleProps = {
  label: string;
  isActive: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

function MatchTypeToggle({ label, isActive, onPress, style }: MatchTypeToggleProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const activeBackground = '#2563eb';
  const inactiveBackground = colorScheme === 'light' ? '#e2e8f0' : '#1f2937';
  const borderColor = colorScheme === 'light' ? '#cbd5f5' : '#334155';
  const activeTextColor = '#ffffff';
  const inactiveTextColor = colorScheme === 'light' ? '#0f172a' : '#e2e8f0';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.matchTypeToggle,
        style,
        {
          backgroundColor: isActive ? activeBackground : inactiveBackground,
          borderColor: isActive ? activeBackground : borderColor,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.matchTypeToggleLabel,
          { color: isActive ? activeTextColor : inactiveTextColor },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  flexContainer: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  heading: {
    marginBottom: 24,
    textAlign: 'center',
  },
  matchTypeSection: {
    width: '100%',
    maxWidth: 520,
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
    textAlign: 'center',
  },
  matchTypeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  matchTypeToggleSpacing: {
    marginRight: 12,
  },
  courtWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  court: {
    width: '100%',
    maxWidth: 520,
    aspectRatio: 13 / 6,
    borderRadius: 28,
    borderWidth: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  horizontalLine: {
    position: 'absolute',
    left: '8%',
    right: '8%',
    height: 3,
  },
  topServiceLine: {
    top: '26%',
  },
  bottomServiceLine: {
    bottom: '26%',
  },
  verticalLine: {
    position: 'absolute',
    top: '16%',
    bottom: '16%',
    width: 3,
  },
  leftServiceLine: {
    left: '28%',
  },
  rightServiceLine: {
    right: '28%',
  },
  singlesLine: {
    top: '8%',
    bottom: '8%',
    width: 2,
  },
  singlesLeft: {
    left: '18%',
  },
  singlesRight: {
    right: '18%',
  },
  centerLine: {
    position: 'absolute',
    top: '8%',
    bottom: '8%',
    left: '50%',
    borderLeftWidth: 3,
    borderStyle: 'dashed',
  },
  sideContainer: {
    position: 'absolute',
    width: '40%',
    top: '12%',
    bottom: '12%',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
  },
  sideAContainer: {
    left: '6%',
  },
  sideBContainer: {
    right: '6%',
  },
  sideLabel: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  inputSlot: {
    marginBottom: 14,
  },
  inputSlotLast: {
    marginBottom: 0,
  },
  inputLabel: {
    textTransform: 'uppercase',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  inputOnCourt: {
    borderWidth: 0,
  },
  footer: {
    paddingTop: 16,
  },
  validationMessage: {
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 12,
  },
  matchTypeToggle: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  matchTypeToggleLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
