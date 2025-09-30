import api from '../apiService/apiService';

export default {
  async getSessionReport() {
    try {
      const response = await api().get('/sessions/report');
      console.log(response);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar relatório de sessões:', error.message);
      throw error;
    }
  },

  // Faca um que pega as sessions pelo id da ronda no pinia
  async getSessionByRondaId(roundId: string) {
    try {
      const response = await api().get(`/sessions/round/${roundId}`);
      console.log(response);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar sessões pela ID da ronda:', error.message);
      throw error;
    }
  },

  // Aqui você pode incluir outros métodos como:
  // async getAll(), async search(), async post(), etc.
};
