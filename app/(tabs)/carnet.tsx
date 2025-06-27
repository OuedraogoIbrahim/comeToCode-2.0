import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Camera, CameraView } from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import NetInfo from "@react-native-community/netinfo";

const Colors = {
  white: "#FFFFFF",
  black: "#000000",
  primary: "#34acb4",
  secondary: "#e0e0e0",
};

// Typage TypeScript
interface Consultation {
  date: string;
  description: string;
  doctor: string;
  workplace: string;
}

interface Prescription {
  date: string;
  medication: string;
  dosage: string;
  doctor: string;
  workplace: string;
}

interface Antecedent {
  antecedent: string;
}

interface MedicalData {
  consultations: Consultation[];
  prescriptions: Prescription[];
  antecedents: string[];
}

// Simuler un serveur
const simulateServerSync = async (
  data: MedicalData
): Promise<{ success: boolean }> => {
  console.log("Synchronisation avec le serveur :", data);
  return { success: true };
};

// Données fictives
const dummyMedicalData: MedicalData = {
  consultations: [
    {
      date: "10/01/2025",
      description: "Consultation générale, contrôle annuel",
      doctor: "Dr. Marie Leclerc",
      workplace: "Hôpital Saint-Joseph",
    },
    {
      date: "10/01/2025",
      description: "Examen ophtalmologique",
      doctor: "Dr. Paul Martin",
      workplace: "Clinique des Yeux",
    },
    {
      date: "05/06/2024",
      description: "Suivi pour hypertension",
      doctor: "Dr. Sophie Durand",
      workplace: "Centre Médical Nord",
    },
  ],
  prescriptions: [
    {
      date: "10/01/2025",
      medication: "Paracétamol",
      dosage: "500mg, 3x/jour",
      doctor: "Dr. Marie Leclerc",
      workplace: "Hôpital Saint-Joseph",
    },
    {
      date: "05/06/2024",
      medication: "Amoxicilline",
      dosage: "1000mg, 2x/jour",
      doctor: "Dr. Sophie Durand",
      workplace: "Centre Médical Nord",
    },
  ],
  antecedents: ["Diabète type 2", "Allergie à la pénicilline"],
};

