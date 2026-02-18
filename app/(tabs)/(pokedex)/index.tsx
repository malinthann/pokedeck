import { Colors } from "@/constants/theme";
import { useDebounce } from "@/hooks/use-debounce";
import { usePokemonList, type Pokemon } from "@/hooks/use-pokemon-list";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    Text,
    TextInput,
    View,
    useColorScheme,
    useWindowDimensions,
} from "react-native";
import Animated, {
    FadeIn,
    FadeInDown,
    LinearTransition
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function formatId(id: number) {
    return `#${String(id).padStart(3, "0")}`;
}

function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Get a pastel/gradient background based on Pokemon type color
function getCardGradient(id: number): string {
    const colors = [
        "#F8BBD0", "#E1BEE7", "#C5CAE9", "#B3E5FC",
        "#B2DFDB", "#DCEDC8", "#FFF9C4", "#FFE0B2",
        "#FFCCBC", "#D7CCC8", "#CFD8DC", "#F0F4C3",
    ];
    return colors[id % colors.length];
}

// ─── Search Bar ──────────────────────────────────────────────────────────

function SearchBar({
    value,
    onChangeText,
    theme,
    colorScheme,
}: {
    value: string;
    onChangeText: (text: string) => void;
    theme: typeof Colors.light;
    colorScheme: string;
}) {
    const inputRef = useRef<TextInput>(null);

    return (
        <Animated.View
            entering={FadeInDown.duration(400)}
            style={{
                marginHorizontal: 16,
                marginBottom: 16,
            }}
        >
            <Pressable
                onPress={() => inputRef.current?.focus()}
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor:
                        colorScheme === "dark"
                            ? "rgba(255,255,255,0.08)"
                            : "rgba(0,0,0,0.04)",
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderWidth: 1,
                    borderColor:
                        colorScheme === "dark"
                            ? "rgba(255,255,255,0.1)"
                            : "rgba(0,0,0,0.06)",
                    borderCurve: "continuous",
                }}
            >
                {/* Search icon */}
                <Text style={{ fontSize: 18, marginRight: 10, opacity: 0.5 }}>
                    🔍
                </Text>
                <TextInput
                    ref={inputRef}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder="Search by name or number..."
                    placeholderTextColor={
                        colorScheme === "dark"
                            ? "rgba(255,255,255,0.35)"
                            : "rgba(0,0,0,0.3)"
                    }
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={{
                        flex: 1,
                        fontSize: 16,
                        color: theme.text,
                        padding: 0,
                    }}
                />
                {value.length > 0 && (
                    <Pressable
                        onPress={() => onChangeText("")}
                        hitSlop={12}
                        style={{
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            backgroundColor:
                                colorScheme === "dark"
                                    ? "rgba(255,255,255,0.15)"
                                    : "rgba(0,0,0,0.1)",
                            alignItems: "center",
                            justifyContent: "center",
                            marginLeft: 8,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 12,
                                fontWeight: "bold",
                                color: theme.icon,
                            }}
                        >
                            ✕
                        </Text>
                    </Pressable>
                )}
            </Pressable>
        </Animated.View>
    );
}

// ─── Grid Card ───────────────────────────────────────────────────────────

