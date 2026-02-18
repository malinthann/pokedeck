import { useCallback, useEffect, useState } from "react";

const API_BASE = "https://pokeapi.co/api/v2";
const SPRITE_BASE =
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

export interface Pokemon {
    id: number;
    name: string;
    spriteUrl: string;
}

interface PokemonListResponse {
    count: number;
    next: string | null;
    results: { name: string; url: string }[];
}

function extractId(url: string): number {
    const parts = url.replace(/\/$/, "").split("/");
    return parseInt(parts[parts.length - 1], 10);
}

export function usePokemonList(pageSize = 30) {
    const [pokemon, setPokemon] = useState<Pokemon[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [nextUrl, setNextUrl] = useState<string | null>(
        `${API_BASE}/pokemon?limit=${pageSize}`
    );
    const [error, setError] = useState<string | null>(null);

    const fetchPage = useCallback(async (url: string, append: boolean) => {
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data: PokemonListResponse = await res.json();

            const mapped: Pokemon[] = data.results.map((p) => {
                const id = extractId(p.url);
                return {
                    id,
                    name: p.name,
                    spriteUrl: `${SPRITE_BASE}/${id}.png`,
                };
            });

            setPokemon((prev) => (append ? [...prev, ...mapped] : mapped));
            setNextUrl(data.next);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to fetch");
        }
    }, []);

    useEffect(() => {
        setIsLoading(true);
        fetchPage(`${API_BASE}/pokemon?limit=${pageSize}`, false).finally(() =>
            setIsLoading(false)
        );
    }, [fetchPage, pageSize]);

    const loadMore = useCallback(async () => {
        if (!nextUrl || isLoadingMore) return;
        setIsLoadingMore(true);
        await fetchPage(nextUrl, true);
        setIsLoadingMore(false);
    }, [nextUrl, isLoadingMore, fetchPage]);

    return { pokemon, isLoading, isLoadingMore, loadMore, error };
}
