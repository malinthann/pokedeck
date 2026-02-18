import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useNavigation } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    Text,
    View,
    useColorScheme,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { StatsModal } from "@/components/stats-modal";
import { Toast } from "@/components/toast";
import { Colors } from "@/constants/theme";
import { useConvexFavorites } from "@/hooks/use-convex-favorites";
import { usePokemonDetail } from "@/hooks/use-pokemon-detail";

function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function StatBar({
    name,
    value,
    max = 255,
    color,
}: {
    name: string;
    value: number;
    max?: number;
    color: string;
}) {
    const percentage = (value / max) * 100;

    return (
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
            }}
        >
            <Text
                style={{ width: 100, fontSize: 14, color: "#666", fontWeight: "500" }}
            >
                {name === "special-attack"
                    ? "Sp. Atk"
                    : name === "special-defense"
                        ? "Sp. Def"
                        : capitalize(name)}
            </Text>
            <Text
                style={{ width: 35, fontSize: 14, fontWeight: "bold", color: "#333" }}
            >
                {value}
            </Text>
            <View
                style={{
                    flex: 1,
                    height: 6,
                    backgroundColor: "#eee",
                    borderRadius: 3,
                    overflow: "hidden",
                }}
            >
                <View
                    style={{
                        width: `${percentage}%`,
                        height: "100%",
                        backgroundColor: color,
                        borderRadius: 3,
                    }}
                />
            </View>
        </View>
    );
}

