import { Link } from "expo-router";
import {
    Pressable,
    Text,
    View,
    useColorScheme,
    useWindowDimensions
} from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/theme";
import { useFavoritesStore } from "@/store/use-favorites-store";
import { PokemonGridItem } from "../(pokedex)/index";

export default function FavoritesScreen() {
    const colorScheme = useColorScheme() ?? "light";
    const theme = Colors[colorScheme];
    const { favorites } = useFavoritesStore();
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();

    const numColumns = 2;
    const gap = 14;
    const padding = 16;
    const itemWidth = (width - padding * 2 - gap * (numColumns - 1)) / numColumns;

    // Render "No Favorites" state
    if (favorites.length === 0) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: theme.background
                }}
            >
                <Text style={{ color: theme.icon, fontSize: 16, marginBottom: 8 }}>
                    No favorites yet
                </Text>
                <Text style={{ color: theme.icon, fontSize: 14, marginTop: 8 }}>
                    Add some Pokemon from the Pokédex!
                </Text>
                <Link href="/(tabs)/(pokedex)" asChild>
                    <Pressable style={{ marginTop: 20, padding: 12, backgroundColor: theme.tint, borderRadius: 8 }}>
                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Go to Pokédex</Text>
                    </Pressable>
                </Link>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: theme.background }}>
            {/* Sticky header with count */}
            <View
                style={{
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    backgroundColor: theme.background,
                }}
            >
                <Text
                    style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: theme.icon,
                    }}
                >
                    ❤️ {favorites.length} Favorite{favorites.length !== 1 ? "s" : ""}
                </Text>
            </View>

            <Animated.FlatList
                contentInsetAdjustmentBehavior="automatic"
                data={favorites}
                numColumns={numColumns}
                keyExtractor={(item) => String(item.id)}
                columnWrapperStyle={{ gap }}
                contentContainerStyle={{
                    paddingHorizontal: padding,
                    paddingTop: 4,
                    paddingBottom: insets.bottom + 16,
                    gap,
                }}
                itemLayoutAnimation={LinearTransition}
                key={`favorites-grid-${numColumns}-${width}`}
                renderItem={({ item, index }) => (
                    <PokemonGridItem item={item} index={index} width={itemWidth} />
                )}
            />
        </View>
    );
}
