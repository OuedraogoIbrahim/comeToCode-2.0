import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get('window');

// Données statiques étendues pour simuler les questions/réponses
const initialQuestions = [
  {
    id: 1,
    questionFr: "Quels sont les symptômes du paludisme ?",
    questionMo: "Palu yé symptômes yé kisa ?",
    reponseFr: "Les symptômes du paludisme incluent fièvre, frissons, maux de tête et fatigue. Consultez un médecin pour un test et un traitement.",
    reponseMo: "Palu symptômes yé fièvre, frisson, tête douleur nka fatigué. Wé yé médecin pou test nka traitement.",
    auteur: "Dr. Kouadio",
    date: "2025-06-25",
    category: "Maladies Infectieuses",
    likes: 15,
    isVerified: true,
    userId: "system1",
  },
  {
    id: 2,
    questionFr: "Comment gérer le diabète au quotidien ?",
    questionMo: "Diabète yé ka gérer comment chaque jour ?",
    reponseFr: "Pour gérer le diabète, adoptez une alimentation équilibrée, surveillez votre glycémie régulièrement et suivez les recommandations médicales.",
    reponseMo: "Pou diabète gérer, wé manger sain, wé surveiller sucre sang souvent nka wé suivre médecin conseils.",
    auteur: "Awa K.",
    date: "2025-06-24",
    category: "Maladies Chroniques",
    likes: 23,
    isVerified: false,
    userId: "system2",
  },
  {
    id: 3,
    questionFr: "Comment prévenir la fièvre typhoïde ?",
    questionMo: "Fièvre typhoïde yé ka prévenir comment ?",
    reponseFr: "Pour prévenir la fièvre typhoïde, buvez de l'eau potable, lavez-vous les mains régulièrement et évitez les aliments contaminés.",
    reponseMo: "Pou fièvre typhoïde prévenir, wé boire eau propre, wé laver mains souvent nka wé éviter manger sale.",
    auteur: "Anonyme",
    date: "2025-06-23",
    category: "Prévention",
    likes: 8,
    isVerified: false,
    userId: "system3",
  },
];

// Catégories de santé
const healthCategories = [
  { id: 'all', name: 'Toutes', icon: 'grid', color: '#1A3C34' },
  { id: 'infectious', name: 'Infectieuses', icon: 'activity', color: '#E74C3C' },
  { id: 'chronic', name: 'Chroniques', icon: 'heart', color: '#3498DB' },
  { id: 'prevention', name: 'Prévention', icon: 'shield', color: '#27AE60' },
  { id: 'nutrition', name: 'Nutrition', icon: 'coffee', color: '#F39C12' },
];

// Simuler une réponse d'IA étendue
interface AIResponses {
  [key: string]: string;
}

interface LangResponses {
  fr: AIResponses;
  mo: AIResponses;
}