export function PokemonGridItem({
    item,
    index,
    width,
}: {
    item: Pokemon;
    index: number;
    width: number;
}) {
    const colorScheme = useColorScheme() ?? "light";
    const theme = Colors[colorScheme];
    const bgColor = getCardGradient(item.id);

    return (
        <Animated.View
            entering={FadeIn.delay(Math.min(index * 30, 400)).duration(350)}
            layout={LinearTransition.springify().damping(18)}
            style={{
                width,
                marginBottom: 0,
            }}
        >
            <Link href={`/(pokedex)/${item.id}`} asChild>
                <Pressable
                    style={({ pressed }) => ({
                        borderRadius: 20,
                        overflow: "hidden",
                        opacity: pressed ? 0.85 : 1,
                        transform: [{ scale: pressed ? 0.97 : 1 }],
                        borderCurve: "continuous",
                        // Card shadow
                        shadowColor: bgColor,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 4,
                    })}
                >
                    {/* Card background */}
                    <View
                        style={{
                            backgroundColor: bgColor,
                            padding: 14,
                            height: 180,
                            justifyContent: "space-between",
                        }}
                    >
                        {/* Top row: Name + ID */}
                        <View>
                            <Text
                                numberOfLines={1}
                                style={{
                                    fontSize: 16,
                                    fontWeight: "800",
                                    color: "rgba(0,0,0,0.75)",
                                    letterSpacing: 0.3,
                                }}
                            >
                                {capitalize(item.name)}
                            </Text>
                            <Text
                                style={{
                                    fontSize: 12,
                                    fontWeight: "700",
                                    color: "rgba(0,0,0,0.35)",
                                    marginTop: 2,
                                    fontVariant: ["tabular-nums"],
                                }}
                            >
                                {formatId(item.id)}
                            </Text>
                        </View>

                        {/* Pokemon image */}
                        <View
                            style={{
                                alignItems: "center",
                                justifyContent: "center",
                                flex: 1,
                            }}
                        >
                            <Image
                                source={{ uri: item.spriteUrl }}
                                style={{ width: 96, height: 96 }}
                                contentFit="contain"
                                transition={200}
                            />
                        </View>
                    </View>

                    {/* Bottom bar */}
                    <View
                        style={{
                            backgroundColor:
                                colorScheme === "dark" ? "#1E1E1E" : "#fff",
                            paddingHorizontal: 14,
                            paddingVertical: 10,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        <Text
                            numberOfLines={1}
                            style={{
                                fontSize: 13,
                                fontWeight: "600",
                                color: theme.text,
                            }}
                        >
                            {capitalize(item.name)}
                        </Text>
                        <View
                            style={{
                                backgroundColor: bgColor + "60",
                                paddingHorizontal: 8,
                                paddingVertical: 3,
                                borderRadius: 8,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 11,
                                    fontWeight: "700",
                                    color: "rgba(0,0,0,0.5)",
                                    fontVariant: ["tabular-nums"],
                                }}
                            >
                                {formatId(item.id)}
                            </Text>
                        </View>
                    </View>
                </Pressable>
            </Link>
        </Animated.View>
    );
}

// ─── Pokedex Screen ──────────────────────────────────────────────────────

export default function PokedexScreen() {
    const colorScheme = useColorScheme() ?? "light";
    const theme = Colors[colorScheme];
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 250);
    const { pokemon, isLoading, isLoadingMore, loadMore, error } =
        usePokemonList();
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();

    const numColumns = 2;
    const gap = 14;
    const padding = 16;
    const itemWidth =
        (width - padding * 2 - gap * (numColumns - 1)) / numColumns;

    const filtered = useMemo(() => {
        if (!debouncedSearch) return pokemon;
        const q = debouncedSearch.toLowerCase();
        return pokemon.filter(
            (p) =>
                p.name.toLowerCase().includes(q) ||
                formatId(p.id).includes(q) ||
                String(p.id) === q
        );
    }, [pokemon, debouncedSearch]);

    if (isLoading) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: theme.background,
                }}
            >
                <ActivityIndicator size="large" color={theme.tint} />
                <Text
                    style={{
                        marginTop: 12,
                        fontSize: 14,
                        color: theme.icon,
                    }}
                >
                    Loading Pokédex...
                </Text>
            </View>
        );
    }

    if (error) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 24,
                    backgroundColor: theme.background,
                }}
            >
                <Text style={{ fontSize: 48, marginBottom: 16 }}>😵</Text>
                <Text
                    style={{
                        color: theme.text,
                        fontSize: 16,
                        marginBottom: 8,
                        fontWeight: "600",
                    }}
                >
                    Something went wrong
                </Text>
                <Text style={{ color: theme.icon, fontSize: 14 }}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: theme.background }}>
            {/* Sticky search bar */}
            <SearchBar
                value={search}
                onChangeText={setSearch}
                theme={theme}
                colorScheme={colorScheme}
            />

            <Animated.FlatList
                contentInsetAdjustmentBehavior="automatic"
                data={filtered}
                numColumns={numColumns}
                keyExtractor={(item) => String(item.id)}
                columnWrapperStyle={{ gap }}
                contentContainerStyle={{
                    paddingHorizontal: padding,
                    paddingTop: 4,
                    paddingBottom: insets.bottom + 16,
                    gap,
                }}
                onEndReached={debouncedSearch ? undefined : loadMore}
                onEndReachedThreshold={0.5}
                keyboardDismissMode="on-drag"
                itemLayoutAnimation={LinearTransition}
                key={`pokedex-grid-${numColumns}-${width}`}
                ListEmptyComponent={
                    debouncedSearch ? (
                        <Animated.View
                            entering={FadeIn.duration(300)}
                            style={{
                                flex: 1,
                                justifyContent: "center",
                                alignItems: "center",
                                paddingTop: 60,
                                width: width - padding * 2,
                            }}
                        >
                            <Text style={{ fontSize: 48, marginBottom: 16 }}>
                                🔎
                            </Text>
                            <Text
                                style={{
                                    color: theme.text,
                                    fontSize: 16,
                                    fontWeight: "600",
                                    marginBottom: 4,
                                }}
                            >
                                No Pokémon found
                            </Text>
                            <Text
                                style={{
                                    color: theme.icon,
                                    fontSize: 14,
                                }}
                            >
                                Try "{debouncedSearch}" with a different spelling
                            </Text>
                        </Animated.View>
                    ) : null
                }
                ListFooterComponent={
                    isLoadingMore ? (
                        <View
                            style={{
                                paddingVertical: 24,
                                width: width - padding * 2,
                                alignItems: "center",
                            }}
                        >
                            <ActivityIndicator color={theme.tint} />
                            <Text
                                style={{
                                    marginTop: 8,
                                    fontSize: 13,
                                    color: theme.icon,
                                }}
                            >
                                Loading more...
                            </Text>
                        </View>
                    ) : null
                }
                renderItem={({ item, index }) => (
                    <PokemonGridItem
                        item={item}
                        index={index}
                        width={itemWidth}
                    />
                )}
            />
        </View>
    );
}
