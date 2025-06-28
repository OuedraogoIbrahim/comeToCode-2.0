import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

export default function Doctor() {
  const patientData = {
    id: "12345",
    nom: "Jean Dupont",
    antecedents: ["Diabète", "Hypertension"],
    derniereConsultation: "15/10/2023",
    prescription: ["Paracétamol", "Vitamine C"],
  };
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  return (
    <View style={styles.container}>
      {/* <View style={styles.container}>
        <Text>Mon Carnet de Santé</Text>
        <Text>Nom: {patientData.nom}</Text>
        <Text>Antécédents: {patientData.antecedents.join(", ")}</Text>

        <View>
          <QRCode value={JSON.stringify(patientData)} size={200} />
          <Text>Scanner ce QR pour partager mes données</Text>
        </View>
      </View> */}
      <CameraView
        onBarcodeScanned={({ data }) => {
          console.log(data);
          alert(data);
        }}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        style={styles.camera}
        facing={facing}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
});
