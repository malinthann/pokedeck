import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import Stack from "expo-router/stack";

export default function FavoritesLayout() {
    const colorScheme = useColorScheme() ?? "light";
    const theme = Colors[colorScheme];

    return (
        <Stack
            screenOptions={{
                headerLargeTitle: true,
                headerShadowVisible: false,
                headerLargeTitleShadowVisible: false,
                headerStyle: {
                    backgroundColor: theme.background,
                },
                headerLargeStyle: {
                    backgroundColor: theme.background,
                },
                headerTitleStyle: {
                    color: theme.tint,
                },
                headerTintColor: theme.tint,
            }}
        >
            <Stack.Screen name="index" options={{ title: "Favorites" }} />
        </Stack>
    );
}
