import React, { useState, useEffect } from "react";
import { View, ScrollView, Image, Button, Alert } from "react-native";
import { Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';

import { launchImageLibrary, Asset } from "react-native-image-picker";

import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';


export default function ImageUploader(){

  const [images, setImages] = useState<Asset[]>([]);
  const IP_ADDRESS = "192.168.1.54:3000"
  const [selectedValue, setSelectedValue] = useState('llama3.2:1b');
  var [options, setOptions] = useState<{ id: string; name: string }[]>([]); 
  var [loading, setLoading] = useState(true);
  const [response, setResponse] = useState('');


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


  const pickImage = () => {
    launchImageLibrary({ mediaType: "photo", selectionLimit: 0}, (response) => {
      if (response.didCancel) return;
      if (response.errorMessage) {
        Alert.alert("Errore", response.errorMessage);
        return;
      }
      if (response.assets) {
        setImages([...images, ...response.assets]);
      }
    });
  };

  const uploadImages = async () => {
    
    const formData = new FormData();
    const imageUri = images[0].uri;
    
  
    try {
      const response1 = await fetch(imageUri);
      const blob = await response1.blob();

      console.info("- blob:", blob);
      formData.append("images", blob, "image.jpg");
      formData.append("model",JSON.stringify({ model: selectedValue}))
      const response = await fetch("http://"+IP_ADDRESS+"/api/uploadimage", {
        method: "POST",
        body: formData,
      });
  
      if (response.ok) {
        Alert.alert("Successo", "Immagini caricate con successo!");
      } else {
        Alert.alert("Errore", "Caricamento fallito");
      }
    } catch (error) {
      Alert.alert("Errore", "Errore di rete");
    }
  };
  
  return (
    <LinearGradient colors={['#25292e', '#25292e']} style={styles.container}>
       {/* Header */}
       <View style={styles.header}>
          <Text style={styles.headerText}>DeepSeek Fitness</Text>
       </View>
       <View style={{ padding: 20 }}>
           
          <Picker
            selectedValue={selectedValue}
            onValueChange={(itemValue) => setSelectedValue(itemValue)}
          >
            <Picker.Item label="Seleziona un'opzione" value={null} />
            {options.map((item) => (
              <Picker.Item key={item.id} label={item.name} value={item.id} />
            ))}
          </Picker>
           
       </View>

      <View style={{ flex: 1, padding: 10 }}>
        <Button title="Seleziona Immagini" onPress={pickImage} />
        <ScrollView horizontal style={{ marginVertical: 10 }}>
          {images.map((image, index) => (
            <Image
              key={index}
              source={{ uri: image.uri }}
              style={{ width: 100, height: 100, marginRight: 10 }}
            />
          ))}
        </ScrollView>
        <Button title="Carica Immagini" onPress={uploadImages} />
        <View style={styles.content}>
            {/* Area messaggi / risposta */}
            <ScrollView style={styles.chatContainer}>
              {loading ? (
                <ActivityIndicator size="large" color="#007bff" />
              ) : (
              <Text style={styles.chatText}>
                {response || "Qui la descrizione dell'immagine caricata:"+selectedValue}
              </Text>
              )}
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
});


