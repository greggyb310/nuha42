import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { databaseService } from '../services/database';
import type { UserPreferences } from '../types/database';

export type MapProvider = 'google' | 'apple';
export type UnitSystem = 'imperial' | 'metric';

interface MapPreferences {
  mapProvider: MapProvider;
  unitSystem: UnitSystem;
}

interface UseMapPreferencesReturn {
  mapProvider: MapProvider;
  unitSystem: UnitSystem;
  isLoading: boolean;
  error: string | null;
  updateMapProvider: (provider: MapProvider) => Promise<void>;
  updateUnitSystem: (system: UnitSystem) => Promise<void>;
  updatePreferences: (preferences: Partial<MapPreferences>) => Promise<void>;
}

export const useMapPreferences = (): UseMapPreferencesReturn => {
  const { user, profile, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapProvider: MapProvider = profile?.preferences?.map_provider ?? 'google';
  const unitSystem: UnitSystem = profile?.preferences?.unit_system ?? 'imperial';

  const updateMapProvider = useCallback(async (provider: MapProvider) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const currentPreferences = profile?.preferences ?? {};
      const updatedPreferences: UserPreferences = {
        ...currentPreferences,
        map_provider: provider,
      };

      const { error: updateError } = await databaseService.updateUserProfile(
        user.id,
        { preferences: updatedPreferences }
      );

      if (updateError) {
        setError(updateError.message);
      } else {
        await refreshProfile();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update map provider');
    } finally {
      setIsLoading(false);
    }
  }, [user, profile, refreshProfile]);

  const updateUnitSystem = useCallback(async (system: UnitSystem) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const currentPreferences = profile?.preferences ?? {};
      const updatedPreferences: UserPreferences = {
        ...currentPreferences,
        unit_system: system,
      };

      const { error: updateError } = await databaseService.updateUserProfile(
        user.id,
        { preferences: updatedPreferences }
      );

      if (updateError) {
        setError(updateError.message);
      } else {
        await refreshProfile();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update unit system');
    } finally {
      setIsLoading(false);
    }
  }, [user, profile, refreshProfile]);

  const updatePreferences = useCallback(async (preferences: Partial<MapPreferences>) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const currentPreferences = profile?.preferences ?? {};
      const updatedPreferences: UserPreferences = {
        ...currentPreferences,
        ...(preferences.mapProvider && { map_provider: preferences.mapProvider }),
        ...(preferences.unitSystem && { unit_system: preferences.unitSystem }),
      };

      const { error: updateError } = await databaseService.updateUserProfile(
        user.id,
        { preferences: updatedPreferences }
      );

      if (updateError) {
        setError(updateError.message);
      } else {
        await refreshProfile();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
    } finally {
      setIsLoading(false);
    }
  }, [user, profile, refreshProfile]);

  return {
    mapProvider,
    unitSystem,
    isLoading,
    error,
    updateMapProvider,
    updateUnitSystem,
    updatePreferences,
  };
};
