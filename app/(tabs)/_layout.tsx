import React, { useEffect, useRef } from "react";
import { StyleSheet, TouchableOpacity, View, Text } from "react-native";
import { Tabs, usePathname, useRouter } from "expo-router";
import * as Animatable from "react-native-animatable";
import { Feather } from "@expo/vector-icons";

type TabItem = {
  route: string;
  label: string;
  icon: string;
};

const Colors = {
  white: "#FFFFFF",
  black: "#000000",
  primary: "#34acb4",
};

const TabArr: TabItem[] = [
  { route: "carnet", label: "Dossier Médical", icon: "file-text" },
  { route: "conseils", label: "Conseils Santé", icon: "headphones" },
  { route: "forum", label: "Questions Santé", icon: "help-circle" },
];

const animateFocused = {
  0: { scale: 0.5, translateY: 7 },
  0.8: { translateY: -24 },
  1: { scale: 1.1, translateY: -14 },
};

const animateUnfocused = {
  0: { scale: 1.1, translateY: -14 },
  1: { scale: 1, translateY: 7 },
};

const circleExpand = {
  0: { scale: 0 },
  1: { scale: 1 },
};

const circleCollapse = {
  0: { scale: 1 },
  1: { scale: 0 },
};

const TabButton: React.FC<{
  item: TabItem;
  onPress: () => void;
}> = ({ item, onPress }) => {
  const pathname = usePathname();
  const focused = pathname.includes(item.route);
  const viewRef = useRef<Animatable.View & View>(null);
  const circleRef = useRef<Animatable.View & View>(null);
  const textRef = useRef<Animatable.Text & Text>(null);

  useEffect(() => {
    if (focused) {
      viewRef.current?.animate(animateFocused, 800);
      circleRef.current?.animate(circleExpand, 800);
      textRef.current?.transitionTo({ scale: 1, opacity: 1 }, 800);
    } else {
      viewRef.current?.animate(animateUnfocused, 800);
      circleRef.current?.animate(circleCollapse, 800);
      textRef.current?.transitionTo({ scale: 0, opacity: 0 }, 800);
    }
  }, [focused]);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={1}
      style={styles.container}
    >
      <Animatable.View ref={viewRef} duration={800} style={styles.container}>
        <View
          style={[
            styles.btn,
            { backgroundColor: focused ? Colors.primary : Colors.white },
          ]}
        >
          <Animatable.View ref={circleRef} style={styles.circle} />
          <Feather
            name={item.icon}
            size={24}
            color={focused ? Colors.white : Colors.primary}
          />
        </View>
        <Animatable.Text
          ref={textRef}
          style={[
            styles.text,
            { color: focused ? Colors.primary : Colors.black },
          ]}
        >
          {item.label}
        </Animatable.Text>
      </Animatable.View>
    </TouchableOpacity>
  );
};

export default function TabLayout() {
  const navigation = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: styles.tabBar,
        headerShown: true,
        headerStyle: {
          backgroundColor: "#f8f8f8",
        },
        headerTitle: "SanbaCare",
        headerTitleAlign: "center",
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("/");
            }}
            style={{ marginLeft: 16 }}
          >
            <Feather name="home" size={24} color="black" />
          </TouchableOpacity>
        ),
      }}
    >
      {TabArr.map((item, index) => (
        <Tabs.Screen
          key={index}
          name={item.route}
          options={{
            tabBarShowLabel: false,
            tabBarButton: (props) => <TabButton {...props} item={item} />,
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 70,
  },
  tabBar: {
    height: 70,
    marginTop: 18,
    marginBottom: 8,
    marginHorizontal: 16,
    borderRadius: 16,
    backgroundColor: Colors.white,
    elevation: 5,
  },
  btn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  circle: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    borderRadius: 25,
  },
  text: {
    fontSize: 12,
    textAlign: "center",
    fontWeight: "500",
    opacity: 0,
  },
});
