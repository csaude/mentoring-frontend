import api from '../apiService/apiService';
import { useRepo } from 'pinia-orm';
import { UserDTO } from 'src/services/dto/user/UserDTO';
import { plainToClass } from 'class-transformer';
import useUser from 'src/composables/user/userMethods';
import User from 'src/stores/model/user/User';

const userRepo = useRepo(User);
const { createUserFromDTO } = useUser();

const TOKEN_REFRESH_MARGIN = 2 * 60 * 1000; // Refresh token 2 minutes before expiration

export default {
  async post(obj: string) {
    try {
      const resp = await api().post(
        'user',
        plainToClass(UserDTO, obj, { excludeExtraneousValues: true })
      );
    } catch (error: any) {
      console.error(error);
    }
  },
  async login(params) {
    try {
      const resp = await api().post('/login', params);
      return resp;
    } catch (error) {
      console.error(error);
      return error;
    }
  },
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('tokenExpiration');
  },
  convertUserFromDTO(userDTO: any) {
    const user = createUserFromDTO(userDTO);
    userRepo.save(user);
  },
  getLogedUser() {
    const userloged = JSON.stringify(localStorage.getItem('username'));
    return (
      userRepo
        .query()
        .withAll()
        //.where('username', userloged)
        .first()
    );
  },
  piniaSave(user: User) {
    return userRepo.save(user);
  },
  async getAll() {
    return await api()
      .get('/user/getAll')
      .then((resp) => {
        this.generateAndSaveEntityFromDTO(resp.data);
        return resp;
      })
      .catch((error) => {
        console.error(error);
        console.error('Error', error.message);
      });
  },
  piniaGetAll() {
    const res = userRepo
      .query()
      .withAllRecursive(2)
      .orderBy('username', 'asc')
      .get();
    return res;
  },
  async saveUser(user: any) {
    return await api()
      .post('/user/save', user)
      .then((resp) => {
        userRepo.save(createUserFromDTO(resp.data));
        return resp;
      })
      .catch((error) => {
        console.error('Error', error.message);
      });
  },
  async deleteUser(userId: number) {
    try {
      const resp = await api().patch(`/user/${userId}`);
      await api().delete(`/user/${userId}`);
      userRepo.save(createUserFromDTO(resp.data));
      return resp;
    } catch (error: any) {
      console.error('Error', error.message);
      // You might want to re-throw the error or handle it differently here
      throw error;
    }
  },
  generateAndSaveEntityFromDTO(dtoList: any) {
    dtoList.forEach((dto: any) => {
      const entity = createUserFromDTO(dto);
      userRepo.save(entity);
    });
  },
  async resetPassword(user: any) {
    return await api()
      .patch('/user/password-reset', user)
      .then((resp) => {
        userRepo.save(createUserFromDTO(resp.data));
        return resp;
      })
      .catch((error) => {
        console.error('Error', error.message);
      });
  },
  async updateUser(user: any) {
    return await api()
      .patch('/user/update', user)
      .then((resp) => {
        userRepo.save(createUserFromDTO(resp.data));
        return resp;
      })
      .catch((error) => {
        console.error('Error', error.message);
      });
  },

  async search(searchParam: string) {
    return await api()
      .get(`/user/search?${new URLSearchParams(searchParam).toString()}`)
      .then((resp) => {
        this.generateAndSaveEntityFromDTO(resp.data.content);
        return resp;
      })
      .catch((error) => {
        console.error(error);
        console.error('Error', error.message);
      });
  },

  async fetchPage(page: any) {
    return await api()
      .get(`/user/getAll?${new URLSearchParams(page).toString()}`)
      .then((resp) => {
        this.generateAndSaveEntityFromDTO(resp.data.content);
        return resp;
      })
      .catch((error) => {
        console.error(error);
        console.error('Error', error.message);
      });
  },
  handleTokenResponse(data) {
    const { accessToken, refreshToken, expiresIn, userInfo } = data;

    // Save tokens and expiration time
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('tokenExpiration', Date.now() + expiresIn * 900000); // Convert to milliseconds
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
  },
  async refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return;

    try {
      const response = await api().post('/auth/refresh', { refresh_token: refreshToken });
      if (response.status === 200) {
        localStorage.setItem('access_token', response.data[0].access_token);
        localStorage.setItem('refresh_token', response.data[0].refresh_token);
        localStorage.setItem('tokenExpiration', String(Date.now() + 900000));
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.logout();
    }
  },
  startTokenSynchronization() {
    setInterval(() => {
      if (localStorage.getItem('tokenExpiration') === null) return;
      const tokenExpiration = Number(localStorage.getItem('tokenExpiration'));
      if (Date.now() > tokenExpiration - TOKEN_REFRESH_MARGIN) {
        this.refreshToken();
      }
    }, 5 * 60 * 1000); // Check every 5 minute
  },
};
