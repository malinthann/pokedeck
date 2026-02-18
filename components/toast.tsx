import { Text, useColorScheme } from "react-native";
import Animated, {
    FadeInDown,
    FadeOutDown
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";


interface ToastProps {
    message: string;
    visible: boolean;
    icon?: string;
    duration?: number;
}

export function Toast({ message, visible, icon = "✓", duration = 2000 }: ToastProps) {
    const colorScheme = useColorScheme() ?? "light";
    const insets = useSafeAreaInsets();

    if (!visible) return null;

    return (
        <Animated.View
            entering={FadeInDown.springify().damping(18).stiffness(200)}
            exiting={FadeOutDown.duration(250)}
            style={{
                position: "absolute",
                bottom: insets.bottom + 24,
                left: 20,
                right: 20,
                backgroundColor: colorScheme === "dark" ? "#2A2A2A" : "#333",
                borderRadius: 14,
                paddingHorizontal: 20,
                paddingVertical: 14,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 12,
                elevation: 8,
                zIndex: 9999,
            }}
        >
            <Text style={{ fontSize: 18 }}>{icon}</Text>
            <Text
                style={{
                    color: "#fff",
                    fontSize: 15,
                    fontWeight: "600",
                    flex: 1,
                }}
                numberOfLines={1}
            >
                {message}
            </Text>
        </Animated.View>
    );
}
