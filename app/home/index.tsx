import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from '../../hooks/useLocation';
import { LoadingSpinner, Button } from '../../components';
import { colors, typography, spacing } from '../../constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, profile, signOut } = useAuth();
  const { coordinates, loading: locationLoading, error: locationError, getCurrentLocation } = useLocation();

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

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Hello{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}!</Text>
      <Text style={styles.title}>NatureUP Health</Text>
      <Text style={styles.subtitle}>Your personalized nature therapy companion</Text>

      <View style={styles.locationTestCard}>
        <Text style={styles.testCardTitle}>Location Test - Phase 1</Text>
        <Text style={styles.testCardSubtitle}>Testing core location hook functionality</Text>

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
          <View style={styles.coordinatesContainer}>
            <Text style={styles.coordinatesLabel}>Current Location:</Text>
            <Text style={styles.coordinatesValue}>
              Lat: {coordinates.latitude.toFixed(6)}
            </Text>
            <Text style={styles.coordinatesValue}>
              Lon: {coordinates.longitude.toFixed(6)}
            </Text>
            {coordinates.accuracy && (
              <Text style={styles.coordinatesValue}>
                Accuracy: {coordinates.accuracy.toFixed(1)}m
              </Text>
            )}
            <Text style={styles.infoText}>Check console for detailed logs</Text>
          </View>
        )}
      </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
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
  coordinatesContainer: {
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  coordinatesLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  coordinatesValue: {
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    fontFamily: 'monospace',
  },
  infoText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
});
