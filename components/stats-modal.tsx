import { Colors } from "@/constants/theme";
import type { PokemonDetail } from "@/hooks/use-pokemon-detail";
import { useEffect, useMemo } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    Text,
    View,
    useColorScheme
} from "react-native";
import Animated, {
    FadeIn,
    FadeInUp,
    FadeOut,
    SlideInDown,
    SlideOutDown,
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from "react-native-reanimated";

function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

const STAT_LABELS: Record<string, string> = {
    hp: "HP",
    attack: "Attack",
    defense: "Defense",
    "special-attack": "Sp. Atk",
    "special-defense": "Sp. Def",
    speed: "Speed",
};

function getStatColor(value: number): string {
    if (value < 50) return "#F44336";
    if (value < 80) return "#FF9800";
    if (value < 100) return "#FFC107";
    if (value < 120) return "#8BC34A";
    return "#4CAF50";
}

function AnimatedStatBar({
    label,
    value,
    max = 255,
    delay,
}: {
    label: string;
    value: number;
    max?: number;
    delay: number;
}) {
    const percentage = Math.min((value / max) * 100, 100);
    const barColor = getStatColor(value);
    const barWidth = useSharedValue(0);

    useEffect(() => {
        // Animate bar width with a nice spring
        barWidth.value = withSpring(percentage, {
            damping: 15,
            stiffness: 80,
            mass: 0.5,
            // Add delay via timing then spring
        });
    }, [percentage]);

    const animatedBarStyle = useAnimatedStyle(() => ({
        width: `${barWidth.value}%`,
        height: "100%",
        backgroundColor: barColor,
        borderRadius: 5,
    }));

    return (
        <Animated.View
            entering={FadeInUp.delay(delay).duration(350).springify().damping(18)}
            style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
            }}
        >
            <Text
                style={{
                    width: 70,
                    fontSize: 13,
                    fontWeight: "600",
                    color: "#888",
                }}
            >
                {label}
            </Text>
            <Text
                style={{
                    width: 40,
                    fontSize: 16,
                    fontWeight: "bold",
                    color: barColor,
                    textAlign: "right",
                    marginRight: 12,
                    fontVariant: ["tabular-nums"],
                }}
            >
                {value}
            </Text>
            <View
                style={{
                    flex: 1,
                    height: 10,
                    backgroundColor: "#eee",
                    borderRadius: 5,
                    overflow: "hidden",
                }}
            >
                <Animated.View style={animatedBarStyle} />
            </View>
        </Animated.View>
    );
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface StatsModalProps {
    visible: boolean;
    onClose: () => void;
    pokemon: PokemonDetail;
    typeColor: string;
}

