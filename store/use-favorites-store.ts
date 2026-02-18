import type { Pokemon } from '@/hooks/use-pokemon-list';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface FavoritesState {
    favorites: Pokemon[];
    addFavorite: (pokemon: Pokemon) => void;
    removeFavorite: (id: number) => void;
    isFavorite: (id: number) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
    persist(
        (set, get) => ({
            favorites: [],
            addFavorite: (pokemon) => {
                if (get().favorites.some((p) => p.id === pokemon.id)) return;
                set((state) => ({ favorites: [...state.favorites, pokemon] }));
            },
            removeFavorite: (id) => {
                set((state) => ({ favorites: state.favorites.filter((p) => p.id !== id) }));
            },
            isFavorite: (id) => get().favorites.some((p) => p.id === id),
        }),
        {
            name: 'favorites-storage',
            storage: createJSONStorage(() => AsyncStorage),
            onRehydrateStorage: () => (state, error) => {
                if (state) {
                    // Deduplicate any existing favorites from storage
                    const seen = new Set<number>();
                    const deduped = state.favorites.filter((p) => {
                        if (seen.has(p.id)) return false;
                        seen.add(p.id);
                        return true;
                    });
                    if (deduped.length !== state.favorites.length) {
                        useFavoritesStore.setState({ favorites: deduped });
                    }
                }
            },
        }
    )
);