export default function Carnet() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState<boolean>(false);
  const [medicalData, setMedicalData] = useState<MedicalData | null>(null);
  const [showQR, setShowQR] = useState<boolean>(false);
  const [link, setLink] = useState<string>("");
  const [pendingSync, setPendingSync] = useState<MedicalData[]>([]);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("Consultations");

  // Demander la permission pour la caméra
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  // Charger les données médicales
  useEffect(() => {
    const loadData = async () => {
      try {
        // await AsyncStorage.removeItem("medicalData");
        const storedData = await AsyncStorage.getItem("medicalData");

        if (!storedData) {
          await AsyncStorage.setItem(
            "medicalData",
            JSON.stringify(dummyMedicalData)
          );
          setMedicalData(dummyMedicalData);
        } else {
          setMedicalData(JSON.parse(storedData));
        }
        const storedPending = await AsyncStorage.getItem("pendingSync");
        if (storedPending) setPendingSync(JSON.parse(storedPending));
      } catch (error) {
        console.log(error);
        Alert.alert("Erreur", "Impossible de charger les données.");
      }
    };
    loadData();
  }, []);

  // Synchronisation avec connexion réseau
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && pendingSync.length > 0) {
        syncPendingData();
      }
    });
    return () => unsubscribe();
  }, [pendingSync]);

  // Gérer le scan du QR code
  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    setScanned(true);
    setCameraActive(false);
    try {
      const newData: MedicalData = JSON.parse(data);
      const updatedData = medicalData
        ? {
            ...medicalData,
            consultations: [
              ...(medicalData.consultations || []),
              ...(newData.consultations || []),
            ],
            prescriptions: [
              ...(medicalData.prescriptions || []),
              ...(newData.prescriptions || []),
            ],
            antecedents: [
              ...(medicalData.antecedents || []),
              ...(newData.antecedents || []),
            ],
          }
        : newData;

      setMedicalData(updatedData);
      await AsyncStorage.setItem("medicalData", JSON.stringify(updatedData));

      const newPending = [...pendingSync, newData];
      setPendingSync(newPending);
      await AsyncStorage.setItem("pendingSync", JSON.stringify(newPending));

      Alert.alert("Succès", "Dossier médical mis à jour !");
    } catch (error) {
      Alert.alert("Erreur", "QR code invalide ou données corrompues.");
    }
  };

  // Générer un lien pour le QR code
  const generateLink = () => {
    const uniqueLink = `sanbacare://medical/${JSON.stringify(medicalData)}`;
    setLink(uniqueLink);
    setShowQR(true);
  };

  // Synchroniser les données en attente
  const syncPendingData = async () => {
    try {
      for (const data of pendingSync) {
        const response = await simulateServerSync(data);
        if (response.success) {
          const newPending = pendingSync.filter((item) => item !== data);
          setPendingSync(newPending);
          await AsyncStorage.setItem("pendingSync", JSON.stringify(newPending));
        }
      }
      if (pendingSync.length > 0) {
        Alert.alert("Succès", "Données synchronisées avec le serveur !");
      }
    } catch (error) {
      Alert.alert("Erreur", "Échec de la synchronisation.");
    }
  };

  // Activer la caméra
  const activateCamera = () => {
    setCameraActive(true);
    setScanned(false);
    setShowQR(false);
  };

  // Grouper par date
  const groupByDate = <T extends Consultation | Prescription>(
    items: T[]
  ): { [key: string]: T[] } => {
    return items.reduce((acc, item) => {
      const date = item.date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(item);
      return acc;
    }, {} as { [key: string]: T[] });
  };

  // Vérifier la permission de la caméra
  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text>Accès à la caméra requis pour scanner les QR codes.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Tabs */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          marginBottom: 20,
        }}
      >
        {["Consultations", "Prescriptions", "Antécédents"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={{
              flex: 1,
              paddingVertical: 10,
              alignItems: "center",
              borderRadius: activeTab === tab ? 10 : 0,
              backgroundColor:
                activeTab === tab ? Colors.primary : "transparent",
            }}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={{
                fontSize: 16,
                color: activeTab === tab ? Colors.white : Colors.black,
                fontWeight: activeTab === tab ? "bold" : "normal",
              }}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bouton pour activer la caméra */}
      {!cameraActive && !showQR && (
        <TouchableOpacity style={styles.button} onPress={activateCamera}>
          <Feather name="camera" size={24} color={Colors.white} />
          <Text style={styles.buttonText}>Scanner un QR code</Text>
        </TouchableOpacity>
      )}

      {/* Scanner QR code */}
      {cameraActive && !showQR && (
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            // onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
          />
          <Text style={styles.instructionText}>
            Scannez le QR code du médecin pour mettre à jour votre dossier
          </Text>
          {!scanned && (
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                setScanned(false);
                setCameraActive(false);
              }}
            >
              <Text style={styles.buttonText}>Retour</Text>
            </TouchableOpacity>
          )}
          {scanned && (
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                setScanned(false);
                setCameraActive(false);
              }}
            >
              <Text style={styles.buttonText}>Retour</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Afficher les données médicales */}
      {medicalData && !showQR && !cameraActive && (
        <View style={styles.dataContainer}>
          {activeTab === "Consultations" && (
            <>
              <Text style={styles.dataTitle}>Consultations</Text>
              {medicalData.consultations?.length > 0 ? (
                Object.entries(groupByDate(medicalData.consultations)).map(
                  ([date, items]) => (
                    <View key={date} style={styles.groupContainer}>
                      <Text style={styles.groupDate}>{date}</Text>
                      {items.map((consult, index) => (
                        <View key={index} style={styles.itemContainer}>
                          <Text style={styles.dataText}>
                            {consult.description}
                          </Text>
                          <Text style={styles.subText}>
                            Par: {consult.doctor} ({consult.workplace})
                          </Text>
                        </View>
                      ))}
                    </View>
                  )
                )
              ) : (
                <Text style={styles.dataText}>
                  Aucune consultation enregistrée
                </Text>
              )}
            </>
          )}

          {activeTab === "Prescriptions" && (
            <>
              <Text style={styles.dataTitle}>Prescriptions</Text>
              {medicalData.prescriptions?.length > 0 ? (
                Object.entries(groupByDate(medicalData.prescriptions)).map(
                  ([date, items]) => (
                    <View key={date} style={styles.groupContainer}>
                      <Text style={styles.groupDate}>{date}</Text>
                      {items.map((presc, index) => (
                        <View key={index} style={styles.itemContainer}>
                          <Text style={styles.dataText}>
                            {presc.medication} ({presc.dosage})
                          </Text>
                          <Text style={styles.subText}>
                            Par: {presc.doctor} ({presc.workplace})
                          </Text>
                        </View>
                      ))}
                    </View>
                  )
                )
              ) : (
                <Text style={styles.dataText}>
                  Aucune prescription enregistrée
                </Text>
              )}
            </>
          )}

          {activeTab === "Antécédents" && (
            <>
              <Text style={styles.dataTitle}>Antécédents</Text>
              {medicalData.antecedents?.length > 0 ? (
                medicalData.antecedents.map((ant, index) => (
                  <Text key={index} style={styles.dataText}>
                    {ant}
                  </Text>
                ))
              ) : (
                <Text style={styles.dataText}>Aucun antécédent enregistré</Text>
              )}
            </>
          )}

          <TouchableOpacity style={styles.button} onPress={generateLink}>
            <Feather name="share" size={24} color={Colors.white} />
            <Text style={styles.buttonText}>
              Afficher le QR code du dossier
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Afficher le QR code */}
      {showQR && link && (
        <View style={styles.qrContainer}>
          <QRCode
            value={link}
            size={200}
            color={Colors.black}
            backgroundColor={Colors.white}
          />
          <Text style={styles.instructionText}>
            Montrez ce QR code au médecin pour partager votre dossier
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setShowQR(false)}
          >
            <Text style={styles.buttonText}>Retour aux données</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Message si aucune donnée */}
      {!medicalData && !showQR && !cameraActive && scanned && (
        <View style={styles.dataContainer}>
          <Text style={styles.dataText}>
            Aucune donnée médicale disponible. Veuillez scanner un QR code.
          </Text>
          <TouchableOpacity style={styles.button} onPress={generateLink}>
            <Text style={styles.buttonText}>
              Générer un QR code pour le médecin
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 20,
  },
  cameraContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  camera: {
    width: 300,
    height: 300,
    borderRadius: 10,
  },
  instructionText: {
    fontSize: 16,
    color: Colors.black,
    marginVertical: 10,
    textAlign: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    textAlign: "center",
    marginLeft: 10,
  },
  dataContainer: {
    backgroundColor: "#f8f8f8",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  dataTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.black,
    marginBottom: 10,
    marginTop: 10,
  },
  dataText: {
    fontSize: 16,
    color: Colors.black,
    marginBottom: 5,
  },
  subText: {
    fontSize: 14,
    color: Colors.black,
    marginBottom: 10,
    marginLeft: 10,
  },
  groupContainer: {
    marginBottom: 15,
  },
  groupDate: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: 5,
  },
  itemContainer: {
    paddingLeft: 10,
  },
  qrContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
});