const simulateAIResponse = (question: string, lang: keyof LangResponses): string => {
  const responses: LangResponses = {
    fr: {
      "symptômes du paludisme": "Les symptômes du paludisme incluent fièvre, frissons, maux de tête et fatigue. Consultez un médecin pour un test et un traitement.",
      "gérer le diabète": "Pour gérer le diabète, adoptez une alimentation équilibrée, surveillez votre glycémie régulièrement et suivez les recommandations médicales.",
      "fièvre typhoïde": "Pour prévenir la fièvre typhoïde, buvez de l'eau potable, lavez-vous les mains régulièrement et évitez les aliments contaminés.",
      "vih": "Pour prévenir le VIH, utilisez des préservatifs, évitez le partage d'aiguilles et faites-vous tester régulièrement.",
      "tuberculose": "Pour prévenir la tuberculose, évitez les contacts prolongés avec des personnes infectées, maintenez une bonne ventilation.",
      "nutrition": "Une alimentation équilibrée comprend des fruits, légumes, céréales complètes et protéines maigres. Limitez les aliments transformés.",
      "hypertension": "Pour contrôler l'hypertension, réduisez le sel, faites de l'exercice régulièrement et prenez les médicaments comme prescrits.",
      default: "Je ne suis pas sûr de comprendre votre question. Veuillez consulter un médecin pour un diagnostic précis.",
    },
    mo: {
      "symptômes du paludisme": "Palu symptômes yé fièvre, frisson, tête douleur nka fatigué. Wé yé médecin pou test nka traitement.",
      "gérer le diabète": "Pou diabète gérer, wé manger sain, wé surveiller sucre sang souvent nka wé suivre médecin conseils.",
      "fièvre typhoïde": "Pou fièvre typhoïde prévenir, wé boire eau propre, wé laver mains souvent nka wé éviter manger sale.",
      "vih": "Pou VIH prévenir, wé utiliser préservatif, wé éviter partager aiguilles nka wé tester souvent.",
      "tuberculose": "Pou tuberculose prévenir, wé éviter contact long avec malade, wé garder bon air.",
      "nutrition": "Manger sain yé fruits, légumes, céréales nka protéines. Wé éviter manger transformé.",
      "hypertension": "Pou tension contrôler, wé réduire sel, wé faire sport souvent nka wé prendre médicaments.",
      default: "Mi né comprendi pas votre question. Wé yé médecin pou diagnostic précis.",
    },
  };

  const questionLower = question.toLowerCase();
  const key = questionLower.includes("paludisme") ? "symptômes du paludisme"
    : questionLower.includes("diabète") ? "gérer le diabète"
    : questionLower.includes("typhoïde") ? "fièvre typhoïde"
    : questionLower.includes("vih") ? "vih"
    : questionLower.includes("tuberculose") ? "tuberculose"
    : questionLower.includes("nutrition") || questionLower.includes("alimentation") ? "nutrition"
    : questionLower.includes("hypertension") || questionLower.includes("tension") ? "hypertension"
    : "default";
  
  return responses[lang][key];
};

interface ForumQuestion {
  id: number;
  questionFr: string;
  questionMo: string;
  reponseFr: string;
  reponseMo: string;
  auteur: string;
  date: string;
  category?: string;
  likes?: number;
  isVerified?: boolean;
  userId: string;
}

