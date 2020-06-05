import React, {useState, useEffect} from 'react';
import { StyleSheet, ImageBackground, View, Image, Text, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import RNPickerSelect from 'react-native-picker-select';
import axios from 'axios';

interface IBGEUFResponse {
  sigla: string;
}
interface IBGECityResponse {
  nome: string;
}


const Home: React.FC = () => {
  const [ufs, setUfs] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [uf, setUf] = useState('');
  const [city, setCity] = useState('');

  const navigation = useNavigation();

  useEffect(()=>{
    axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(res => {
      const ufInitials = res.data.map(uf => uf.sigla);
      setUfs(ufInitials.sort((a, b) => a.localeCompare(b)));
    })
  }, [])

  useEffect(()=>{
    axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`).then(res => {
      const cityName = res.data.map(city => city.nome);  
      setCities(cityName.sort((a, b) => a.localeCompare(b)));
    })
  }, [uf])

  function handleNavigateToPoints(){
    navigation.navigate('Points', {uf, city});
  }
  return (
    <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ImageBackground 
      source={require('../../assets/home-background.png')} 
      style={styles.container}
      imageStyle={{ width: 274, height: 368}}
    >
      <View style={styles.main}>
        <Image source={require('../../assets/logo.png')} />
        <View>
          <Text style={styles.title}>Seu marketplace de coleta de resíduos</Text>
          <Text style={styles.description}>ajudamos pessoas a encontrarem pontos de coleta de forma eficiente</Text>
        </View>
      </View>

      <View style={styles.footer}>
      <RNPickerSelect
        placeholder={ {label:'Selecione a UF', value: null, color: '#333'}}
        useNativeAndroidPickerStyle = {false}
        style={pickerSelectStyles}
        onValueChange={(value) => setUf(value)}
        items={ufs.map((uf) => {
          return {
            label: uf,
            value: uf
          }
        })
        }
      />
      <RNPickerSelect
        placeholder={ {label:'Selecione a cidade', value: null, color: '#333'}}
        useNativeAndroidPickerStyle = {false}
        style={pickerSelectStyles}
        onValueChange={(value) => setCity(value)}
        items={cities.map((city) => {
          return {
            label: city,
            value: city
          }
        })
        }
      />
        <RectButton style={styles.button} onPress={handleNavigateToPoints}>
            <View style={styles.buttonIcon}>
              <Feather name="arrow-right" color="#fff" size={24} />
            </View>
            <Text style={styles.buttonText}>Entrar</Text>
          </RectButton>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
  },

  main: {
    flex: 1,
    justifyContent: 'center',
  },

  title: {
    color: '#322153',
    fontSize: 32,
    fontFamily: 'Ubuntu_700Bold',
    maxWidth: 260,
    marginTop: 64,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 16,
    fontFamily: 'Roboto_400Regular',
    maxWidth: 260,
    lineHeight: 24,
  },

  footer: {},

  select: {},

  input: {
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16,
  },

  button: {
    backgroundColor: '#34CB79',
    height: 60,
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    marginTop: 8,
  },

  buttonIcon: {
    height: 60,
    width: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },

  buttonText: {
    flex: 1,
    justifyContent: 'center',
    textAlign: 'center',
    color: '#FFF',
    fontFamily: 'Roboto_500Medium',
    fontSize: 16,
  }
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16,
    paddingVertical: 8,
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16,
    paddingVertical: 8,
    paddingRight: 30, // to ensure the text is never behind the icon
  },
});