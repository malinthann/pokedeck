import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import Stack from "expo-router/stack";

export default function PokedexLayout() {
    const colorScheme = useColorScheme() ?? "light";
    const theme = Colors[colorScheme];

    return (
        <Stack
            screenOptions={{
                headerLargeTitle: true,
                headerShadowVisible: false,
                headerLargeTitleShadowVisible: false,
                headerStyle: {
                    backgroundColor: theme.background, // Solid background
                },
                headerLargeStyle: {
                    backgroundColor: theme.background, // Solid large title background
                },
                headerTitleStyle: {
                    color: theme.tint,
                },
                headerTintColor: theme.tint,
            }}
        >
            <Stack.Screen name="index" options={{ title: "Pokédex", headerSearchBarOptions: undefined }} />
            <Stack.Screen
                name="[id]"
                options={{ title: "Details", headerLargeTitle: false }}
            />
        </Stack>
    );
}
