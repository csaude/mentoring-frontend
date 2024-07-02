import { Model } from 'pinia-orm';

export default class RondaType extends Model {
    static entity = 'rondaTypes';
    static primaryKey = 'id';
    static fields() {
        return {
            id: this.number(() => 0),
            uuid: this.attr(''),
            code: this.attr(''),
            description: this.attr(''),
        };
    }
    static piniaOptions = {
        persist: true,
    };
}
