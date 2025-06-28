import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import DateTimePicker from "@react-native-community/datetimepicker";

const Colors = {
  white: "#FFFFFF",
  black: "#000000",
  primary: "#34acb4",
  primaryDark: "#2a8a92",
  secondary: "#f0f0f0",
  lightGray: "#f8f8f8",
  darkGray: "#333333",
};

type FormType = "consultation" | "prescription" | "antecedent";

interface ConsultationData {
  date: string;
  description: string;
  doctor: string;
  workplace: string;
}

interface PrescriptionData {
  date: string;
  medication: string;
  dosage: string;
  doctor: string;
  workplace: string;
}

interface AntecedentData {
  antecedent: string;
}

export default function Add() {
  const [activeForm, setActiveForm] = useState<FormType>("consultation");
  const [showQR, setShowQR] = useState(false);
  const [qrData, setQrData] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Données des formulaires
  const [consultationData, setConsultationData] = useState<ConsultationData>({
    date: new Date().toLocaleDateString(),
    description: "",
    doctor: "",
    workplace: "",
  });

  const [prescriptionData, setPrescriptionData] = useState<PrescriptionData>({
    date: new Date().toLocaleDateString(),
    medication: "",
    dosage: "",
    doctor: "",
    workplace: "",
  });

  const [antecedentData, setAntecedentData] = useState<AntecedentData>({
    antecedent: "",
  });

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toLocaleDateString();
      setDate(selectedDate);

      if (activeForm === "consultation") {
        setConsultationData({ ...consultationData, date: formattedDate });
      } else if (activeForm === "prescription") {
        setPrescriptionData({ ...prescriptionData, date: formattedDate });
      }
    }
  };

  const handleSubmit = () => {
    let dataToSend;

    switch (activeForm) {
      case "consultation":
        if (!consultationData.description || !consultationData.doctor) {
          Alert.alert(
            "Erreur",
            "Veuillez remplir tous les champs obligatoires"
          );
          return;
        }
        dataToSend = {
          consultations: [consultationData],
          prescriptions: [],
          antecedents: [],
        };
        break;

      case "prescription":
        if (
          !prescriptionData.medication ||
          !prescriptionData.dosage ||
          !prescriptionData.doctor
        ) {
          Alert.alert(
            "Erreur",
            "Veuillez remplir tous les champs obligatoires"
          );
          return;
        }
        dataToSend = {
          consultations: [],
          prescriptions: [prescriptionData],
          antecedents: [],
        };
        break;

      case "antecedent":
        if (!antecedentData.antecedent) {
          Alert.alert("Erreur", "Veuillez saisir un antécédent");
          return;
        }
        dataToSend = {
          consultations: [],
          prescriptions: [],
          antecedents: [antecedentData.antecedent],
        };
        break;
    }

    const qrString = `sanbacare://medical/${JSON.stringify(dataToSend)}`;
    console.log(qrString);

    setQrData(qrString);
    setShowQR(true);
  };

  const resetForm = () => {
    setShowQR(false);
    setConsultationData({
      date: new Date().toLocaleDateString(),
      description: "",
      doctor: "",
      workplace: "",
    });
    setPrescriptionData({
      date: new Date().toLocaleDateString(),
      medication: "",
      dosage: "",
      doctor: "",
      workplace: "",
    });
    setAntecedentData({
      antecedent: "",
    });
  };

  return (
    <ScrollView style={styles.container}>
      {!showQR ? (
        <>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeForm === "consultation" && styles.activeTab,
              ]}
              onPress={() => setActiveForm("consultation")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeForm === "consultation" && styles.activeTabText,
                ]}
              >
                Consultation
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                activeForm === "prescription" && styles.activeTab,
              ]}
              onPress={() => setActiveForm("prescription")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeForm === "prescription" && styles.activeTabText,
                ]}
              >
                Prescription
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                activeForm === "antecedent" && styles.activeTab,
              ]}
              onPress={() => setActiveForm("antecedent")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeForm === "antecedent" && styles.activeTabText,
                ]}
              >
                Antécédent
              </Text>
            </TouchableOpacity>
          </View>

          {activeForm === "consultation" && (
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>Nouvelle Consultation</Text>

              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Feather name="calendar" size={20} color={Colors.primary} />
                <Text style={styles.dateText}>{consultationData.date}</Text>
              </TouchableOpacity>

              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={styles.input}
                multiline
                numberOfLines={4}
                value={consultationData.description}
                onChangeText={(text) =>
                  setConsultationData({
                    ...consultationData,
                    description: text,
                  })
                }
                placeholder="Détails de la consultation..."
              />

              <Text style={styles.label}>Médecin *</Text>
              <TextInput
                style={styles.input}
                value={consultationData.doctor}
                onChangeText={(text) =>
                  setConsultationData({ ...consultationData, doctor: text })
                }
                placeholder="Nom du médecin"
              />

              <Text style={styles.label}>Établissement</Text>
              <TextInput
                style={styles.input}
                value={consultationData.workplace}
                onChangeText={(text) =>
                  setConsultationData({ ...consultationData, workplace: text })
                }
                placeholder="Lieu de consultation"
              />
            </View>
          )}

          {activeForm === "prescription" && (
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>Nouvelle Prescription</Text>

              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Feather name="calendar" size={20} color={Colors.primary} />
                <Text style={styles.dateText}>{prescriptionData.date}</Text>
              </TouchableOpacity>

              <Text style={styles.label}>Médicament *</Text>
              <TextInput
                style={styles.input}
                value={prescriptionData.medication}
                onChangeText={(text) =>
                  setPrescriptionData({ ...prescriptionData, medication: text })
                }
                placeholder="Nom du médicament"
              />

              <Text style={styles.label}>Posologie *</Text>
              <TextInput
                style={styles.input}
                value={prescriptionData.dosage}
                onChangeText={(text) =>
                  setPrescriptionData({ ...prescriptionData, dosage: text })
                }
                placeholder="Dosage et fréquence"
              />

              <Text style={styles.label}>Médecin *</Text>
              <TextInput
                style={styles.input}
                value={prescriptionData.doctor}
                onChangeText={(text) =>
                  setPrescriptionData({ ...prescriptionData, doctor: text })
                }
                placeholder="Nom du médecin"
              />

              <Text style={styles.label}>Établissement</Text>
              <TextInput
                style={styles.input}
                value={prescriptionData.workplace}
                onChangeText={(text) =>
                  setPrescriptionData({ ...prescriptionData, workplace: text })
                }
                placeholder="Lieu de prescription"
              />
            </View>
          )}

          {activeForm === "antecedent" && (
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>Nouvel Antécédent</Text>

              <Text style={styles.label}>Antécédent médical *</Text>
              <TextInput
                style={[styles.input, { height: 100 }]}
                multiline
                value={antecedentData.antecedent}
                onChangeText={(text) => setAntecedentData({ antecedent: text })}
                placeholder="Décrivez l'antécédent médical..."
              />
            </View>
          )}

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Générer QR Code</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.qrContainer}>
          <Text style={styles.qrTitle}>QR Code à scanner par le patient</Text>

          <View style={styles.qrCodeContainer}>
            <QRCode
              value={qrData}
              size={250}
              color={Colors.black}
              backgroundColor={Colors.white}
            />
          </View>

          <Text style={styles.instructions}>
            Le patient doit scanner ce code avec son application pour ajouter
            ces informations à son carnet de santé.
          </Text>

          <TouchableOpacity style={styles.newFormButton} onPress={resetForm}>
            <Text style={styles.newFormButtonText}>
              Créer un nouveau formulaire
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
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
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    backgroundColor: Colors.lightGray,
    borderRadius: 10,
    overflow: "hidden",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: Colors.black,
  },
  activeTabText: {
    color: Colors.white,
    fontWeight: "bold",
  },
  formContainer: {
    marginBottom: 30,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 20,
    textAlign: "center",
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 8,
    marginBottom: 15,
  },
  dateText: {
    marginLeft: 10,
    fontSize: 16,
    color: Colors.black,
  },
  label: {
    fontSize: 14,
    color: Colors.black,
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: Colors.white,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  qrContainer: {
    alignItems: "center",
    padding: 20,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 30,
    textAlign: "center",
  },
  qrCodeContainer: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
  },
  instructions: {
    fontSize: 14,
    color: Colors.black,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  newFormButton: {
    backgroundColor: Colors.lightGray,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  },
  newFormButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "bold",
  },
});
