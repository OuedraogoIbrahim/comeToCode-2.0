import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Feather } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

const { width } = Dimensions.get("window");

// Modern color palette
const Colors = {
  primary: "#2E86AB",
  primaryLight: "#5AB9EA",
  white: "#FFFFFF",
  black: "#1A1A1A",
  gray: "#6C757D",
  lightGray: "#E9ECEF",
  background: "#F8F9FA",
  success: "#28A745",
  danger: "#DC3545",
};

// Shadow style for cards
const cardShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 6,
  elevation: 3,
};

// TypeScript interfaces
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

export default function Carnet() {
  const [permission, requestPermission] = useCameraPermissions();
  const [medicalData, setMedicalData] = useState<MedicalData | null>(null);
  const [activeTab, setActiveTab] = useState<
    "Consultations" | "Prescriptions" | "Antécédents"
  >("Consultations");
  const [showQR, setShowQR] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [link, setLink] = useState("");
  const [pendingSync, setPendingSync] = useState<MedicalData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scanSuccess, setScanSuccess] = useState(false);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedData = await AsyncStorage.getItem("medicalData");
        const storedPending = await AsyncStorage.getItem("pendingSync");

        if (storedData) {
          setMedicalData(JSON.parse(storedData));
        } else {
          // Initialize with demo data if none exists
          const demoData: MedicalData = {
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
          await AsyncStorage.setItem("medicalData", JSON.stringify(demoData));
          setMedicalData(demoData);
        }

        if (storedPending) {
          setPendingSync(JSON.parse(storedPending));
        }
      } catch (error) {
        Alert.alert("Erreur", "Impossible de charger les données");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle network connectivity for sync
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && pendingSync.length > 0) {
        syncData();
      }
    });
    return () => unsubscribe();
  }, [pendingSync]);

  const syncData = async () => {
    try {
      // Simulate server sync
      await Promise.all(
        pendingSync.map((data) => {
          console.log("Syncing data:", data);
          return new Promise((resolve) => setTimeout(resolve, 1000));
        })
      );

      setPendingSync([]);
      await AsyncStorage.removeItem("pendingSync");
      Alert.alert("Succès", "Données synchronisées");
    } catch (error) {
      Alert.alert("Erreur", "Échec de la synchronisation");
    }
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    try {
      // Vérifier si c'est un QR code valide de notre application
      if (!data.startsWith("sanbacare://medical/")) {
        Alert.alert(
          "Erreur",
          "Ce n'est pas un QR code valide pour cette application"
        );
        return;
      }

      const jsonData = data.replace("sanbacare://medical/", "");
      const newData: MedicalData = JSON.parse(jsonData);

      // Vérifier que les données ont la bonne structure
      if (
        !newData.consultations &&
        !newData.prescriptions &&
        !newData.antecedents
      ) {
        Alert.alert("Erreur", "Format de données invalide");
        return;
      }

      // Afficher l'icône de succès
      setScanSuccess(true);

      // Fusionner avec les données existantes
      const updatedData = medicalData
        ? {
            consultations: [
              ...medicalData.consultations,
              ...(newData.consultations || []),
            ],
            prescriptions: [
              ...medicalData.prescriptions,
              ...(newData.prescriptions || []),
            ],
            antecedents: [
              ...medicalData.antecedents,
              ...(newData.antecedents || []),
            ],
          }
        : newData;

      setMedicalData(updatedData);
      await AsyncStorage.setItem("medicalData", JSON.stringify(updatedData));

      // Ajouter aux données en attente de sync
      const newPending = [...pendingSync, newData];
      setPendingSync(newPending);
      await AsyncStorage.setItem("pendingSync", JSON.stringify(newPending));

      // Fermer la caméra après 1.5 secondes
      setTimeout(() => {
        setIsScanning(false);
        setScanSuccess(false);
        Alert.alert("Succès", "Votre carnet a été mis à jour");
      }, 1500);
    } catch (error) {
      Alert.alert("Erreur", "QR code invalide ou données corrompues");
    }
  };

  const generateQRCode = () => {
    if (!medicalData) return;
    const qrData = `sanbacare://medical/${JSON.stringify(medicalData)}`;
    setLink(qrData);
    setShowQR(true);
  };

  const groupByDate = <T extends Consultation | Prescription>(items: T[]) => {
    return items.reduce((acc, item) => {
      const date = item.date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(item);
      return acc;
    }, {} as Record<string, T[]>);
  };

  if (!permission) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Accès à la caméra est nécessaire pour scanner les QR codes
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      {/* <View style={styles.header}>
        <Text style={styles.headerTitle}>Carnet de Santé</Text>
      </View> */}

      {/* Main Content */}
      {isScanning ? (
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            onBarcodeScanned={scanSuccess ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          >
            <View style={styles.cameraOverlay}>
              <View style={styles.scanFrame} />
              <Text style={styles.scanText}>Scanner le QR code du médecin</Text>

              {/* Overlay de succès */}
              {scanSuccess && (
                <View style={styles.successOverlay}>
                  <Feather
                    name="check-circle"
                    size={80}
                    color={Colors.success}
                  />
                  <Text style={styles.successText}>
                    Données ajoutées avec succès
                  </Text>
                </View>
              )}
            </View>
          </CameraView>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              setIsScanning(false);
              setScanSuccess(false);
            }}
          >
            <Text style={styles.cancelText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      ) : showQR ? (
        <View style={styles.qrContainer}>
          <View style={[styles.qrCard, cardShadow]}>
            <QRCode
              value={link}
              size={width * 0.7}
              color={Colors.primary}
              backgroundColor={Colors.white}
            />
          </View>
          <Text style={styles.qrInstruction}>
            Présentez ce code à votre médecin
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setShowQR(false)}
          >
            <Text style={styles.buttonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Tabs */}
          <View style={styles.tabContainer}>
            {(["Consultations", "Prescriptions", "Antécédents"] as const).map(
              (tab) => (
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
              )
            )}
          </View>

          {/* Data Content */}
          <ScrollView style={styles.contentContainer}>
            {activeTab === "Consultations" && (
              <DataSection
                title="Consultations"
                items={medicalData?.consultations || []}
                emptyText="Aucune consultation enregistrée"
                renderItem={(item) => (
                  <>
                    <Text style={styles.itemTitle}>{item.description}</Text>
                    <View style={styles.itemMeta}>
                      <Feather name="user" size={14} color={Colors.primary} />
                      <Text style={styles.itemText}>{item.doctor}</Text>
                      <Feather
                        name="map-pin"
                        size={14}
                        color={Colors.primary}
                      />
                      <Text style={styles.itemText}>{item.workplace}</Text>
                    </View>
                  </>
                )}
              />
            )}

            {activeTab === "Prescriptions" && (
              <DataSection
                title="Prescriptions"
                items={medicalData?.prescriptions || []}
                emptyText="Aucune prescription enregistrée"
                renderItem={(item) => (
                  <>
                    <View style={styles.medicationRow}>
                      <Feather
                        name="activity"
                        size={16}
                        color={Colors.primary}
                      />
                      <Text style={styles.medicationName}>
                        {item.medication}
                      </Text>
                      <Text style={styles.medicationDosage}>{item.dosage}</Text>
                    </View>
                    <View style={styles.itemMeta}>
                      <Feather name="user" size={14} color={Colors.primary} />
                      <Text style={styles.itemText}>{item.doctor}</Text>
                      <Feather
                        name="calendar"
                        size={14}
                        color={Colors.primary}
                      />
                      <Text style={styles.itemText}>{item.date}</Text>
                    </View>
                  </>
                )}
              />
            )}

            {activeTab === "Antécédents" && (
              <DataSection
                title="Antécédents médicaux"
                items={medicalData?.antecedents || []}
                isEmpty={true}
                emptyText="Aucun antécédent enregistré"
                renderItem={(item) => (
                  <View style={styles.antecedentItem}>
                    <View style={styles.bulletPoint} />
                    <Text style={styles.antecedentText}>{item}</Text>
                  </View>
                )}
              />
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setIsScanning(true)}
            >
              <Feather name="camera" size={20} color={Colors.white} />
              <Text style={styles.buttonText}>Scanner QR Code</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={generateQRCode}
            >
              <Feather name="share-2" size={20} color={Colors.white} />
              <Text style={styles.buttonText}>Partager mon dossier</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

// Reusable Data Section Component
const DataSection = ({
  title,
  items,
  emptyText,
  isEmpty = false,
  renderItem,
}: {
  title: string;
  items: any[];
  emptyText: string;
  isEmpty?: boolean;
  renderItem: (item: any) => React.ReactNode;
}) => {
  const groupedItems = groupByDate(items);

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>

      {items.length > 0 ? (
        Object.entries(groupedItems).map(([date, dateItems]) => (
          <View key={date} style={styles.dateGroup}>
            <Text style={styles.dateTitle}>{isEmpty ? "" : date}</Text>
            {dateItems.map((item: any, index: number) => (
              <View key={index} style={[styles.dataCard, cardShadow]}>
                {renderItem(item)}
              </View>
            ))}
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Feather name="info" size={24} color={Colors.gray} />
          <Text style={styles.emptyText}>{emptyText}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  permissionText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
    color: Colors.black,
  },
  header: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    ...cardShadow,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: Colors.white,
    textAlign: "center",
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: Colors.lightGray,
    borderRadius: 10,
    padding: 5,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: Colors.white,
    ...cardShadow,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.gray,
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: "600",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  cameraContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  camera: {
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: 20,
    overflow: "hidden",
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
    marginTop: 20,
    fontWeight: "500",
  },
  cancelButton: {
    position: "absolute",
    bottom: 40,
    backgroundColor: Colors.white,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    ...cardShadow,
  },
  cancelText: {
    color: Colors.primary,
    fontWeight: "500",
  },
  qrContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  qrCard: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  qrInstruction: {
    fontSize: 16,
    color: Colors.black,
    textAlign: "center",
    marginBottom: 20,
  },
  sectionContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.primary,
    marginBottom: 15,
  },
  dateGroup: {
    marginBottom: 20,
  },
  dateTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: 10,
  },
  dataCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.black,
    marginBottom: 8,
  },
  itemMeta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 5,
  },
  itemText: {
    fontSize: 14,
    color: Colors.gray,
    marginRight: 15,
    marginLeft: 5,
  },
  medicationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.black,
    marginLeft: 8,
  },
  medicationDosage: {
    fontSize: 14,
    color: Colors.gray,
    marginLeft: 8,
  },
  antecedentItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginRight: 10,
  },
  antecedentText: {
    fontSize: 15,
    color: Colors.black,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    backgroundColor: Colors.white,
    borderRadius: 12,
    ...cardShadow,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.gray,
    marginTop: 15,
    textAlign: "center",
  },
  actionButtons: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
    ...cardShadow,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.gray,
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
    ...cardShadow,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.white,
    marginLeft: 10,
  },
  successOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  successText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "600",
    color: Colors.success,
    textAlign: "center",
  },
});

// Helper function to group by date
function groupByDate<T extends { date: string }>(
  items: T[]
): Record<string, T[]> {
  return items.reduce((acc, item) => {
    const date = item.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}
