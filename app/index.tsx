import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Button,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

// Composant principal de la page d'accueil
const HomeScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* En-tête avec le nom de l'app */}
      <Button title="Go to Doctor" onPress={() => router.push("/doctor")} />
      <View style={styles.header}>
        <Text style={styles.appName}>Yafa Santé</Text>
        <Text style={styles.tagline}>Votre santé, notre priorité</Text>
      </View>

      {/* Section des modules */}
      <View style={styles.modulesContainer}>
        {/* Module 1: Dossier médical numérique */}
        <TouchableOpacity
          style={styles.moduleCard}
          onPress={() => router.push("/(tabs)/carnet")}
        >
          <Feather
            name="file-text"
            size={50}
            color="#1A3C34"
            style={styles.moduleIcon}
          />
          <Text style={styles.moduleTitle}>Carnet Médical</Text>
          <Text style={styles.moduleDescription}>
            Accédez à votre historique médical.
          </Text>
        </TouchableOpacity>

        {/* Module 2: Éducation sanitaire vocale */}
        <TouchableOpacity
          style={styles.moduleCard}
          onPress={() => router.push("/(tabs)/conseils")}
        >
          <Feather
            name="headphones"
            size={50}
            color="#1A3C34"
            style={styles.moduleIcon}
          />
          <Text style={styles.moduleTitle}>Conseils Santé</Text>
          <Text style={styles.moduleDescription}>
            Écoutez des messages vocaux sur la santé en plusieurs langues.
          </Text>
        </TouchableOpacity>

        {/* Module 3: Questions/Réponses */}
        <TouchableOpacity
          style={styles.moduleCard}
          onPress={() => router.push("/(tabs)/forum")}
        >
          <Feather
            name="help-circle"
            size={50}
            color="#1A3C34"
            style={styles.moduleIcon}
          />
          <Text style={styles.moduleTitle}>Questions Santé</Text>
          <Text style={styles.moduleDescription}>
            Posez vos questions à des professionnels de santé.
          </Text>
        </TouchableOpacity>
      </View>

      {/* Pied de page */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Disponible en Français, Mooré, Dioula, Fulfuldé
        </Text>
        <Text style={styles.footerText}>Fonctionne hors ligne</Text>
      </View>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A3C34",
  },
  tagline: {
    fontSize: 16,
    color: "#4A4A4A",
    marginTop: 5,
  },
  modulesContainer: {
    flex: 1,
    justifyContent: "space-around",
  },
  moduleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 20,
    marginVertical: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  moduleIcon: {
    marginBottom: 10,
  },
  moduleTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A3C34",
    marginBottom: 5,
  },
  moduleDescription: {
    fontSize: 14,
    color: "#4A4A4A",
    textAlign: "center",
  },
  footer: {
    alignItems: "center",
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: "#4A4A4A",
  },
});

export default HomeScreen;
