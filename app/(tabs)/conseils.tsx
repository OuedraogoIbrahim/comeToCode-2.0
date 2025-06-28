import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Audio } from "expo-av";

const Colors = {
  white: "#FFFFFF",
  black: "#000000",
  primary: "#34acb4",
  secondary: "#e0e0e0",
};

interface AudioItem {
  type: string;
  file: any; // Fichier audio importé avec require()
}

interface Maladie {
  name: string;
  audios: AudioItem[];
}

interface Langue {
  langue: string;
  maladies: Maladie[];
}

// Importation des fichiers audio
const audioFiles = {
  fr: {
    diabete: {
      symptomes: require("../../assets/audios/fr/diabete/symptomes.mp3"),
      prevention: require("../../assets/audios/fr/diabete/prevention.mp3"),
    },
    paludisme: {
      symptomes: require("../../assets/audios/fr/paludisme/symptomes.mp3"),
      prevention: require("../../assets/audios/fr/paludisme/prevention.mp3"),
    },
  },
  moore: {
    diabete: {
      symptomes: require("../../assets/audios/moore/diabete/symptomes.mp3"),
      prevention: require("../../assets/audios/moore/diabete/prevention.mp3"),
    },
    paludisme: {
      symptomes: require("../../assets/audios/moore/paludisme/symptomes.mp3"),
      prevention: require("../../assets/audios/moore/paludisme/prevention.mp3"),
    },
  },
};

const dummyAudioData: Langue[] = [
  {
    langue: "fr",
    maladies: [
      {
        name: "Diabète",
        audios: [
          // { type: "Symptômes", file: audioFiles.fr.diabete.symptomes },
          { type: "Prévention", file: audioFiles.fr.diabete.prevention },
        ],
      },
      {
        name: "Paludisme",
        audios: [
          { type: "Symptômes", file: audioFiles.fr.paludisme.symptomes },
          { type: "Prévention", file: audioFiles.fr.paludisme.prevention },
        ],
      },
    ],
  },
  {
    langue: "moore",
    maladies: [
      {
        name: "Diabète",
        audios: [
          { type: "Symptômes", file: audioFiles.moore.diabete.symptomes },
          { type: "Prévention", file: audioFiles.moore.diabete.prevention },
        ],
      },
      {
        name: "Paludisme",
        audios: [
          { type: "Symptômes", file: audioFiles.moore.paludisme.symptomes },
          { type: "Prévention", file: audioFiles.moore.paludisme.prevention },
        ],
      },
    ],
  },
];

export default function Conseils() {
  const [selectedLangue, setSelectedLangue] = useState<string>("fr");
  const [currentSound, setCurrentSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      // Nettoyage à la destruction du composant
      if (currentSound) {
        currentSound.unloadAsync();
      }
    };
  }, [currentSound]);

  const playAudio = async (audioFile: any, audioId: string) => {
    try {
      // Arrêter la lecture en cours
      if (currentSound) {
        await currentSound.unloadAsync();
        setCurrentSound(null);
        setIsPlaying(null);
      }

      // Charger et jouer le nouveau son
      const { sound } = await Audio.Sound.createAsync(audioFile, {
        shouldPlay: true,
        isLooping: false,
      });

      setCurrentSound(sound);
      setIsPlaying(audioId);

      // Gérer la fin de lecture
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(null);
        }
      });
    } catch (error) {
      console.error("Erreur de lecture audio:", error);
      Alert.alert("Erreur", "Impossible de lire l'audio");
    }
  };

  const stopAudio = async () => {
    if (currentSound) {
      await currentSound.stopAsync();
      setIsPlaying(null);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Sélecteur de langue */}
      <View style={styles.langueContainer}>
        {["Français", "Mooré"].map((lang) => (
          <TouchableOpacity
            key={lang}
            style={[
              styles.langueButton,
              selectedLangue === (lang === "Français" ? "fr" : "moore") &&
                styles.langueButtonActive,
            ]}
            onPress={() => {
              stopAudio();
              setSelectedLangue(lang === "Français" ? "fr" : "moore");
            }}
          >
            <Text
              style={[
                styles.langueText,
                selectedLangue === (lang === "Français" ? "fr" : "moore") &&
                  styles.langueTextActive,
              ]}
            >
              {lang}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Liste des maladies et audios */}
      {dummyAudioData
        .find((lang) => lang.langue === selectedLangue)
        ?.maladies.map((maladie) => (
          <View
            key={`${selectedLangue}-${maladie.name}`}
            style={styles.maladieContainer}
          >
            <Text style={styles.maladieTitle}>{maladie.name}</Text>

            {maladie.audios.map((audio, index) => {
              const audioId = `${selectedLangue}-${maladie.name}-${audio.type}`;
              const isCurrentPlaying = isPlaying === audioId;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.audioButton,
                    isCurrentPlaying && styles.audioButtonActive,
                  ]}
                  onPress={() =>
                    isCurrentPlaying
                      ? stopAudio()
                      : playAudio(audio.file, audioId)
                  }
                >
                  <Feather
                    name={isCurrentPlaying ? "pause-circle" : "play-circle"}
                    size={20}
                    color={Colors.white}
                  />
                  <Text style={styles.audioText}>{audio.type}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 20,
  },
  langueContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    backgroundColor: Colors.secondary,
    borderRadius: 10,
    overflow: "hidden",
  },
  langueButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  langueButtonActive: {
    backgroundColor: Colors.primary,
  },
  langueText: {
    fontSize: 14,
    color: Colors.black,
  },
  langueTextActive: {
    color: Colors.white,
    fontWeight: "bold",
  },
  maladieContainer: {
    marginBottom: 25,
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  maladieTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.secondary,
    paddingBottom: 5,
  },
  audioButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  audioButtonActive: {
    backgroundColor: "#2a8a92",
  },
  audioText: {
    color: Colors.white,
    fontSize: 16,
    marginLeft: 10,
    flex: 1,
  },
});