export default function PokemonDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const navigation = useNavigation();
    const colorScheme = useColorScheme() ?? "light";
    const theme = Colors[colorScheme];
    const pokemonId = parseInt(id, 10);
    const { pokemon, isLoading, error } = usePokemonDetail(pokemonId);

    const { addFavorite, removeFavorite, isFavorite } = useConvexFavorites();
    const isFav = isFavorite(pokemonId);
    const [isToggling, setIsToggling] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastVisible, setToastVisible] = useState(false);
    const [toastIcon, setToastIcon] = useState("❤️");
    const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

    const showToast = (message: string, icon: string) => {
        if (toastTimer.current) clearTimeout(toastTimer.current);
        setToastMessage(message);
        setToastIcon(icon);
        setToastVisible(true);
        toastTimer.current = setTimeout(() => setToastVisible(false), 2000);
    };

    const toggleFavorite = useCallback(async () => {
        if (!pokemon || isToggling) return;
        setIsToggling(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        try {
            if (isFav) {
                await removeFavorite(pokemonId);
                showToast(`Removed from Favorites`, "💔");
            } else {
                await addFavorite({
                    id: pokemonId,
                    name: pokemon.name,
                    spriteUrl: pokemon.sprites.front_default,
                });
                showToast(`Added to Favorites!`, "❤️");
            }
        } finally {
            setIsToggling(false);
        }
    }, [isFav, pokemonId, pokemon, addFavorite, removeFavorite, isToggling]);

    const [statsModalVisible, setStatsModalVisible] = useState(false);

    // Hide the tab bar when on the detail page
    useEffect(() => {
        navigation.getParent()?.setOptions({
            tabBarStyle: { display: "none" },
        });
        return () => {
            navigation.getParent()?.setOptions({
                tabBarStyle: undefined,
            });
        };
    }, [navigation]);

    if (isLoading) {
        return (
            <View
                style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
            >
                <ActivityIndicator size="large" color={theme.tint} />
            </View>
        );
    }

    if (error || !pokemon) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 24,
                }}
            >
                <Text style={{ color: theme.text, fontSize: 16 }}>
                    {error || "Pokemon not found"}
                </Text>
            </View>
        );
    }

    const mainType = pokemon.types[0].type.name;
    // @ts-ignore
    const typeColor = Colors.type[mainType] || theme.tint;

    return (
        <>
            <ScrollView
                contentInsetAdjustmentBehavior="automatic"
                contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
                style={{ flex: 1, backgroundColor: theme.background }}
            >
                {/* Configure header title + heart icon */}
                <Stack.Screen
                    options={{
                        title: capitalize(pokemon.name),
                        headerRight: () => (
                            <Pressable
                                onPress={toggleFavorite}
                                disabled={isToggling}
                                style={({ pressed }) => ({
                                    padding: 8,
                                    opacity: pressed ? 0.6 : 1,
                                })}
                            >
                                {isToggling ? (
                                    <ActivityIndicator
                                        size={24}
                                        color={isFav ? theme.tint : theme.icon}
                                    />
                                ) : (
                                    <IconSymbol
                                        size={28}
                                        name={isFav ? "heart.fill" : "heart"}
                                        color={isFav ? theme.tint : theme.icon}
                                    />
                                )}
                            </Pressable>
                        ),
                    }}
                />

                {/* Hero image */}
                <Animated.View
                    entering={FadeIn.duration(500)}
                    style={{ alignItems: "center", marginBottom: 20 }}
                >
                    <Image
                        source={{
                            uri:
                                pokemon.sprites.other["official-artwork"].front_default ||
                                pokemon.sprites.front_default,
                        }}
                        style={{ width: 250, height: 250 }}
                        contentFit="contain"
                    />
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(200).duration(500)}>
                    {/* Types */}
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "center",
                            gap: 10,
                            marginBottom: 24,
                        }}
                    >
                        {pokemon.types.map((t) => {
                            // @ts-ignore
                            const color = Colors.type[t.type.name] || "#999";
                            return (
                                <View
                                    key={t.type.name}
                                    style={{
                                        backgroundColor: color,
                                        paddingHorizontal: 16,
                                        paddingVertical: 6,
                                        borderRadius: 20,
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: "#fff",
                                            fontWeight: "bold",
                                            fontSize: 16,
                                        }}
                                    >
                                        {capitalize(t.type.name)}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>

                    {/* About */}
                    <Text
                        style={{
                            fontSize: 20,
                            fontWeight: "bold",
                            color: theme.text,
                            marginBottom: 16,
                        }}
                    >
                        About
                    </Text>
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-around",
                            marginBottom: 24,
                            padding: 16,
                            backgroundColor: colorScheme === "dark" ? "#222" : "#f5f5f5",
                            borderRadius: 16,
                        }}
                    >
                        <View style={{ alignItems: "center" }}>
                            <Text style={{ color: "#888", marginBottom: 4 }}>Weight</Text>
                            <Text
                                style={{
                                    fontSize: 16,
                                    fontWeight: "600",
                                    color: theme.text,
                                }}
                            >
                                {pokemon.weight / 10} kg
                            </Text>
                        </View>
                        <View style={{ alignItems: "center" }}>
                            <Text style={{ color: "#888", marginBottom: 4 }}>Height</Text>
                            <Text
                                style={{
                                    fontSize: 16,
                                    fontWeight: "600",
                                    color: theme.text,
                                }}
                            >
                                {pokemon.height / 10} m
                            </Text>
                        </View>
                        <View style={{ alignItems: "center" }}>
                            <Text style={{ color: "#888", marginBottom: 4 }}>Ability</Text>
                            <Text
                                style={{
                                    fontSize: 16,
                                    fontWeight: "600",
                                    color: theme.text,
                                }}
                            >
                                {capitalize(pokemon.abilities[0].ability.name)}
                            </Text>
                        </View>
                    </View>

                    {/* Base Stats — with inline "View Details" link */}
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 16,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 20,
                                fontWeight: "bold",
                                color: theme.text,
                            }}
                        >
                            Base Stats
                        </Text>
                        <Pressable
                            onPress={() => setStatsModalVisible(true)}
                            hitSlop={8}
                            style={({ pressed }) => ({
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 4,
                                opacity: pressed ? 0.6 : 1,
                            })}
                        >
                            <Text
                                style={{
                                    fontSize: 14,
                                    fontWeight: "600",
                                    color: typeColor,
                                }}
                            >
                                View Details
                            </Text>
                            <IconSymbol
                                size={16}
                                name="chevron.right"
                                color={typeColor}
                            />
                        </Pressable>
                    </View>
                    <View>
                        {pokemon.stats.map((stat) => (
                            <StatBar
                                key={stat.stat.name}
                                name={stat.stat.name}
                                value={stat.base_stat}
                                color={typeColor}
                            />
                        ))}
                    </View>
                </Animated.View>

                {/* Stats Modal */}
                <StatsModal
                    visible={statsModalVisible}
                    onClose={() => setStatsModalVisible(false)}
                    pokemon={pokemon}
                    typeColor={typeColor}
                />
            </ScrollView>

            {/* Favorite toggle toast */}
            <Toast
                message={toastMessage}
                visible={toastVisible}
                icon={toastIcon}
            />
        </>
    );
}
