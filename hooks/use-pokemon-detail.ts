import { useEffect, useState } from "react";

const API_BASE = "https://pokeapi.co/api/v2";

export interface PokemonDetail {
    id: number;
    name: string;
    height: number;
    weight: number;
    types: { type: { name: string } }[];
    stats: { base_stat: number; stat: { name: string } }[];
    abilities: { ability: { name: string } }[];
    sprites: {
        front_default: string;
        other: {
            "official-artwork": {
                front_default: string;
            };
        };
    };
}

export function usePokemonDetail(id: number) {
    const [pokemon, setPokemon] = useState<PokemonDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchDetail = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const res = await fetch(`${API_BASE}/pokemon/${id}`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data: PokemonDetail = await res.json();
                setPokemon(data);
            } catch (e) {
                setError(e instanceof Error ? e.message : "Failed to fetch details");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetail();
    }, [id]);

    return { pokemon, isLoading, error };
}
