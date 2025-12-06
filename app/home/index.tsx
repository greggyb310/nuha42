import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from '../../hooks/useLocation';
import { useWeather } from '../../hooks/useWeather';
import { LoadingSpinner, Button, Map, WeatherCard } from '../../components';
import { colors, typography, spacing } from '../../constants/theme';
import { sendTestRequest } from '../../services/test-api';
import { sendValidRequest, sendInvalidRequest } from '../../services/validate-request-api';

export default function HomeScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, profile, signOut } = useAuth();
  const { coordinates, loading: locationLoading, error: locationError, getCurrentLocation } = useLocation();
  const { weather, loading: weatherLoading, error: weatherError, refresh: refreshWeather } = useWeather(
    coordinates?.latitude,
    coordinates?.longitude
  );
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  const [checkpoint2Loading, setCheckpoint2Loading] = useState(false);
  const [checkpoint2Result, setCheckpoint2Result] = useState<string | null>(null);
  const [checkpoint2Error, setCheckpoint2Error] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<any[] | null>(null);

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

  const handleTestLocation = async () => {
    console.log('=== LOCATION TEST STARTED ===');
    await getCurrentLocation();
    console.log('=== LOCATION TEST COMPLETED ===');
  };

  const handleTestCheckpoint1 = async () => {
    console.log('=== TEST CHECKPOINT 1 STARTED ===');
    setTestLoading(true);
    setTestError(null);
    setTestResult(null);

    const result = await sendTestRequest();

    setTestLoading(false);

    if (result.success) {
      setTestResult(result.message || 'Success!');
      console.log('=== TEST CHECKPOINT 1 PASSED ===');
    } else {
      setTestError(result.error || 'Unknown error');
      console.log('=== TEST CHECKPOINT 1 FAILED ===');
    }
  };

  const handleValidRequest = async () => {
    console.log('=== TEST CHECKPOINT 2: VALID REQUEST ===');
    setCheckpoint2Loading(true);
    setCheckpoint2Error(null);
    setCheckpoint2Result(null);
    setValidationErrors(null);

    const result = await sendValidRequest();

    setCheckpoint2Loading(false);

    if (result.success) {
      setCheckpoint2Result(result.message || 'Valid request accepted!');
      console.log('=== VALID REQUEST TEST PASSED ===');
    } else {
      setCheckpoint2Error(result.error || 'Unknown error');
      console.log('=== VALID REQUEST TEST FAILED ===');
    }
  };

  const handleInvalidRequest = async () => {
    console.log('=== TEST CHECKPOINT 2: INVALID REQUEST ===');
    setCheckpoint2Loading(true);
    setCheckpoint2Error(null);
    setCheckpoint2Result(null);
    setValidationErrors(null);

    const result = await sendInvalidRequest();

    setCheckpoint2Loading(false);

    if (result.success) {
      setCheckpoint2Result(result.message || 'Invalid request correctly rejected!');
      setValidationErrors(result.errors || null);
      console.log('=== INVALID REQUEST TEST PASSED ===');
    } else {
      setCheckpoint2Error(result.error || 'Unknown error');
      console.log('=== INVALID REQUEST TEST FAILED ===');
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

      <View style={styles.testCheckpointCard}>
        <Text style={styles.testCardTitle}>Test Checkpoint 1</Text>
        <Text style={styles.testCardSubtitle}>Send static JSON payload to Edge Function (no AI)</Text>

        <Button
          title={testLoading ? "Sending..." : "Send Test Request"}
          onPress={handleTestCheckpoint1}
          disabled={testLoading}
          style={styles.testButton}
        />

        {testError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{testError}</Text>
          </View>
        )}

        {testResult && (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>{testResult}</Text>
            <Text style={styles.successHint}>Check console logs for full payload</Text>
          </View>
        )}
      </View>

      <View style={styles.checkpoint2Card}>
        <Text style={styles.testCardTitle}>Test Checkpoint 2</Text>
        <Text style={styles.testCardSubtitle}>Validate NatureUpRequest schema and reject invalid payloads</Text>

        <Button
          title={checkpoint2Loading ? "Testing..." : "Send Valid Request"}
          onPress={handleValidRequest}
          disabled={checkpoint2Loading}
          style={styles.testButton}
        />

        <Button
          title={checkpoint2Loading ? "Testing..." : "Send Invalid Request"}
          onPress={handleInvalidRequest}
          disabled={checkpoint2Loading}
          variant="secondary"
          style={styles.testButton}
        />

        {checkpoint2Error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{checkpoint2Error}</Text>
          </View>
        )}

        {checkpoint2Result && (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>{checkpoint2Result}</Text>
            {validationErrors && validationErrors.length > 0 && (
              <View style={styles.errorsListContainer}>
                <Text style={styles.errorsListTitle}>Validation Errors Detected:</Text>
                {validationErrors.map((err, index) => (
                  <Text key={index} style={styles.errorDetailText}>
                    {err.field}: {err.message}
                  </Text>
                ))}
              </View>
            )}
            <Text style={styles.successHint}>Check console logs for full details</Text>
          </View>
        )}
      </View>

      <View style={styles.locationTestCard}>
        <Text style={styles.testCardTitle}>Location Test - Phase 2</Text>
        <Text style={styles.testCardSubtitle}>Testing map visualization with location data</Text>

        <Button
          title={locationLoading ? "Getting Location..." : "Get My Location"}
          onPress={handleTestLocation}
          disabled={locationLoading}
          style={styles.testButton}
        />

        {locationError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{locationError}</Text>
          </View>
        )}

        {coordinates && (
          <View style={styles.mapContainer}>
            <Map
              latitude={coordinates.latitude}
              longitude={coordinates.longitude}
            />
            {coordinates.accuracy && (
              <Text style={styles.accuracyText}>
                Accuracy: {coordinates.accuracy.toFixed(1)}m
              </Text>
            )}
          </View>
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
  testCheckpointCard: {
    width: '100%',
    maxWidth: 400,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: '#7FA957',
  },
  checkpoint2Card: {
    width: '100%',
    maxWidth: 400,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: '#4A7C2E',
  },
  locationTestCard: {
    width: '100%',
    maxWidth: 400,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: colors.accent,
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
  mapContainer: {
    width: '100%',
  },
  accuracyText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  errorsListContainer: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#047857',
  },
  errorsListTitle: {
    fontSize: typography.sizes.xs,
    color: '#047857',
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
  },
  errorDetailText: {
    fontSize: typography.sizes.xs,
    color: '#065F46',
    marginBottom: spacing.xs,
    paddingLeft: spacing.sm,
  },
});
