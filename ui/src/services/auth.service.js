import axios from 'axios';
import authHeader from './auth-header';

import config from '../../config';


class AuthService {
  login(user) {
    return axios
      .post(config.API_URL + 'login', {
        username: user.username,
        password: user.password
      })
      .then(response => {
        if (response.data.token && response.data.username) {
          const userJson = {
            username : response.data.username,
            token : response.data.token 
          }

          localStorage.setItem('user', JSON.stringify(userJson));
        }

        return response.data;
      });
  }

  register(user) {
    return axios
      .post(config.API_URL + 'register', {
        username: user.username,
        password: user.password
      })
      .then(response => {
        if (response.data.token && response.data.username) {
          const userJson = {
            username : response.data.username,
            token : response.data.token 
          }

          localStorage.setItem('user', JSON.stringify(userJson));
        }

        return response.data;
      });
  }

  logout() {
    return axios.post(config.API_URL + 'logout', {}, { headers: authHeader() });
  }

  init2fa() {
    return axios.post(config.API_URL + 'init2fa', {}, { headers: authHeader() });
  }

  loginWith2FA(code = '') {
        
    if(code){
      return axios.post(config.API_URL + 'login/2fa', {usertwoFACode: code}, { headers: authHeader() }).then(
        response => {
          if (response.data.token && response.data.username) {
            const userJson = {
              username : response.data.username,
              token : response.data.token 
            }
  
            localStorage.setItem('user', JSON.stringify(userJson));
          }
          return response.data;
      });
    }
    else{
      return axios.post(config.API_URL + 'login/2fa', {}, { headers: authHeader() }).then(
        response => {
          return response.data;
      });
    }
  }

}

export default new AuthService();