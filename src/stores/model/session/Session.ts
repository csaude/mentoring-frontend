import { Model } from 'pinia-orm';
import Ronda from '../ronda/Ronda';
import Form from '../form/Form';

export default class Session extends Model {
  static entity = 'sessions';
  static primaryKey = 'id';
  static fields() {
    return {
      id: this.number(() => 0),
      uuid: this.attr(''),
      code: this.attr(''),
      startDate: this.attr(''),
      endDate: this.attr(''),
      description: this.attr(''),
      performedDate: this.attr(''),
      reason: this.attr(''),

      // 👇 Adiciona essas duas chaves estrangeiras
      ronda_id: this.attr(null),
      form_id: this.attr(null),

      // 👇 Relacionamentos
      ronda: this.belongsTo(Ronda, 'ronda_id'),
      form: this.belongsTo(Form, 'form_id'),
    };
  }
  static piniaOptions = {
    persist: true,
  };
}
