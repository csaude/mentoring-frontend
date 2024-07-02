import { Model } from 'pinia-orm';
import Ronda from './Ronda';
import Mentees from 'src/stores/model/mentees/Mentees'

export default class RondaMentee extends Model {
    static entity = 'rondaMentees';
    static primaryKey = 'id';
    static fields() {
        return {
            id: this.attr(null),
            ronda_id: this.attr(null),
            tutored_id: this.attr(null),
            startDate: this.attr(''),
            endDate: this.attr(''),
            // relationships
            ronda: this.belongsTo(Ronda, 'ronda_id'),
            tutored: this.belongsTo(Mentees, 'tutored_id'),
        };
    }
    static piniaOptions = {
        persist: true,
    };
}
