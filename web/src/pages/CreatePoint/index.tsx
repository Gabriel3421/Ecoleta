import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import './CreatePoint.css';
import logo from '../../assets/logo.svg';
import { Link, useHistory } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { Map, TileLayer, Marker } from 'react-leaflet'
import api from '../../services/api'
import axios from 'axios'
import Dropzone from '../../components/Dropzone'
import { LeafletMouseEvent } from 'leaflet'
import { FiCheckCircle } from 'react-icons/fi'

interface Item {
  id:number;
  title: string;
  image_url: string
}
interface IBGEUFResponse {
  sigla: string;
}
interface IBGECityResponse {
  nome: string;
}


const CreatePoint: React.FC = () => {
  const [items, setItems] = useState<Item[]>([])
  const [ufs, setUfs] = useState<string[]>([])
  const [overlay, setOverlay] = useState(false)
  const [selectUf, setSelectUf] = useState('0')
  const [selectCity, setSelectCity] = useState('0')
  const [cities, setCities] = useState<string[]>([])
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0,0])
  const [initialPosition, setInitialPosition] = useState<[number, number]>([0,0])
  const [formData, setFormData] = useState({
    name:'',
    email:'',
    whatsapp: '',
  })
  const [selectItems, setSelectItems] = useState<number[]>([])
  const [selectedFile, setSelectedFile] = useState<File>();

  const history = useHistory();

  useEffect(()=>{
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      setInitialPosition([latitude, longitude])
    })
  }, []);

  useEffect(()=>{
    api.get('items').then(res => {
      setItems(res.data);
    })
  }, [])
  useEffect(()=>{
    axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(res => {
      const ufInitials = res.data.map(uf => uf.sigla);  
      setUfs(ufInitials);
    })
  }, [])

  useEffect(()=>{
    axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectUf}/municipios`).then(res => {
      const cityName = res.data.map(city => city.nome);  
      setCities(cityName);
    })
  }, [selectUf])

  function handleSelectUf(event: ChangeEvent<HTMLSelectElement>){
    setSelectUf(event.target.value);
  }
  function handleSelectCity(event: ChangeEvent<HTMLSelectElement>){
    setSelectCity(event.target.value);
  }
  function handleMapClick(event: LeafletMouseEvent){
    setSelectedPosition([event.latlng.lat,event.latlng.lng])
  }
  function handleInputChange (event: ChangeEvent<HTMLInputElement>){
    const {name, value } = event.target;

    setFormData({...formData, [name]: value});
  }
  function handleSelectItem (id: number){
    const alreadySelected = selectItems.findIndex(item => item === id);
    if (alreadySelected >= 0){
      const filteredItems = selectItems.filter(item => item !== id);
      setSelectItems(filteredItems)
    }else {
      setSelectItems([...selectItems, id])
    }
  }

  async function handlesubmit (event: FormEvent){
    event.preventDefault();
    const { name, email, whatsapp } = formData;
    const uf = selectUf 
    const city = selectCity 
    const [latitude, longitude] = selectedPosition 
    const items = selectItems 

    const data = new FormData(); 
      data.append('name',name); 
      data.append('email',email);
      data.append('whatsapp',whatsapp);
      data.append('uf',uf);
      data.append('city',city);
      data.append('latitude',String(latitude));
      data.append('longitude',String(longitude));
      data.append('items',items.join(','));
      if(selectedFile) {
        data.append('image', selectedFile);
      }

    await api.post('points', data);
    setOverlay(true);
  }

  function handleOverLay (){
    history.push('/');
  }
  return (
    <div id="page-create-point" className=''>
      <header>
        <img src={logo} alt="Ecoleta"/>
        <Link to="/">
          <FiArrowLeft/>
          Voltar para Home
        </Link>
      </header>
      
      <form onSubmit={handlesubmit}>
        <h1>Cadastro do <br/> ponto de coleta</h1>

        <Dropzone onFileUploaded = {setSelectedFile}/>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>
          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input 
              type="text"
              name="name"
              id="name"
              onChange={handleInputChange}
            />
          </div>
          <div className="field-group">
          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input 
              type="email"
              name="email"
              id="email"
              onChange={handleInputChange}
            />
          </div>
          <div className="field">
            <label htmlFor="whatsapp">Whatsapp</label>
            <input 
              type="text"
              name="whatsapp"
              id="whatsapp"
              onChange={handleInputChange}
            />
          </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>
          <div style={{display: overlay ? 'none' : 'block' }} >
          <Map center={initialPosition ? initialPosition : [-3.724209,-40.9883674]} zoom={15} onClick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={selectedPosition} />
          </Map>
          </div>
          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select name="uf" id="uf" value={selectUf} onChange={handleSelectUf}>
                <option value="0">Selecione uma UF</option>
                {ufs.map((uf) => (
                  <option key= {uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select name="city" id="city" value={selectCity} onChange={handleSelectCity}>
                <option value="0">Selecione uma Cidade</option>
                {cities.map((city) => (
                  <option key= {city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>
            <h2>Itens de coleta</h2>
            <span>Selecione um ou mais itens abaixo</span>
          </legend>
          <ul className="items-grid">
            {items.map(item => (
              <li
                key={item.id} 
                onClick={() => handleSelectItem(item.id)} 
                className={selectItems.includes(item.id) ? 'selected' : ''}
              >
                <img src={item.image_url} alt={item.title}/>
                <span>{item.title}</span>
            </li>
            ))}
          </ul>
        </fieldset>

        <button type="submit">Cadastrar ponto de coleta</button>
      </form>
      <div id="overlay" onClick={handleOverLay} style={{display: overlay ? 'block' : 'none' }}>
        <div id="text">
        <span><FiCheckCircle size={50} color='#34cb79'/></span>
          <br/>Cadastro Concluido!
        </div>
      </div>

    </div>
  );
}

export default CreatePoint;