export function StatsModal({
    visible,
    onClose,
    pokemon,
    typeColor,
}: StatsModalProps) {
    const colorScheme = useColorScheme() ?? "light";
    const theme = Colors[colorScheme];

    const totalStats = useMemo(
        () => pokemon.stats.reduce((sum, s) => sum + s.base_stat, 0),
        [pokemon.stats]
    );

    const maxStat = useMemo(
        () => Math.max(...pokemon.stats.map((s) => s.base_stat)),
        [pokemon.stats]
    );

    const avgStat = useMemo(
        () => Math.round(totalStats / pokemon.stats.length),
        [totalStats, pokemon.stats.length]
    );

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            animationType="none"
            transparent
            onRequestClose={onClose}
            statusBarTranslucent
        >
            {/* Animated Backdrop */}
            <AnimatedPressable
                entering={FadeIn.duration(250)}
                exiting={FadeOut.duration(200)}
                onPress={onClose}
                style={{
                    flex: 1,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    justifyContent: "flex-end",
                }}
            >
                {/* Sheet Content — onStartShouldSetResponder prevents backdrop close */}
                <Animated.View
                    entering={SlideInDown.springify().damping(20).stiffness(150).mass(0.8)}
                    exiting={SlideOutDown.duration(250)}
                    onStartShouldSetResponder={() => true}
                    style={{
                        backgroundColor: theme.background,
                        borderTopLeftRadius: 28,
                        borderTopRightRadius: 28,
                        paddingTop: 12,
                        paddingBottom: 40,
                        maxHeight: "85%",
                        // Smooth shadow
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: -4 },
                        shadowOpacity: 0.15,
                        shadowRadius: 12,
                        elevation: 16,
                    }}
                >
                    {/* Handle bar */}
                    <View style={{ alignItems: "center", marginBottom: 16 }}>
                        <View
                            style={{
                                width: 40,
                                height: 5,
                                borderRadius: 3,
                                backgroundColor: "#ccc",
                            }}
                        />
                    </View>

                    <ScrollView
                        contentContainerStyle={{
                            paddingHorizontal: 24,
                            paddingBottom: 20,
                        }}
                        showsVerticalScrollIndicator={false}
                        bounces
                    >
                        {/* Title */}
                        <Text
                            style={{
                                fontSize: 24,
                                fontWeight: "bold",
                                color: theme.text,
                                marginBottom: 4,
                            }}
                        >
                            {capitalize(pokemon.name)} — Stats
                        </Text>
                        <Text
                            style={{
                                fontSize: 14,
                                color: "#888",
                                marginBottom: 24,
                            }}
                        >
                            Base stat total: {totalStats}
                        </Text>

                        {/* Animated Stat Bars */}
                        {pokemon.stats.map((stat, index) => (
                            <AnimatedStatBar
                                key={stat.stat.name}
                                label={
                                    STAT_LABELS[stat.stat.name] ||
                                    capitalize(stat.stat.name)
                                }
                                value={stat.base_stat}
                                delay={index * 60}
                            />
                        ))}

                        {/* Summary Cards */}
                        <Animated.View
                            entering={FadeInUp.delay(400).duration(400)}
                            style={{
                                flexDirection: "row",
                                gap: 12,
                                marginTop: 16,
                                marginBottom: 24,
                            }}
                        >
                            <View
                                style={{
                                    flex: 1,
                                    padding: 16,
                                    borderRadius: 16,
                                    backgroundColor: typeColor + "18",
                                    alignItems: "center",
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 13,
                                        color: "#888",
                                        marginBottom: 4,
                                    }}
                                >
                                    Total
                                </Text>
                                <Text
                                    style={{
                                        fontSize: 28,
                                        fontWeight: "bold",
                                        color: typeColor,
                                    }}
                                >
                                    {totalStats}
                                </Text>
                            </View>
                            <View
                                style={{
                                    flex: 1,
                                    padding: 16,
                                    borderRadius: 16,
                                    backgroundColor: typeColor + "18",
                                    alignItems: "center",
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 13,
                                        color: "#888",
                                        marginBottom: 4,
                                    }}
                                >
                                    Average
                                </Text>
                                <Text
                                    style={{
                                        fontSize: 28,
                                        fontWeight: "bold",
                                        color: typeColor,
                                    }}
                                >
                                    {avgStat}
                                </Text>
                            </View>
                            <View
                                style={{
                                    flex: 1,
                                    padding: 16,
                                    borderRadius: 16,
                                    backgroundColor: typeColor + "18",
                                    alignItems: "center",
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 13,
                                        color: "#888",
                                        marginBottom: 4,
                                    }}
                                >
                                    Highest
                                </Text>
                                <Text
                                    style={{
                                        fontSize: 28,
                                        fontWeight: "bold",
                                        color: typeColor,
                                    }}
                                >
                                    {maxStat}
                                </Text>
                            </View>
                        </Animated.View>

                        {/* Analysis */}
                        <Animated.View
                            entering={FadeInUp.delay(500).duration(400)}
                        >
                            <Text
                                style={{
                                    fontSize: 18,
                                    fontWeight: "bold",
                                    color: theme.text,
                                    marginBottom: 12,
                                }}
                            >
                                Analysis
                            </Text>
                            {pokemon.stats.map((stat) => {
                                const label =
                                    STAT_LABELS[stat.stat.name] ||
                                    capitalize(stat.stat.name);
                                const val = stat.base_stat;
                                let rating: string;
                                let ratingColor: string;
                                if (val >= 120) {
                                    rating = "Excellent";
                                    ratingColor = "#4CAF50";
                                } else if (val >= 100) {
                                    rating = "Very Good";
                                    ratingColor = "#8BC34A";
                                } else if (val >= 80) {
                                    rating = "Good";
                                    ratingColor = "#FFC107";
                                } else if (val >= 50) {
                                    rating = "Average";
                                    ratingColor = "#FF9800";
                                } else {
                                    rating = "Low";
                                    ratingColor = "#F44336";
                                }

                                return (
                                    <View
                                        key={stat.stat.name}
                                        style={{
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            paddingVertical: 8,
                                            borderBottomWidth: 1,
                                            borderBottomColor:
                                                colorScheme === "dark"
                                                    ? "#333"
                                                    : "#eee",
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontSize: 14,
                                                color: theme.text,
                                            }}
                                        >
                                            {label}
                                        </Text>
                                        <View
                                            style={{
                                                backgroundColor:
                                                    ratingColor + "20",
                                                paddingHorizontal: 12,
                                                paddingVertical: 4,
                                                borderRadius: 12,
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    fontSize: 13,
                                                    fontWeight: "600",
                                                    color: ratingColor,
                                                }}
                                            >
                                                {rating}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </Animated.View>

                        {/* Close Button */}
                        <Pressable
                            onPress={onClose}
                            style={{
                                marginTop: 24,
                                padding: 16,
                                borderRadius: 14,
                                backgroundColor: typeColor,
                                alignItems: "center",
                                borderCurve: "continuous",
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 17,
                                    fontWeight: "bold",
                                    color: "#fff",
                                }}
                            >
                                Close
                            </Text>
                        </Pressable>
                    </ScrollView>
                </Animated.View>
            </AnimatedPressable>
        </Modal>
    );
}
