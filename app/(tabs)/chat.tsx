import React, { useState,useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView,ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

export default function ChatScreen() {
 
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [selectedValue, setSelectedValue] = useState('llama3.2:1b');
  
  const IP_ADDRESS = "192.168.9.77:3000"
  
  var [options, setOptions] = useState<{ id: string; name: string }[]>([]);
  var [loading, setLoading] = useState(true);


    
  // Funzione che invia il messaggio al backend e recupera la risposta
  const handleSend = async () => {
    if (!message.trim()) return; // Evita invii vuoti
    
    try {
      setLoading(true);
      const res = await fetch('http://'+IP_ADDRESS+'/api/fitness-support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message:message, model: selectedValue})
      });
      const data = await res.json();
      setLoading(false);
      setResponse(data.reply);
     
    } catch (error) {
      console.error('Errore durante la chiamata al backend:', error);
      setResponse("Si è verificato un errore. Riprova.");
    }
    setMessage('');
  };
  
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
   
  
  return (
    <LinearGradient colors={['#25292e', '#25292e']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
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
          

        {/* Contenuto principale */}
        <View style={styles.content}>
          {/* Area messaggi / risposta */}
          <ScrollView style={styles.chatContainer}>
            {loading ? (
              <ActivityIndicator size="large" color="#007bff" />
            ) : (
            <Text style={styles.chatText}>
              {response || "Parla con il nostro assistente per consigli fitness."+selectedValue}
            </Text>
            )}
          </ScrollView>

          {/* Input per il messaggio */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Scrivi il tuo messaggio..."
              placeholderTextColor="#666"
              value={message}
              onChangeText={setMessage}
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
              <Ionicons name="send" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

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
