import { Model } from 'pinia-orm';
import Ronda from './Ronda';
import Mentor from '../mentor/Mentor';

export default class RondaMentor extends Model {
    static entity = 'ronda_mentors';
    static primaryKey = 'id';
    static fields() {
        return {
            id: this.attr(null),
            ronda_id: this.attr(null),
            mentor_id: this.attr(null),
            startDate: this.attr(''),
            endDate: this.attr(''),
            // relationships
            ronda: this.belongsTo(Ronda, 'ronda_id'),
            mentor: this.belongsTo(Mentor, 'mentor_id'),
        };
    }
    static piniaOptions = {
        persist: true,
    };
}
