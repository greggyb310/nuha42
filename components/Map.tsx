import { View, Text, StyleSheet, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';
import { colors, typography, spacing } from '../constants/theme';

interface MapProps {
  latitude: number;
  longitude: number;
  showMarker?: boolean;
  provider?: 'google' | 'apple';
}

export function Map({ latitude, longitude, showMarker = true, provider = 'google' }: MapProps) {
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webFallback}>
        <Text style={styles.webFallbackText}>
          Map preview available on iOS
        </Text>
        <Text style={styles.webFallbackCoords}>
          {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </Text>
      </View>
    );
  }

  const mapProvider = provider === 'google' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT;

  return (
    <MapView
      style={styles.map}
      provider={mapProvider}
      initialRegion={{
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
      showsUserLocation={false}
      showsMyLocationButton={false}
      showsCompass={true}
      showsScale={false}
    >
      {showMarker && (
        <Marker
          coordinate={{ latitude, longitude }}
          title="Your Location"
        />
      )}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: 300,
    borderRadius: spacing.md,
    overflow: 'hidden',
  },
  webFallback: {
    width: '100%',
    height: 300,
    borderRadius: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  webFallbackText: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  webFallbackCoords: {
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
    fontFamily: 'monospace',
  },
});
