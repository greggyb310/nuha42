import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner, Button } from '../../components';
import { colors, typography, spacing } from '../../constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, profile, signOut } = useAuth();

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

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Hello{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}!</Text>
      <Text style={styles.title}>NatureUP Health</Text>
      <Text style={styles.subtitle}>Your personalized nature therapy companion</Text>

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
});
