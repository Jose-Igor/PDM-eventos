import axios from 'axios';

const api = axios.create({
  baseURL:'http://192.168.2.20:3000'  //Em casa
  //baseURL:'http://10.3.135.176:3000'     //IFPB
})
export default api;