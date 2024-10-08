import { Alert, Keyboard, TouchableWithoutFeedback, View, TouchableOpacity, Text, TextInput, Image } from 'react-native';
import { useEffect, useState } from 'react';

import { schemaZodEvento, IRegisterEvent } from "../../utils/ValidationSchemaZod";
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import { ErrorMessage } from '../ErrorMessage';

import { useNavigation, useRoute } from '@react-navigation/native';

import * as ImagePicker from 'expo-image-picker';
import {Calendar, LocaleConfig} from 'react-native-calendars';

import { Picker } from '@react-native-picker/picker';

import api from '../../services/api';

import { AntDesign } from '@expo/vector-icons';
import { styles } from './styles';



type Coords = {
    latitude: number,
    longitude: number,
}


export function FormCriarEvento() {


    const navigation = useNavigation();
    const route = useRoute();


    const { control, handleSubmit, formState: { errors }, setValue } = useForm<IRegisterEvent>({
        resolver: zodResolver(schemaZodEvento)
    });


    //Controla a image do evento:
    const [imagePath, setImagePath] = useState<string>();

    //Controla as datas selecionadas do react-native-calendars
    const [selected, setSelected] = useState('');

    //Controla a latitude e longitude do evento:
    const [position, setPosition] = useState<Coords>({ latitude: 0, longitude: 0 });

    //Controla a categoria do evento:
    const [categoria, setCategoria] = useState<string>('ads');




    useEffect(() => {
        if (route.params) {
          const { latitude, longitude } = route.params as Coords; //vai tratar o route.params como um tipo específico
          setPosition({latitude, longitude});
        }
    }, [route.params]);




    function setDateEvent(date:string) {
        setValue('data_hora', date);
        setSelected(date);
    }




    async function handleSelectImage() {
        // tenho acesso a galeria de fotos e não a câmera
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if(status !== 'granted'){
          alert('Eita, precisamos de acesso às suas fotos...');
          return;
        }
        let result = await ImagePicker.launchImageLibraryAsync({
          // permite ao usuario editar a imagem (crop), antes de subir o app
          allowsEditing: true,
          quality: 1,
          aspect: [5, 3],
          //quero apensas imagems e não vídeo tb
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
        });
        
        if(!result.canceled) { 
          setImagePath(result.assets[0].uri);
          console.log(imagePath);
        }
      }


    async function handleEventRegister(data: IRegisterEvent) {
        const config = {
            headers: { 'content-type': 'multipart/form-data' }
        }

        try {
            const dataForm = new FormData();

            dataForm.append('nome', data.nome);
            dataForm.append('descricao', data.descricao);
            dataForm.append('data_hora', data.data_hora);
            dataForm.append('urlsiteoficial', data.urlsiteoficial);

            if (categoria) {
                dataForm.append('categoria', categoria);
            }

            if(imagePath) {
                dataForm.append('image', {
                            name: `imagehash.jpg`,
                            type: 'image/jpg',
                            uri: imagePath,
                  } as any);
            }

            if(position.latitude !== 0 && position.longitude !== 0) {
                dataForm.append('latitude', position.latitude.toString());
                dataForm.append('longitude', position.longitude.toString());
            }

            console.log(dataForm);


            await api.post('/api/v1/evento/criar', dataForm, config)
            .then((r) => {
                if (r.status === 200) {
                    console.log("Evento criado com sucesso", r.status);
                    navigation.navigate('Home');
                    return;
                }
            })
            .catch((e) => {
                console.log("Não foi possível criar o evento", e);
                alert('Nome de Evento já existe!');
                return;
            });

        } catch (err) {
            console.log("Não foi possível criar o evento", err);
            console.log("Detalhes do erro:", err);
        
            alert('Verifique se a configuração em services está correta.');
            console.log("Verifique se a configuração em services está correta.");
            alert('Algum erro ocorreu');
            return;
        }
    }




    return (
        <View style={styles.telaCriarEvento}>
            <Text style={styles.titulo}>Criar novo evento</Text>
            <View style={styles.Container}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View>

                        {/* Botão para selecionar uma imagem */}
                        <View style={styles.eventImageContainer}>
                            <TouchableOpacity
                                style={styles.eventImage}
                                onPress={handleSelectImage}
                            >
                                {
                                    imagePath ?
                                        <Image source={{uri: imagePath, width: 270, height: 150}} />
                                    :
                                        <AntDesign name="pluscircleo" size={80} color="black" />
                                }
                            </TouchableOpacity>
                        </View>




                        {
                            !!errors.nome && <ErrorMessage description={errors.nome.message} />
                        }
                        <Controller
                            name='nome'
                            control={control}
                            render={({ field }) => (
                                <TextInput
                                    placeholder="Nome *"
                                    onBlur={field.onBlur}
                                    onChangeText={field.onChange}
                                    value={field.value}
                                    style={styles.input}
                                />
                            )}
                        />

                        {
                            !!errors.descricao && <ErrorMessage description={errors.descricao.message} />
                        }
                        <Controller
                            name='descricao'
                            control={control}
                            render={({ field }) => (
                                <TextInput
                                    placeholder="Descricao *"
                                    onBlur={field.onBlur}
                                    onChangeText={field.onChange}
                                    value={field.value}
                                    style={styles.input}
                                />
                            )}
                        />

                        


                        {
                            !!errors.urlsiteoficial && <ErrorMessage description={errors.urlsiteoficial.message} />
                        }
                        <Controller
                            name='urlsiteoficial'
                            control={control}
                            render={({ field }) => (
                                <TextInput
                                    placeholder="Url do site *"
                                    onBlur={field.onBlur}
                                    onChangeText={field.onChange}
                                    value={field.value}
                                    style={styles.input}
                                />
                            )}
                        />


                        
                        {/* Menu para selecionar uma categoria */}
                        <View style={styles.categoriaContainer}>
                            <Text>Selecione uma categoria:</Text>
                            <Picker
                                selectedValue={categoria}
                                onValueChange={(item) => setCategoria(item)}
                            >
                                <Picker.Item label="ADS" value="ads" />
                                <Picker.Item label="Matemática" value="matematica" />
                                <Picker.Item label="Engenharia Civil" value="engenharia-civil" />
                                <Picker.Item label="Controle e Automação" value="controle-automacao" />
                            </Picker>
                        </View>



                        {
                            !!errors.data_hora && <ErrorMessage description={errors.data_hora.message} />
                        }
                        <Controller
                            name='data_hora'
                            control={control}
                            render={({ field }) => (
                                <Calendar
                                    style={styles.calendar}
                                    onDayPress={(day: { dateString: string; }) => {
                                        setDateEvent(day.dateString);
                                    }}
                                    markedDates={{
                                        [selected]: {selected: true, marked: true, selectedColor: 'blue'}
                                      }}
                                />
                            )}
                        />




                        
                        {/* Views para lidar com a localização */}
                        <View style={styles.MapContainer}>
                            <TouchableOpacity
                                style={styles.mapButton}
                                onPress={() => navigation.navigate('SelectMapPosition', position )}
                            >
                                <Text style={styles.buttonText}>Mapa posiçao</Text>
                            </TouchableOpacity>
                            <View style={styles.MapContainer}>
                                {
                                    position.latitude !== 0 
                                    ?
                                        <Text>{position.latitude + " " + position.longitude}</Text>
                                    :
                                        <Text>Nenhuma localização selecionada</Text>
                                }
                            </View>
                        </View>


                        {/* Botao para confirmar a criação do evento */}
                        <View style={styles.ContainerCriar}>
                            <TouchableOpacity
                                style={styles.button}
                                onPress={handleSubmit(handleEventRegister)}
                            >
                                <Text style={styles.buttonText}>Finalizar</Text>
                            </TouchableOpacity>
                        </View>


                    </View>
                </TouchableWithoutFeedback>
            </View>
        </View>
    )
}