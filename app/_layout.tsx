import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          title: "Page d'accuel",
        }}
      />
      <Stack.Screen
        name="doctor"
        options={{
          headerShown: true,
          title: "Espace médecin",
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          headerShown: true,
          title: "Ajouter",
        }}
      />
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />{" "}
    </Stack>
  );
}
