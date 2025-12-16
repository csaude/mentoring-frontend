import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../entities/base/BaseEntity';
import Mentees from './Mentees';
import { FlowHistory } from './FlowHistory';
import Ronda from '../ronda/Ronda';
import FlowHistoryProgressStatus from 'src/enums/FlowHistoryProgressStatus';
import userMentees from 'src/composables/mentees/menteesMethods';
import useRonda from 'src/composables/ronda/rondaMethods';

@Entity('mentee_flow_histories')
export class MenteeFlowHistory extends BaseEntity {
  @ManyToOne(() => Mentees)
  @JoinColumn({ name: 'mentee_id' })
  mentee!: Mentees;

  @ManyToOne(() => FlowHistory)
  @JoinColumn({ name: 'flow_history_id' })
  flowHistory!: FlowHistory;

  @Column({ type: 'text', nullable: false })
  progressStatus!: FlowHistoryProgressStatus;

  @ManyToOne(() => Ronda)
  @JoinColumn({ name: 'ronda_id' })
  ronda?: Ronda;

  constructor(init?: Partial<MenteeFlowHistory>) {
    super();
    if (init) {
      Object.assign(this, init);
    }
  }

  static fromDTO(dto: any): MenteeFlowHistory {
    console.log('MenteeFlowHistory: ', dto);

    const { createMenteesFromDTO } = userMentees();
    const { createRondaFromDTO } = useRonda();

    const entity = new MenteeFlowHistory();
    entity.updateBaseFieldsFromDTO(dto);

    // Garantir que rondaDTO existe antes de definir rondaMentors
    if (!dto.rondaDTO) {
      console.warn('rondaDTO está ausente no DTO recebido');
      dto.rondaDTO = {};
    }

    // Forçar o campo sempre como array vazio
    dto.rondaDTO.rondaMentors = [];

    entity.progressStatus = dto.progressStatus;
    entity.mentee = createMenteesFromDTO(dto.tutoredDTO);
    entity.flowHistory = FlowHistory.fromDTO(dto.flowHistoryDTO);
    entity.ronda = createRondaFromDTO(dto.rondaDTO);

    return entity;
  }

  toDTO(): any {
    return {
      ...this.getBaseDTO(),
      progressStatus: this.progressStatus,
      mentee: this.mentee ? this.mentee.toDTO() : null,
      flowHistory: this.flowHistory ? this.flowHistory.toDTO() : null,
      ronda: this.ronda ? this.ronda.toDTO() : null,
    };
  }
}
