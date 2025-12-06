import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from '../../hooks/useLocation';
import { useWeather } from '../../hooks/useWeather';
import { LoadingSpinner, Button, WeatherCard } from '../../components';
import { colors, typography, spacing } from '../../constants/theme';
import { testAssistantToolCall } from '../../services/test-assistant-api';
import type { AssistantTestResult } from '../../types/assistant';

export default function HomeScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, profile, signOut } = useAuth();
  const { coordinates } = useLocation();
  const { weather, loading: weatherLoading, error: weatherError, refresh: refreshWeather } = useWeather(
    coordinates?.latitude,
    coordinates?.longitude
  );
  const [checkpoint3Loading, setCheckpoint3Loading] = useState(false);
  const [checkpoint3Result, setCheckpoint3Result] = useState<AssistantTestResult | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/login');
    } else if (!isLoading && isAuthenticated && profile) {
      if (!profile.full_name || !profile.health_goals || profile.health_goals.length === 0) {
        router.replace('/profile/setup');
      }
    }
  }, [isLoading, isAuthenticated, profile]);

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    router.replace('/auth/login');
  };

  const handleTestCheckpoint3 = async () => {
    console.log('=== TEST CHECKPOINT 3 STARTED ===');
    setCheckpoint3Loading(true);
    setCheckpoint3Result(null);

    const result = await testAssistantToolCall();

    setCheckpoint3Loading(false);
    setCheckpoint3Result(result);

    if (result.success && result.hasToolCall) {
      console.log('=== TEST CHECKPOINT 3 PASSED ===');
    } else {
      console.log('=== TEST CHECKPOINT 3 FAILED ===');
    }
  };

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.greeting}>Hello{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}!</Text>
      <Text style={styles.title}>NatureUP Health</Text>
      <Text style={styles.subtitle}>Your personalized nature therapy companion</Text>

      <View style={styles.checkpoint3Card}>
        <Text style={styles.testCardTitle}>Test Checkpoint 3</Text>
        <Text style={styles.testCardSubtitle}>Verify OpenAI Assistant responds with tool calls (not natural language)</Text>

        <Button
          title={checkpoint3Loading ? "Testing Assistant..." : "Test Assistant Tool Call"}
          onPress={handleTestCheckpoint3}
          disabled={checkpoint3Loading}
          style={styles.testButton}
        />

        {checkpoint3Loading && (
          <View style={styles.loadingContainer}>
            <LoadingSpinner size="small" />
            <Text style={styles.loadingText}>Creating thread and polling assistant...</Text>
          </View>
        )}

        {checkpoint3Result && !checkpoint3Loading && (
          <>
            {checkpoint3Result.success && checkpoint3Result.hasToolCall ? (
              <View style={styles.successContainer}>
                <Text style={styles.successText}>Assistant responded with tool call!</Text>
                <View style={styles.toolCallInfo}>
                  <Text style={styles.toolCallLabel}>Tool Name:</Text>
                  <Text style={styles.toolCallValue}>{checkpoint3Result.toolCall?.toolName}</Text>
                  <Text style={[styles.toolCallLabel, styles.toolCallLabelSpaced]}>Arguments Preview:</Text>
                  <View style={styles.codeBox}>
                    <Text style={styles.codeText}>
                      {JSON.stringify(checkpoint3Result.toolCall?.arguments, null, 2).substring(0, 200)}...
                    </Text>
                  </View>
                </View>
                <Text style={styles.successHint}>Check console for full tool call details</Text>
              </View>
            ) : (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                  {checkpoint3Result.error || 'Assistant did not respond with tool calls'}
                </Text>
                <Text style={styles.errorHint}>
                  The assistant needs to be configured with tool definitions
                </Text>
              </View>
            )}
          </>
        )}
      </View>

      {coordinates && (
        <WeatherCard
          weather={weather}
          loading={weatherLoading}
          error={weatherError}
          onRefresh={refreshWeather}
        />
      )}

      {profile && (
        <View style={styles.profileCard}>
          <Text style={styles.profileLabel}>Email</Text>
          <Text style={styles.profileValue}>{user?.email}</Text>

          {profile.health_goals && profile.health_goals.length > 0 && (
            <>
              <Text style={[styles.profileLabel, styles.profileLabelSpaced]}>Health Goals</Text>
              <Text style={styles.profileValue}>{profile.health_goals.join(', ')}</Text>
            </>
          )}
        </View>
      )}

      <View style={styles.actions}>
        <Button
          title="Edit Profile"
          onPress={() => router.push('/profile/setup')}
          variant="secondary"
          style={styles.editButton}
        />

        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="outline"
          style={styles.signOutButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  greeting: {
    fontSize: typography.sizes['4xl'],
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeights.normal * typography.sizes.base,
    marginBottom: spacing.xl,
  },
  profileCard: {
    width: '100%',
    maxWidth: 400,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: spacing.md,
    marginBottom: spacing.lg,
  },
  profileLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  profileLabelSpaced: {
    marginTop: spacing.md,
  },
  profileValue: {
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    lineHeight: typography.lineHeights.normal * typography.sizes.base,
  },
  actions: {
    width: '100%',
    maxWidth: 400,
    gap: spacing.sm,
  },
  editButton: {
    width: '100%',
  },
  signOutButton: {
    width: '100%',
  },
  checkpoint3Card: {
    width: '100%',
    maxWidth: 400,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 3,
    borderColor: '#2E7C4A',
  },
  testCardTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  testCardSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  testButton: {
    width: '100%',
    marginBottom: spacing.md,
  },
  errorContainer: {
    padding: spacing.md,
    backgroundColor: '#FEE2E2',
    borderRadius: spacing.sm,
    marginBottom: spacing.md,
  },
  errorText: {
    fontSize: typography.sizes.sm,
    color: '#DC2626',
    lineHeight: typography.lineHeights.normal * typography.sizes.sm,
  },
  successContainer: {
    padding: spacing.md,
    backgroundColor: '#D1FAE5',
    borderRadius: spacing.sm,
  },
  successText: {
    fontSize: typography.sizes.sm,
    color: '#065F46',
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
  },
  successHint: {
    fontSize: typography.sizes.xs,
    color: '#047857',
    fontStyle: 'italic',
  },
  loadingContainer: {
    padding: spacing.md,
    backgroundColor: '#F0F4F8',
    borderRadius: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  loadingText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  toolCallInfo: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#047857',
  },
  toolCallLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: '#047857',
    marginBottom: spacing.xs,
  },
  toolCallLabelSpaced: {
    marginTop: spacing.md,
  },
  toolCallValue: {
    fontSize: typography.sizes.base,
    color: '#065F46',
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
  },
  codeBox: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: spacing.sm,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
  codeText: {
    fontSize: typography.sizes.xs,
    fontFamily: 'monospace',
    color: '#374151',
    lineHeight: typography.sizes.xs * 1.5,
  },
  errorHint: {
    fontSize: typography.sizes.xs,
    color: '#DC2626',
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
});
