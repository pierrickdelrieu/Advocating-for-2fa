import axios from 'axios';
import authHeader from './auth-header';

import config from '../../config';

class UserService {
  getInfo() {
    return axios.get(config.API_URL + 'getinfo', { headers: authHeader() });
  }
}

export default new UserService();