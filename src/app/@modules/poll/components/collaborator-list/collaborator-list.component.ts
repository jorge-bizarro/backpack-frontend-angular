import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Collaborator } from '../../class/collaborator';

@Component({
  selector: 'app-collaborator-list',
  templateUrl: './collaborator-list.component.html',
  styleUrls: ['./collaborator-list.component.scss']
})
export class CollaboratorListComponent implements OnInit {

  @Input() collaborators: Collaborator[];
  @Input() type: string;
  // tslint:disable-next-line: no-output-on-prefix
  @Output() onSelectCollaborator = new EventEmitter<Collaborator>(null);
  // tslint:disable-next-line: no-output-on-prefix
  @Output() onIndicator = new EventEmitter<any>(null);
  listCollaborators: any[];

  constructor() { }

  ngOnInit(): void {
    /** Filtrar por el tipo */
    this.listCollaborators = this.collaborators
      .filter(x => x.type === this.type);

    const totalFinalize = this.listCollaborators
      .filter(x => x.status === 'FINALIZADO').length;

    this.onIndicator.emit({
      totalFinalize,
      type: this.type
    });

    if (this.type === 'PAIR') {
      /** ordenar: En progreso, pendiente y finalizado */
      const inProgress = this.listCollaborators
        .filter(x => x.status === 'EN PROGRESO');

      const inPendient = this.listCollaborators
        .filter(x => x.status === 'PENDIENTE');

      const inFinalice = this.listCollaborators
        .filter(x => x.status === 'FINALIZADO');

      this.listCollaborators = inProgress.concat(...inPendient.concat(...inFinalice));

      /** Ordenar de forma ascendente por numero de encuestas terminadas */
      const orderList = this.listCollaborators
        .filter(x => x.status !== 'FINALIZADO')
        .sort((p, v) => p.totalRespondents - v.totalRespondents);

      this.listCollaborators = orderList.concat(...inFinalice);

      /** Establecer en modo opcional en caso de completar el máximo de 6 */
      if (totalFinalize >= 6) {
        const listOpcional = this.listCollaborators
          .filter(x => !(x.status === 'FINALIZADO' || x.status === 'EN PROGRESO'))
          .map(x => {
            return {
              ...x,
              status: 'OPCIONAL'
            };
          });

        this.listCollaborators = inProgress.concat(...listOpcional).concat(...inFinalice);
      }
    }

    /** Establecer el color */
    this.listCollaborators = this.listCollaborators
      .map(x => {
        return {
          ...x,
          color: x.status === 'FINALIZADO' ? '#6802c1' : x.status === 'PENDIENTE' ? '#ea0303' : '#ff521d',
          totalRespondents: x.totalRespondents ? x.totalRespondents : 0
        };
      });
  }

  onSelect(collaborator: any) {
    this.onSelectCollaborator.emit(collaborator);
  }

}
