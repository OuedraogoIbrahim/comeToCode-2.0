import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

const Colors = {
  white: "#FFFFFF",
  black: "#000000",
  primary: "#34acb4",
  primaryDark: "#2a8a92",
  secondary: "#f0f0f0",
  lightGray: "#f8f8f8",
  darkGray: "#333333",
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

interface MedicalData {
  consultations: Consultation[];
  prescriptions: Prescription[];
  antecedents: string[];
}

export default function Doctor() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState<MedicalData | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("Consultations");

  // Vérifier les permissions de la caméra
  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Nous avons besoin de votre autorisation pour accéder à votre caméra
          pour scanner les QR codes
        </Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>Autoriser la caméra</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Gérer le scan du QR code
  const handleBarCodeScanned = ({ data }: { data: string }) => {
    try {
      const jsonData = data.replace("sanbacare://medical/", "");
      const parsedData: MedicalData = JSON.parse(jsonData);
      setScannedData(parsedData);
      setIsScanning(false);
    } catch (error) {
      console.error("Erreur lors du parsing des données du QR code :", error);
      alert("QR code invalide. Veuillez scanner un QR code valide.");
    }
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

  return (
    <View style={styles.container}>
      {!isScanning && !scannedData && (
        <View style={styles.homeContainer}>
          <Text style={styles.title}>Bienvenue Docteur</Text>
          <Text style={styles.subtitle}>Que souhaitez-vous faire ?</Text>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.actionButton, styles.scanButton]}
              onPress={() => setIsScanning(true)}
            >
              <Feather name="camera" size={32} color={Colors.white} />
              <Text style={styles.actionButtonText}>Scanner un QR code</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.addButton]}
              onPress={() => router.push("/add")}
            >
              <Feather name="plus-circle" size={32} color={Colors.white} />
              <Text style={styles.actionButtonText}>Ajouter des données</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {isScanning && (
        <View style={styles.cameraContainer}>
          <CameraView
            onBarcodeScanned={handleBarCodeScanned}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            style={styles.camera}
            facing="back"
          >
            <View style={styles.cameraOverlay}>
              <View style={styles.scanFrame} />
              <Text style={styles.scanText}>Scannez le QR code du patient</Text>
            </View>
          </CameraView>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setIsScanning(false)}
          >
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      )}

      {scannedData && !isScanning && (
        <ScrollView style={styles.dataScreen}>
          {/* Tabs stylisées */}
          <View style={styles.tabContainer}>
            {["Consultations", "Prescriptions", "Antécédents"].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabButton,
                  activeTab === tab && styles.activeTabButton,
                ]}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.activeTabText,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Contenu des données */}
          <View style={styles.dataContent}>
            {activeTab === "Consultations" && (
              <>
                <Text style={styles.sectionTitle}>
                  Historique des consultations
                </Text>
                {scannedData.consultations?.length > 0 ? (
                  Object.entries(groupByDate(scannedData.consultations)).map(
                    ([date, items]) => (
                      <View key={date} style={styles.dateGroup}>
                        <Text style={styles.dateTitle}>{date}</Text>
                        {items.map((consult, index) => (
                          <View key={index} style={styles.dataCard}>
                            <Text style={styles.dataDescription}>
                              {consult.description}
                            </Text>
                            <View style={styles.doctorInfo}>
                              <Feather
                                name="user"
                                size={14}
                                color={Colors.primary}
                              />
                              <Text style={styles.doctorText}>
                                {consult.doctor} • {consult.workplace}
                              </Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    )
                  )
                ) : (
                  <View style={styles.emptyState}>
                    <Feather name="calendar" size={40} color={Colors.primary} />
                    <Text style={styles.emptyText}>
                      Aucune consultation enregistrée
                    </Text>
                  </View>
                )}
              </>
            )}

            {activeTab === "Prescriptions" && (
              <>
                <Text style={styles.sectionTitle}>Ordonnances médicales</Text>
                {scannedData.prescriptions?.length > 0 ? (
                  Object.entries(groupByDate(scannedData.prescriptions)).map(
                    ([date, items]) => (
                      <View key={date} style={styles.dateGroup}>
                        <Text style={styles.dateTitle}>{date}</Text>
                        {items.map((presc, index) => (
                          <View key={index} style={styles.dataCard}>
                            <View style={styles.medicationRow}>
                              <Feather
                                name="activity"
                                size={16}
                                color={Colors.primary}
                              />
                              <Text style={styles.medicationText}>
                                {presc.medication}{" "}
                                <Text style={styles.dosageText}>
                                  ({presc.dosage})
                                </Text>
                              </Text>
                            </View>
                            <View style={styles.doctorInfo}>
                              <Feather
                                name="user"
                                size={14}
                                color={Colors.primary}
                              />
                              <Text style={styles.doctorText}>
                                {presc.doctor} • {presc.workplace}
                              </Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    )
                  )
                ) : (
                  <View style={styles.emptyState}>
                    <Feather
                      name="file-text"
                      size={40}
                      color={Colors.primary}
                    />
                    <Text style={styles.emptyText}>
                      Aucune prescription enregistrée
                    </Text>
                  </View>
                )}
              </>
            )}

            {activeTab === "Antécédents" && (
              <>
                <Text style={styles.sectionTitle}>Antécédents médicaux</Text>
                {scannedData.antecedents?.length > 0 ? (
                  <View style={styles.antecedentsList}>
                    {scannedData.antecedents.map((ant, index) => (
                      <View key={index} style={styles.antecedentItem}>
                        <View style={styles.bulletPoint} />
                        <Text style={styles.antecedentText}>{ant}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyState}>
                    <Feather
                      name="alert-circle"
                      size={40}
                      color={Colors.primary}
                    />
                    <Text style={styles.emptyText}>
                      Aucun antécédent enregistré
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>

          {/* Bouton de retour */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              setScannedData(null);
              setIsScanning(true);
            }}
          >
            <Feather name="camera" size={24} color={Colors.white} />
            <Text style={styles.buttonText}>Scanner un autre patient</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  permissionText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 30,
    color: Colors.darkGray,
    lineHeight: 26,
  },
  homeContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.darkGray,
    marginBottom: 40,
  },
  buttonGroup: {
    width: "100%",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  scanButton: {
    backgroundColor: Colors.primary,
  },
  addButton: {
    backgroundColor: "#4a90e2",
  },
  actionButtonText: {
    fontSize: 18,
    color: Colors.white,
    marginLeft: 15,
    fontWeight: "600",
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  scanFrame: {
    width: width * 0.7,
    height: width * 0.7,
    borderWidth: 2,
    borderColor: Colors.white,
    borderRadius: 20,
  },
  scanText: {
    color: Colors.white,
    fontSize: 18,
    marginTop: 30,
    fontWeight: "500",
  },
  cancelButton: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: Colors.white,
  },
  cancelButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "500",
  },
  dataScreen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: Colors.lightGray,
    borderRadius: 10,
    padding: 5,
    marginBottom: 25,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    color: Colors.darkGray,
    fontWeight: "500",
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: "600",
  },
  dataContent: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.primary,
    marginBottom: 20,
  },
  dateGroup: {
    marginBottom: 25,
  },
  dateTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.darkGray,
    marginBottom: 12,
    paddingLeft: 5,
  },
  dataCard: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  dataDescription: {
    fontSize: 15,
    color: Colors.black,
    marginBottom: 8,
    lineHeight: 22,
  },
  medicationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  medicationText: {
    fontSize: 15,
    color: Colors.black,
    marginLeft: 8,
  },
  dosageText: {
    fontSize: 14,
    color: Colors.darkGray,
  },
  doctorInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  doctorText: {
    fontSize: 13,
    color: Colors.darkGray,
    marginLeft: 5,
  },
  antecedentsList: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 15,
  },
  antecedentItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginRight: 10,
  },
  antecedentText: {
    fontSize: 15,
    color: Colors.black,
    flex: 1,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
    paddingHorizontal: 30,
    backgroundColor: Colors.lightGray,
    borderRadius: 10,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.darkGray,
    marginTop: 15,
    textAlign: "center",
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 10,
    marginBottom: 30,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: "600",
    marginLeft: 10,
  },
});
