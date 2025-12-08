import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner, Button } from '../components';
import { colors, typography, spacing } from '../constants/theme';
import { TreePine, Heart, MapPin } from 'lucide-react-native';

export default function WelcomeScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/home');
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <TreePine size={64} color={colors.primary} strokeWidth={2} />
        </View>

        <Text style={styles.greeting}>Welcome to</Text>
        <Text style={styles.title}>NatureUP Health</Text>
        <Text style={styles.subtitle}>Your personalized nature therapy companion</Text>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Heart size={24} color={colors.accent} strokeWidth={2} />
            <Text style={styles.featureText}>AI-powered wellness coaching</Text>
          </View>
          <View style={styles.feature}>
            <MapPin size={24} color={colors.accent} strokeWidth={2} />
            <Text style={styles.featureText}>Custom outdoor excursions</Text>
          </View>
          <View style={styles.feature}>
            <TreePine size={24} color={colors.accent} strokeWidth={2} />
            <Text style={styles.featureText}>Nature therapy routes</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            title="Get Started"
            onPress={() => router.push('/auth/sign-up')}
            fullWidth
            size="large"
            style={styles.primaryButton}
          />
          <Button
            title="Sign In"
            onPress={() => router.push('/auth/login')}
            variant="outline"
            fullWidth
            size="large"
            style={styles.secondaryButton}
          />
        </View>
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
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 500,
    width: '100%',
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  greeting: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  title: {
    fontSize: typography.sizes['4xl'],
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.sizes.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeights.normal * typography.sizes.lg,
    marginBottom: spacing['2xl'],
  },
  features: {
    width: '100%',
    gap: spacing.md,
    marginBottom: spacing['2xl'],
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: spacing.md,
  },
  featureText: {
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    fontWeight: typography.weights.medium,
  },
  actions: {
    width: '100%',
    gap: spacing.md,
  },
  primaryButton: {
    width: '100%',
  },
  secondaryButton: {
    width: '100%',
  },
});
