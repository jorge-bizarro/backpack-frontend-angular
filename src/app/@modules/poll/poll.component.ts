import { Component, OnInit, ChangeDetectorRef, ViewEncapsulation, OnDestroy } from '@angular/core';
import { PollService } from './services/poll.service';
import { UserService } from './services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Respondent } from './class/respondent';
import { Collaborator } from './class/collaborator';
import { BehaviorSubject } from 'rxjs';

const ME = 'ME';
const PAIR = 'PAIR';
const COLLABORATOR = 'COLLABORATOR';
const BOSS = 'BOSS';

@Component({
  selector: 'app-poll',
  templateUrl: './poll.component.html',
  styleUrls: ['./poll.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PollComponent implements OnInit {

  collaborators: Collaborator[];
  respondent: Respondent;
  errorMessage: string;
  indicatorMe: number;
  indicatorPair: number;
  indicatorCollaborator: number;
  indicatorBoss: number;
  messageIndicatorMe: string;
  messageIndicatorPair: string;
  messageIndicatorCollaborator: string;
  messageIndicatorBoss: string;

  constructor(
    private pollService: PollService,
    public userService: UserService,
    private snackBar: MatSnackBar,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.indicatorPair = 0;
    this.respondent = new Respondent();

    this.userService.getEmployeeInformation({
      token: localStorage.getItem('token')
    }).subscribe((responseUser: any) => {
      if (responseUser.error) {
        this.errorMessage = 'Error al obtener datos del Encuestado';
        console.error(this.errorMessage, responseUser.error);
        this.snackBar.open(this.errorMessage, 'Error', {
          duration: 5000
        });
        return;
      }

      this.respondent.documentNumber = responseUser.payload.documentNumber;
      this.respondent.fullName = responseUser.payload.fullName;
      this.respondent.isTeacher = responseUser.payload.isTeacher;

      this.pollService.getCollaborators({
        dniEmployee: this.respondent.documentNumber,
        isTeacher: this.respondent.isTeacher
      }).subscribe((responsePoll: any) => {
        if (responsePoll.error) {
          this.errorMessage = `Error al obtener lista de colaboradores`;
          console.error(this.errorMessage, responsePoll.error);
          this.snackBar.open(this.errorMessage, 'Error', {
            duration: 5000
          });
          return;
        }

        this.collaborators = responsePoll.data;

        if (this.collaborators.length === 0) {
          this.snackBar.open('No hay información para mostrar', 'Info', {
            duration: 5000
          });
        }
      }, (error) => {
        this.snackBar.open('Ocurrió un error al enviar la solicitud al servidor', 'Error', {
          duration: 5000
        });
        console.error(error);
      });
    }, error => {
      this.snackBar.open('Ocurrió un error al enviar la solicitud al servidor', 'Error', {
        duration: 5000
      });
      console.error(error);
    });
  }

  showPoll(collaborator) {
    if (collaborator.status === 'FINALIZADO') {
      this.snackBar.open('No es posible volver a encuestar a quien ha completado', 'Info', {
        duration: 5000
      });
      return;
    }

    this.router.navigateByUrl('/poll/questions', {
      state: {
        collaborator,
        respondent: this.respondent
      }
    });
  }

  showColumnStaffInCharge(): boolean {
    return this.collaborators.filter(x => x.type === 'COLLABORATOR').length > 0;
  }

  onIndicator(object) {
    const actualValue = object.totalFinalize;
    const messagep1 = `Has completado ${actualValue} de `;

    switch (object.type) {
      case ME:
        this.indicatorMe = actualValue;
        this.messageIndicatorMe = messagep1 + this.limitResponsesByType('ME');
        break;

      case PAIR:
        this.indicatorPair = actualValue;
        let message2 = '6 encuestas que debes realizar como mímino';

        const limit = this.limitResponsesByType(PAIR);

        if (limit < 6) {
          message2 = limit.toString();
        }

        this.messageIndicatorPair = messagep1 + message2;
        break;

      case COLLABORATOR:
        this.indicatorCollaborator = actualValue;
        this.messageIndicatorCollaborator = messagep1 + this.limitResponsesByType('COLLABORATOR').toString();
        break;

      case BOSS:
        this.indicatorBoss = actualValue;
        this.messageIndicatorBoss = messagep1 + this.limitResponsesByType('BOSS');
        break;

      default:
        break;
    }

    this.cdr.detectChanges();
  }

  hideNotificationPair() {
    this.userService.showNotificationPair.next(false);
  }

  limitResponsesByType(type: string) {
    if (this.respondent.isTeacher && type === ME) {
      return 0;
    }

    const totalCollaboratorByTypeInList = this.collaborators.filter(x => x.type === type).length;

    if (type === PAIR && totalCollaboratorByTypeInList > 6) {
      return 6;
    }

    return totalCollaboratorByTypeInList;
  }

}
