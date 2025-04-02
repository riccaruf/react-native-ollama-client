import React, { useState, useEffect } from "react";
import { View, ScrollView, Image, Button, Alert } from "react-native";
import { Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator,Platform } from 'react-native';

import { launchImageLibrary, Asset } from "react-native-image-picker";

import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';

import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

import { Buffer } from "buffer";
import RNBlobUtil from "react-native-blob-util";


export default function ImageUploader(){

  const [images, setImages] = useState<Asset[]>([]);
  const IP_ADDRESS = "192.168.1.54:3000"
  const [selectedValue, setSelectedValue] = useState('llama3.2:1b');
  var [options, setOptions] = useState<{ id: string; name: string }[]>([]); 
  var [loading, setLoading] = useState(true);
  
  var [parsedData, setParsedData] = useState({
    carbs: '',
    sugars: '',
    fibers: '',
    proteins: '',
    fats: '',
    portionSize: '',
    glycemicIndex: '',
    ingredients: [],
    confidence: '',
    mealName: ''
  });

  useEffect (() => {
      console.log("- use effect function");
      
      const fetchData  = async ()=>{
        try{
          console.log("- invoke..");
          setLoading(true);
          const data = await fetch('http://'+IP_ADDRESS+'/api/items', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          })
          const opt = await data.json();
          setLoading(false);
          setOptions(opt);
          options = opt;
        }catch(error){
          console.error("Errore nel fetch", error);
        }
      }
  
      fetchData();
    },[]);  


    const pickImage = async () => {
      try {
        // Controllo della piattaforma
        if (Platform.OS === "android" || Platform.OS === "ios") {
          // Richiesta di permesso su dispositivi mobili
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== "granted") {
            Alert.alert("Permesso negato", "È necessario il permesso per accedere alla galleria.");
            return;
          }
        }
  
        // Selezione dell'immagine (funziona su tutte le piattaforme)
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsMultipleSelection: Platform.OS !== "web", // Multipla solo su mobile
          quality: 1,
        });
  
        if (!result.canceled) {
          setImages(result.assets || [result]);
        }
      } catch (error) {
        console.error("Errore durante la selezione delle immagini:", error);
      }
    };

  /*
  const nutritionalRegex = {
    carbs: /Carbohydrates:\s*(\d+-\d+\s*grams|\d+\s*grams)/,
    sugars: /Sugar:\s*(\d+-\d+\s*grams|\d+\s*grams)/,
    fibers: /Fiber:\s*(\d+-\d+\s*grams|\d+\s*grams)/,
    proteins: /Protein:\s*(\d+-\d+\s*grams|\d+\s*grams)/,
    fats: /Fat:\s*(\d+-\d+\s*grams|\d+\s*grams)/,
    glycemicIndex: /glycemic\s*index\s*of\s*the\s*meal\s*would\s*be\s*moderate,\s*likely\s*in\s*the\s*range\s*of\s*(\d+\s*to\s*\d+|\d+)/,
    mealName: /Name\s*of\s*the\s*meal\s*\(in\s*Italian\):\s*"([^"]+)"/,
    ingredients: /Main\s*ingredients\s*\(in\s*Italian\):\s*([^:]+)(?:\n|$)/,
    confidence: /confidence\s*of\s*the\s*correctness\s*of\s*this\s*response\s*is\s*(LOW|MEDIUM|HIGH)/,
  };
  */

  const nutritionalRegex = {
    carbs: /Carbohydrates:\s*([^;]+);/i,
    proteins: /Proteins:\s*([^;]+);/i,
    fats: /Fats:\s*([^;]+);/i,
    sugars: /Sugars:\s*([^;]+);/i,
    fibers: /Fibers:\s*([^;]+);/i,
    glycemicIndex: /GlycemicIndex:\s*([^;]+);/i,
    ingredients: /Ingredients:\s*([^\.]+)\./i,
    mealName:/MealName:\s*([^;]+);/i,
    confidence:/Confidence:\s*([^;]+);/i,
    portionSize:/PortionSize:\s*([^;]+);/i
    

  };

  const parseNutritionalInfo = (response:any) => {
    
    const data = {
      carbs: '',
      sugars: '',
      fibers: '',
      proteins: '',
      fats: '',
      portionSize: '',
      glycemicIndex: '',
      ingredients: '',
      confidence: '',
      mealName: '',
    };

    console.info("- response :",response);

  // Estrazione dei dati usando le regex
    data.carbs = response.match(nutritionalRegex.carbs)?.[1]||'Not found';
    data.sugars = response.match(nutritionalRegex.sugars)?.[1]||'Not found';
    data.fibers = response.match(nutritionalRegex.fibers)?.[1]||'Not found';
    data.proteins = response.match(nutritionalRegex.proteins)?.[1]||'Not found';
    data.fats = response.match(nutritionalRegex.fats)?.[1]||'Not found';
    data.glycemicIndex = response.match(nutritionalRegex.glycemicIndex)?.[1]||'Not found';
    data.ingredients = response.match(nutritionalRegex.ingredients)?.[1]||'Not found';
    data.mealName = response.match(nutritionalRegex.mealName)?.[1] || '';
    data.confidence = response.match(nutritionalRegex.confidence)?.[1] || 'LOW';
    data.portionSize = response.match(nutritionalRegex.portionSize)?.[1] || 'LOW';
    

  // Restituzione dei dati
    return {
      carbs: data.carbs ,
      sugars: data.sugars,
      fibers: data.fibers ,
      proteins: data.proteins ,
      fats: data.fats,
      glycemicIndex: data.glycemicIndex ,
      ingredients: data.ingredients,
      mealName: data.mealName,
      confidence: data.confidence,
      portionSize: data.portionSize
      };
  };


  
  const uploadImages = async () => {
    try {
      setLoading(true);
  
      const imageUri = images[0]?.uri;
      if (!imageUri) {
        console.error("Nessuna immagine selezionata.");
        setLoading(false);
        return;
      }
  
      console.log("- Immagine selezionata:", imageUri);
  
      const formData = new FormData();
  
      // Gestione Web
      if (Platform.OS === "web") {
        try {
          const response = await fetch(imageUri);
          const blob = await response.blob();
          formData.append("images", blob, "image.jpg");
        } catch (error) {
          console.error("Errore durante la creazione del blob (web):", error);
          setLoading(false);
          return;
        }
      } else {
        // Gestione Mobile (Android/iOS)
        try {
          const fileUri = imageUri.startsWith("file://") ? imageUri : `file://${imageUri}`;
          const fileData = await FileSystem.readAsStringAsync(fileUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
  
          // Crea il file da base64 senza passare per ArrayBuffer
          const base64Data = `data:image/jpeg;base64,${fileData}`;
          
          formData.append("images", {
            uri: base64Data,
            type: "image/jpeg",
            name: "image.jpg",
          });
        } catch (error) {
          console.error("Errore durante la lettura dell'immagine (mobile):", error);
          setLoading(false);
          return;
        }
      }
  
      // Aggiungi il modello selezionato al formData
      formData.append("model", JSON.stringify({ model: selectedValue }));
  
      // Invia la richiesta al server
      const res = await fetch(`http://${IP_ADDRESS}/api/uploadimage`, {
        method: "POST",
        body: formData,
      });
  
      if (!res.ok) {
        throw new Error(`Errore di caricamento: ${res.status} ${res.statusText}`);
      }
  
      const data = await res.text();
      const parsedData = parseNutritionalInfo(data);
  
      console.info("- Risposta dal server:", parsedData);
      setParsedData(parsedData);
    } catch (error) {
      console.error("Errore durante l'upload dell'immagine:", error);
    } finally {
      setLoading(false);
    }
  };
  

  
  return (
    <LinearGradient colors={['#25292e', '#25292e']} style={styles.container}>
       {/* Header */}
       <View style={styles.header}>
          <Text style={styles.headerText}>Analizzatore</Text>
       </View>
       <View style={{ padding: 20 }}>
           
          <Picker
            selectedValue={selectedValue}
            onValueChange={(itemValue) => setSelectedValue(itemValue)}
          >
            <Picker.Item label="Seleziona un modello Ollama:" value={null} />
            {options.map((item) => (
              <Picker.Item key={item.id} label={item.name} value={item.id} />
            ))}
          </Picker>
           
       </View>

      <View style={{ flex: 1, padding: 20 }}>
        <Button title="Seleziona Immagini" onPress={pickImage} />
        <View style={{ marginVertical: 10, alignSelf: "center" }}>
          {images.map((image, index) => (
            <Image
              key={index}
              source={{ uri: image.uri }}
              style={{ width: 300, height: 200, marginRight: 10 }}
            />
          ))}
        </View>
        <Button title="Analizza" onPress={uploadImages} />
        <View style={styles.content}>
            
          <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>{parsedData.mealName}</Text>
            
            <Text style={styles.sectionTitle}>Nutritional Information</Text>
            <View style={styles.nutrientContainer}>
              <Text style={styles.nutrientLabel}>Carbohydrates:</Text>
              <Text style={styles.nutrientValue}>{parsedData.carbs} </Text>
            </View>
            <View style={styles.nutrientContainer}>
              <Text style={styles.nutrientLabel}>Sugars:</Text>
              <Text style={styles.nutrientValue}>{parsedData.sugars} </Text>
            </View>
            <View style={styles.nutrientContainer}>
              <Text style={styles.nutrientLabel}>Fibers:</Text>
              <Text style={styles.nutrientValue}>{parsedData.fibers} </Text>
            </View>
            <View style={styles.nutrientContainer}>
              <Text style={styles.nutrientLabel}>Proteins:</Text>
              <Text style={styles.nutrientValue}>{parsedData.proteins} </Text>
            </View>
            <View style={styles.nutrientContainer}>
              <Text style={styles.nutrientLabel}>Fats:</Text>
              <Text style={styles.nutrientValue}>{parsedData.fats} </Text>
            </View>
            
            <Text style={styles.sectionTitle}>Additional Details</Text>
            <View style={styles.detailContainer}>
              <Text style={styles.detailLabel}>Portion Size:</Text>
              <Text style={styles.detailValue}>{parsedData.portionSize} </Text>
            </View>
            <View style={styles.glicemicContainer}>
              <Text style={styles.glicemicLabel}>Glycemic Index:</Text>
              <Text style={styles.glicemicValue}>{parsedData.glycemicIndex}</Text>
            </View>
            
            <Text style={styles.sectionTitle}>Main Ingredients</Text>
            <View style={styles.nutrientContainer}>
              <Text style={styles.ingredients}>{parsedData.ingredients}</Text>
            </View>

            <Text style={styles.sectionTitle}>Confidence Level</Text>
            <View style={styles.nutrientContainer}>
              <Text style={styles.confidence}>{parsedData.confidence}</Text>
            </View>
          </ScrollView>
        </View>

      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'stretch',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 16,
    minHeight: 200
  },
  chatContainer: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  chatText: {
    fontSize: 16,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 50,
    paddingHorizontal: 16,
  },
  textInput: {
    flex: 1,
    height: 40,
    color: '#333',
  },
  sendButton: {
    backgroundColor: '#3b5998',
    padding: 10,
    borderRadius: 25,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#fff',
    backgroundColor: '#3b5998'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    justifyContent: 'space-evenly',
    marginVertical: 5,
    color: '#fff',
    textAlign: "center",
    backgroundColor: '#333'
  },
  nutrientContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: 2,
    color: '#fff',
    fontSize: 20
  },
  glicemicContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: 2,
    color: '#fff',
  },
  nutrientLabel: {
    fontWeight: '600',
    color: '#fff',
    fontSize: 20
  },
  nutrientValue: {
    fontStyle: 'italic',
    color: 'yellow',
    fontSize: 20
  },
  detailContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: 2,
    color: '#fff',
  },
  detailLabel: {
    fontWeight: '600',
    color: '#fff',
    fontSize: 20
  },
  detailValue: {
    fontStyle: 'italic',
    color: 'yellow',
    fontSize: 20
  },
  glicemicLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  glicemicValue: {
    fontStyle: 'italic',
    color: 'green',
    fontSize: 30
  },
  ingredients: {
    fontStyle: 'italic',
    fontWeight: 'bold',
    color: 'yellow'
  },
  confidence: {
    fontStyle: 'italic',
    fontWeight: 'bold',
    color: 'green',
  }
});


