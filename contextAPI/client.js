
import axios from "axios";


//export default axios.create({baseURL: 'http://192.168.1.83:3500'});

//export default axios.create({baseURL: 'https://ozabackendapi.ozaapp.com'})

const client = axios.create({
  baseURL: 'https://oza-backend-api-git-newmaster-perry-joes-projects.vercel.app',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

client.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.log('Request timeout — server is waking up, please retry');
    }
    return Promise.reject(error);
  }
);

export default client;