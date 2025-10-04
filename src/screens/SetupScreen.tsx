import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
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

export type MatchType = 'singles' | 'doubles';

type TeamKey = 'sideA' | 'sideB';

type PlayerNamesState = Record<TeamKey, [string, string]>;

const initialPlayerNames: PlayerNamesState = {
  sideA: ['', ''],
  sideB: ['', ''],
};

export default function SetupScreen() {
  const [matchType, setMatchType] = useState<MatchType>('singles');
  const [playerNames, setPlayerNames] = useState<PlayerNamesState>(initialPlayerNames);
  const [showValidation, setShowValidation] = useState(false);

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

    // TODO: wire up navigation and match state when the scoreboard is implemented.
    Alert.alert('Match setup complete', 'Score tracking will be available in the next step.');
  }, [allNamesProvided]);

  const nameError = showValidation ? 'Please enter a name' : undefined;

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flexContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <ThemedText type="title" style={styles.heading}>
            Match Setup
          </ThemedText>

          <View style={styles.section}>
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

          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Side A
            </ThemedText>
            <View>
              <View style={styles.inputWrapper}>
                <PlayerNameInput
                  label={matchType === 'doubles' ? 'Player 1' : 'Player'}
                  value={playerNames.sideA[0]}
                  onChangeText={(text) => handleNameChange('sideA', 0, text)}
                  returnKeyType="next"
                  autoCapitalize="words"
                  errorMessage={
                    showValidation && playerNames.sideA[0].trim().length === 0 ? nameError : undefined
                  }
                />
              </View>
              {matchType === 'doubles' && (
                <View style={styles.inputWrapper}>
                  <PlayerNameInput
                    label="Player 2"
                    value={playerNames.sideA[1]}
                    onChangeText={(text) => handleNameChange('sideA', 1, text)}
                    returnKeyType="next"
                    autoCapitalize="words"
                    errorMessage={
                      showValidation && playerNames.sideA[1].trim().length === 0 ? nameError : undefined
                    }
                  />
                </View>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Side B
            </ThemedText>
            <View>
              <View style={styles.inputWrapper}>
                <PlayerNameInput
                  label={matchType === 'doubles' ? 'Player 1' : 'Player'}
                  value={playerNames.sideB[0]}
                  onChangeText={(text) => handleNameChange('sideB', 0, text)}
                  returnKeyType="next"
                  autoCapitalize="words"
                  errorMessage={
                    showValidation && playerNames.sideB[0].trim().length === 0 ? nameError : undefined
                  }
                />
              </View>
              {matchType === 'doubles' && (
                <View style={styles.inputWrapper}>
                  <PlayerNameInput
                    label="Player 2"
                    value={playerNames.sideB[1]}
                    onChangeText={(text) => handleNameChange('sideB', 1, text)}
                    returnKeyType="done"
                    autoCapitalize="words"
                    errorMessage={
                      showValidation && playerNames.sideB[1].trim().length === 0 ? nameError : undefined
                    }
                  />
                </View>
              )}
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
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  flexContainer: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 32,
  },
  heading: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  matchTypeRow: {
    flexDirection: 'row',
  },
  matchTypeToggleSpacing: {
    marginRight: 12,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  footer: {
    paddingTop: 12,
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