const ForumScreen = () => {
  const router = useRouter();
  const [selectedLang, setSelectedLang] = useState<"fr" | "mo">("fr");
  const [newQuestion, setNewQuestion] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [questions, setQuestions] = useState<ForumQuestion[]>(initialQuestions);
  const [filteredQuestions, setFilteredQuestions] = useState<ForumQuestion[]>(initialQuestions);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'all' | 'myQuestions'>('all');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-50));
  const [likedQuestions, setLikedQuestions] = useState<number[]>([]);
  const [userId, setUserId] = useState<string>('');

  // Générer ou charger un userId unique
  useEffect(() => {
    const loadUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          setUserId(storedUserId);
        } else {
          const newUserId = `user_${Date.now()}`;
          await AsyncStorage.setItem("userId", newUserId);
          setUserId(newUserId);
        }
      } catch (e) {
        console.log("Erreur de chargement userId:", e);
      }
    };
    loadUserId();
  }, []);

  // Charger les questions et les likes depuis AsyncStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        const [storedQuestions, storedLikes] = await Promise.all([
          AsyncStorage.getItem("forumQuestions"),
          AsyncStorage.getItem("likedQuestions")
        ]);
        
        if (storedQuestions) {
          const parsedQuestions = JSON.parse(storedQuestions);
          setQuestions(parsedQuestions);
          setFilteredQuestions(parsedQuestions);
        }
        
        if (storedLikes) {
          setLikedQuestions(JSON.parse(storedLikes));
        }
      } catch (e) {
        console.log("Erreur de chargement AsyncStorage:", e);
        setMessage("Erreur lors du chargement des données.");
      }
    };
    loadData();
  }, []);

  // Débouncer pour la recherche
  const debounce = (func: (...args: any[]) => void, wait: number) => {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Filtrer les questions par catégorie, recherche et mode
  const filterQuestions = useCallback((query: string, category: string, mode: 'all' | 'myQuestions') => {
    let filtered = questions;
    
    if (mode === 'myQuestions' && userId) {
      filtered = filtered.filter(q => q.userId === userId);
    }
    
    if (category !== 'all') {
      filtered = filtered.filter(q => {
        const cat = q.category?.toLowerCase() || '';
        return cat.includes(category) || 
               (category === 'infectious' && cat.includes('infectieuses')) ||
               (category === 'chronic' && cat.includes('chroniques')) ||
               (category === 'prevention' && cat.includes('prévention')) ||
               (category === 'nutrition' && cat.includes('nutrition'));
      });
    }
    
    if (query.trim()) {
      const queryLower = query.toLowerCase();
      filtered = filtered.filter(q => 
        q.questionFr.toLowerCase().includes(queryLower) ||
        q.questionMo.toLowerCase().includes(queryLower) ||
        q.reponseFr.toLowerCase().includes(queryLower) ||
        q.reponseMo.toLowerCase().includes(queryLower)
      );
    }
    
    setFilteredQuestions(filtered);
  }, [questions, userId]);

  const debouncedFilter = useCallback(debounce((query: string) => {
    filterQuestions(query, selectedCategory, viewMode);
  }, 300), [filterQuestions, selectedCategory, viewMode]);

  useEffect(() => {
    debouncedFilter(searchQuery);
  }, [searchQuery, selectedCategory, viewMode, debouncedFilter]);

  // Sauvegarder les données
  const saveData = async (newQuestions: ForumQuestion[], newLikes?: number[]) => {
    try {
      await AsyncStorage.setItem("forumQuestions", JSON.stringify(newQuestions));
      if (newLikes) {
        await AsyncStorage.setItem("likedQuestions", JSON.stringify(newLikes));
      }
    } catch (e) {
      console.log("Erreur de sauvegarde AsyncStorage:", e);
    }
  };

  // Animation d'entrée
  const animateEntry = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(-50);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();
  };

  // Animation pour les likes
  const animateLike = (id: number) => {
    const scaleAnim = new Animated.Value(1);
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();
    return scaleAnim;
  };

  // Gérer les likes
  const handleLike = (questionId: number) => {
    const updatedQuestions = questions.map(q => {
      if (q.id === questionId) {
        const isLiked = likedQuestions.includes(questionId);
        return {
          ...q,
          likes: (q.likes || 0) + (isLiked ? -1 : 1)
        };
      }
      return q;
    });
    
    const updatedLikes = likedQuestions.includes(questionId)
      ? likedQuestions.filter(id => id !== questionId)
      : [...likedQuestions, questionId];
    
    setQuestions(updatedQuestions);
    setLikedQuestions(updatedLikes);
    saveData(updatedQuestions, updatedLikes);
    animateLike(questionId);
  };

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setMessage("Données mises à jour !");
      setTimeout(() => setMessage(""), 2000);
    }, 1000);
  };

  // Soumettre une question
  const submitQuestion = async () => {
    if (!newQuestion.trim()) {
      Alert.alert("Erreur", "Veuillez entrer une question valide.");
      return;
    }

    setLoading(true);
    setMessage("L'IA analyse votre question...");
    
    try {
      const aiResponse = simulateAIResponse(newQuestion, selectedLang);
      
      const newQ: ForumQuestion = {
        id: Date.now(),
        questionFr: selectedLang === "fr" ? newQuestion : "",
        questionMo: selectedLang === "mo" ? newQuestion : "",
        reponseFr: selectedLang === "fr" ? aiResponse : simulateAIResponse(newQuestion, "fr"),
        reponseMo: selectedLang === "mo" ? aiResponse : simulateAIResponse(newQuestion, "mo"),
        auteur: isAnonymous ? "Anonyme" : "Utilisateur",
        date: new Date().toISOString().split("T")[0],
        category: "Général",
        likes: 0,
        isVerified: false,
        userId: userId,
      };

      const updatedQuestions = [newQ, ...questions];
      setQuestions(updatedQuestions);
      saveData(updatedQuestions);
      setMessage("✅ Réponse générée avec succès !");
      setNewQuestion("");
      animateEntry();
      
      setTimeout(() => setMessage(""), 3000);
    } catch (e) {
      Alert.alert("Erreur", "Erreur lors de la génération de la réponse.");
    } finally {
      setLoading(false);
    }
  };

  // Supprimer une question
  const deleteQuestion = (questionId: number) => {
    Alert.alert(
      "Confirmer la suppression",
      "Êtes-vous sûr de vouloir supprimer cette question ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            const updatedQuestions = questions.filter(q => q.id !== questionId);
            setQuestions(updatedQuestions);
            saveData(updatedQuestions);
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* En-tête avec gradient */}
      <View style={styles.header}>
        <View style={styles.headerGradient}>
          <Text style={styles.headerTitle}>🏥 Forum Santé</Text>
          <Text style={styles.headerSubtitle}>
            Votre assistant santé intelligent
          </Text>
          <Text style={styles.disclaimer}>
            ⚠️ Consultez toujours un médecin pour un diagnostic précis
          </Text>
        </View>
      </View>

      {/* Indicateurs de statut */}
      {message && (
        <Animated.View style={[styles.messageContainer, { opacity: fadeAnim }]}>
          <Text style={styles.messageText}>{message}</Text>
        </Animated.View>
      )}

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1A3C34" />
          <Text style={styles.loadingText}>Intelligence artificielle en action...</Text>
        </View>
      )}

      {/* Sélecteur de langue amélioré */}
      <View style={styles.languageSelector}>
        <TouchableOpacity
          style={[styles.languageButton, selectedLang === "fr" && styles.languageButtonActive]}
          onPress={() => setSelectedLang("fr")}
          accessibilityLabel="Sélectionner la langue française"
          accessibilityRole="button"
        >
          <Text style={[styles.languageText, selectedLang === "fr" && styles.languageTextActive]}>
            🇫🇷 Français
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.languageButton, selectedLang === "mo" && styles.languageButtonActive]}
          onPress={() => setSelectedLang("mo")}
          accessibilityLabel="Sélectionner la langue mooré"
          accessibilityRole="button"
        >
          <Text style={[styles.languageText, selectedLang === "mo" && styles.languageTextActive]}>
            🇧🇫 Mooré
          </Text>
        </TouchableOpacity>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une question..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          accessibilityLabel="Rechercher des questions"
          accessibilityRole="search"
        />
        {searchQuery && (
          <TouchableOpacity 
            onPress={() => setSearchQuery('')}
            accessibilityLabel="Effacer la recherche"
            accessibilityRole="button"
          >
            <Feather name="x" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Catégories */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.categoriesContainer}
      >
        {healthCategories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.categoryButtonActive,
              { borderColor: category.color }
            ]}
            onPress={() => setSelectedCategory(category.id)}
            accessibilityLabel={`Filtrer par ${category.name}`}
            accessibilityRole="button"
          >
            <Feather 
              home={category.icon} 
              size={16} 
              color={selectedCategory === category.id ? '#fff' : category.color} 
            />
            <Text style={[
              styles.categoryText,
              selectedCategory === category.id && styles.categoryTextActive
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sélecteur de mode (Toutes / Mes Questions) */}
      <View style={styles.viewModeSelector}>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === "all" && styles.viewModeButtonActive]}
          onPress={() => setViewMode("all")}
          accessibilityLabel="Afficher toutes les questions"
          accessibilityRole="button"
        >
          <Text style={[styles.viewModeText, viewMode === "all" && styles.viewModeTextActive]}>
            Toutes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === "myQuestions" && styles.viewModeButtonActive]}
          onPress={() => setViewMode("myQuestions")}
          accessibilityLabel="Afficher mes questions"
          accessibilityRole="button"
        >
          <Text style={[styles.viewModeText, viewMode === "myQuestions" && styles.viewModeTextActive]}>
            Mes Questions
          </Text>
        </TouchableOpacity>
      </View>

      {/* Formulaire pour poser une question */}
      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>💬 Nouvelle Question</Text>
        <TextInput
          style={styles.input}
          placeholder={selectedLang === "fr" 
            ? "Ex: Comment prévenir la fièvre typhoïde ?" 
            : "Ex: Fièvre typhoïde yé ka prévenir comment ?"
          }
          value={newQuestion}
          onChangeText={setNewQuestion}
          multiline
          maxLength={500}
          accessibilityLabel="Saisir une nouvelle question"
          accessibilityRole="text"
        />
        <Text style={styles.characterCount}>
          {newQuestion.length}/500 caractères
        </Text>
        
        <View style={styles.anonymousContainer}>
          <TouchableOpacity
            style={[styles.checkbox, isAnonymous && styles.checkboxActive]}
            onPress={() => setIsAnonymous(!isAnonymous)}
            accessibilityLabel="Publier anonymement"
            accessibilityRole="checkbox"
          >
            {isAnonymous && <Feather name="check" size={16} color="#FFFFFF" />}
          </TouchableOpacity>
          <Text style={styles.anonymousText}>🎭 Publier anonymement</Text>
        </View>
        
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={submitQuestion}
          disabled={loading}
          accessibilityLabel="Envoyer la question"
          accessibilityRole="button"
        >
          <Feather name="send" size={20} color="#FFFFFF" />
          <Text style={styles.submitButtonText}>Envoyer ma question</Text>
        </TouchableOpacity>
      </View>

      {/* Liste des questions/réponses */}
      <ScrollView 
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.sectionTitle}>
          📋 {viewMode === 'myQuestions' ? 'Mes Questions' : 'Questions & Réponses'} ({filteredQuestions.length})
        </Text>
        
        {filteredQuestions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="help-circle" size={50} color="#ccc" />
            <Text style={styles.noQuestionsText}>
              {searchQuery ? "Aucun résultat trouvé" : viewMode === 'myQuestions' ? "Vous n'avez posé aucune question" : "Aucune question pour le moment"}
            </Text>
            <Text style={styles.noQuestionsSubtext}>
              {viewMode === 'myQuestions' ? "Posez une question pour commencer !" : "Soyez le premier à poser une question !"}
            </Text>
          </View>
        ) : (
          filteredQuestions.map((q: ForumQuestion) => (
            <Animated.View
              key={q.id.toString()}
              style={[
                styles.questionCard,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.userInfo}>
                  <View style={styles.avatarContainer}>
                    <Feather 
                      name={q.isVerified ? "user-check" : "user"} 
                      size={20} 
                      color={q.isVerified ? "#27AE60" : "#1A3C34"} 
                    />
                  </View>
                  <View>
                    <Text style={styles.authorName}>
                      {q.auteur} {q.isVerified && "✅"}
                    </Text>
                    <Text style={styles.questionMeta}>
                      {q.date} • {q.category || "Général"}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => deleteQuestion(q.id)}
                  accessibilityLabel="Options de la question"
                  accessibilityRole="button"
                >
                  <Feather name="more-vertical" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              <Text style={styles.questionTitle}>
                {selectedLang === "fr" ? q.questionFr : q.questionMo}
              </Text>

              <View style={styles.responseContainer}>
                <View style={styles.aiHeader}>
                  <Feather name="cpu" size={18} color="#1A3C34" />
                  <Text style={styles.aiLabel}>Assistant IA</Text>
                </View>
                <Text style={styles.reponseText}>
                  {selectedLang === "fr" ? q.reponseFr : q.reponseMo}
                </Text>
              </View>

              <View style={styles.cardFooter}>
                <TouchableOpacity 
                  style={styles.likeButton}
                  onPress={() => handleLike(q.id)}
                  accessibilityLabel={likedQuestions.includes(q.id) ? "Retirer le like" : "Liker la question"}
                  accessibilityRole="button"
                >
                  <Animated.View style={{ transform: [{ scale: animateLike(q.id) }] }}>
                    <Feather 
                      name="heart" 
                      size={18} 
                      color={likedQuestions.includes(q.id) ? "#E74C3C" : "#666"} 
                      fill={likedQuestions.includes(q.id) ? "#E74C3C" : "none"}
                    />
                  </Animated.View>
                  <Text style={[
                    styles.likeCount,
                    likedQuestions.includes(q.id) && styles.likeCountActive
                  ]}>
                    {q.likes || 0}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.shareButton}
                  accessibilityLabel="Partager la question"
                  accessibilityRole="button"
                >
                  <Feather name="share-2" size={18} color="#666" />
                  <Text style={styles.shareText}>Partager</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles complétés
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    marginBottom: 20,
  },
  headerGradient: {
    backgroundColor: "#1A3C34",
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#B8E6B8",
    textAlign: "center",
    marginTop: 5,
  },
  disclaimer: {
    fontSize: 12,
    color: "#FFD700",
    textAlign: "center",
    marginTop: 8,
  },
  messageContainer: {
    backgroundColor: "#E8F5E8",
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#27AE60",
  },
  messageText: {
    fontSize: 14,
    color: "#27AE60",
    textAlign: "center",
    fontWeight: "500",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 15,
    backgroundColor: "#FFF",
    borderRadius: 15,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  loadingText: {
    fontSize: 14,
    color: "#1A3C34",
    marginLeft: 10,
    fontWeight: "500",
  },
  languageSelector: {
    flexDirection: "row",
    justifyContent: "center",
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 4,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  languageButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  languageButtonActive: {
    backgroundColor: "#1A3C34",
  },
  languageText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
  languageTextActive: {
    color: "#FFFFFF",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 15,
    backgroundColor: "#FFF",
    borderRadius: 15,
    paddingHorizontal: 15,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: "#333",
  },
  categoriesContainer: {
    paddingLeft: 20,
    marginBottom: 20,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    backgroundColor: "#FFF",
  },
  categoryButtonActive: {
    backgroundColor: "#1A3C34",
  },
  categoryText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  categoryTextActive: {
    color: "#FFF",
  },
  viewModeSelector: {
    flexDirection: "row",
    justifyContent: "center",
    marginHorizontal: 20,
    marginBottom: 15,
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 4,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  viewModeButtonActive: {
    backgroundColor: "#1A3C34",
  },
  viewModeText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
  viewModeTextActive: {
    color: "#FFFFFF",
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A3C34",
    marginBottom: 15,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: "#333",
    minHeight: 80,
    textAlignVertical: "top",
  },
  characterCount: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
    marginTop: 5,
    marginBottom: 15,
  },
  anonymousContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#1A3C34",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  checkboxActive: {
    backgroundColor: "#1A3C34",
  },
  anonymousText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1A3C34",
    borderRadius: 12,
    padding: 15,
  },
  submitButtonDisabled: {
    backgroundColor: "#4A4A4A",
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 8,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A3C34",
    marginVertical: 15,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  noQuestionsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
  },
  noQuestionsSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 5,
  },
  questionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  authorName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A3C34",
  },
  questionMeta: {
    fontSize: 12,
    color: "#999",
  },
  deleteButton: {
    padding: 5,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A3C34",
    marginBottom: 10,
  },
  responseContainer: {
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  aiLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A3C34",
    marginLeft: 8,
  },
  reponseText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 22,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  likeButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  likeCount: {
    fontSize: 14,
    color: "#666",
    marginLeft: 5,
  },
  likeCountActive: {
    color: "#E74C3C",
    fontWeight: "600",
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  shareText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 5,
  },
});

export default ForumScreen;