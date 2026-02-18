import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

/**
 * Hook that provides the same API surface as the old Zustand favorites store,
 * but backed by Convex for cloud-synced, real-time data.
 */
export function useConvexFavorites() {
    const favorites = useQuery(api.favorites.list);
    const addMutation = useMutation(api.favorites.add);
    const removeMutation = useMutation(api.favorites.remove);

    const addFavorite = (pokemon: {
        id: number;
        name: string;
        spriteUrl: string;
    }) => {
        return addMutation({
            pokemonId: pokemon.id,
            name: pokemon.name,
            spriteUrl: pokemon.spriteUrl,
        });
    };

    const removeFavorite = (pokemonId: number) => {
        return removeMutation({ pokemonId });
    };

    const isFavorite = (pokemonId: number) => {
        return favorites?.some((f) => f.pokemonId === pokemonId) ?? false;
    };

    // Map to the Pokemon interface expected by PokemonGridItem
    const mappedFavorites = (favorites ?? []).map((f) => ({
        id: f.pokemonId,
        name: f.name,
        spriteUrl: f.spriteUrl,
    }));

    return {
        favorites: mappedFavorites,
        isLoading: favorites === undefined,
        addFavorite,
        removeFavorite,
        isFavorite,
    };
}
