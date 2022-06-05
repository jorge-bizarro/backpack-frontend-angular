import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Pollster } from '../../class/pollster';
import { QuestionService } from '../../services/question.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Question } from '../../class/question';
import { Respondent } from '../../class/respondent';
import { ApiResponse } from 'src/app/@shared/class/api-response';
import { Response } from '../../class/response';
import { PollService } from '../../services/poll.service';

const PER_PAGE = 10;

@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.scss']
})
export class QuestionsComponent implements OnInit {

  errorMessage: string;
  actualPage: number; // controlar la pagina actual
  loadedQuestions: boolean;
  pollster: Pollster; // encuestado
  respondent: Respondent; // encuestador
  questions: Question[]; // preguntas
  responses: Response[]; // respuestas

  constructor(
    private location: Location,
    private snackBar: MatSnackBar,
    private questionService: QuestionService,
    private pollService: PollService) { }

  async ngOnInit() {
    const { collaborator, respondent }: any = this.location.getState();

    if (!collaborator || !respondent) {
      this.location.back();
      return;
    }

    /** establecer valores para el encuestador */
    this.respondent = new Respondent();
    this.respondent.documentNumber = respondent.documentNumber;
    this.respondent.fullName = respondent.fullName;

    /** establcer valores para el encuestador */
    this.pollster = new Pollster();
    this.pollster.documentNumber = collaborator.documentNumber;
    this.pollster.fullName = collaborator.fullName;
    this.pollster.type = collaborator.type;

    /** obtener el questionario para el encuestado */
    await this.getQuestions(collaborator.status);
  }

  async getQuestions(stateCollaborator: string) {
    const responseQuestions: ApiResponse = await this.questionService.getAll().toPromise();

    if (responseQuestions.error) {
      this.errorMessage = 'No se logró obtener las preguntas de la encuesta';
      this.snackBar.open(this.errorMessage, 'Error', {
        duration: 5000
      });
      console.error(this.errorMessage, responseQuestions.error);
      return;
    }

    /** filtrar las preguntas con las opciones */
    const options = responseQuestions.data.options;
    this.questions = responseQuestions.data.questions.map(question => {
      return {
        ...question,
        options
      };
    });

    /** establecer las respuestas con valores vacíos */
    this.responses = this.questions.map(question => {
      return {
        idQuestion: question.id,
        idOption: null,
        qualification: null
      };
    });


    /** en caso de que el colaborador estuvo en progreso completar las respuestas */
    if (stateCollaborator === 'EN PROGRESO') {
      const responseProgress: ApiResponse = await this.pollService.getProgress({
        dniEmployee: this.respondent.documentNumber,
        dniCollaborator: this.pollster.documentNumber
      }).toPromise();

      if (responseProgress.error) {
        this.errorMessage = 'No se logró recuperar el progreso del encuestado';
        this.snackBar.open(this.errorMessage, 'Error', {
          duration: 5000
        });
        console.error(this.errorMessage, responseProgress.error);
        return;
      }

      const progress: Response[] = responseProgress.data;

      /** actualizar la lista de respuestas con el avance */
      this.responses.forEach(response => {
        const responseProgressFound = progress.find(x => x.idQuestion === response.idQuestion);
        response.idOption = responseProgressFound?.idOption;
        response.qualification = responseProgressFound?.qualification;
      });
    }

    this.actualPage = 0; // establecer página inical
    this.loadedQuestions = true;
  }

  textEvaluationCollaborator(): string {
    if (this.pollster?.type === 'ME') {
      return 'Estás autoevaluándote';
    }

    let type: string;

    switch (this.pollster?.type) {
      case 'BOSS':
        type = 'jefe(a)';
        break;

      case 'PAIR':
        type = 'par';
        break;

      default:
        type = 'encargado(a)';
        break;
    }

    return `Estás evaluando a tu ${type}: ${this.pollster?.fullName}`;
  }

  isCompletedQuestions = (): boolean => {
    return Math.floor(this.questions.length / PER_PAGE) === this.actualPage;
  }

  responseQuestion(question: Question, idOption: number) {
    const existsResponse = this.responses.find(x => x.idQuestion === question.id);
    existsResponse.idOption = idOption;
    existsResponse.qualification = question.direction ? idOption : question.options[question.options.length - idOption].id;
  }

  async updateQuestions(value: number) {
    if (value > 0) {
      const min = (this.actualPage * PER_PAGE) + 1;
      const max = (this.actualPage + 1) * PER_PAGE;
      const islastPage = this.isCompletedQuestions();

      const pollProgress = this.responses.filter(response =>
        (min <= response.idQuestion && response.idQuestion <= max && response.idOption !== null && response.idOption !== undefined)
      );

      if ((!islastPage && pollProgress.length !== PER_PAGE) ||
        (islastPage && pollProgress.length !== Math.floor(this.questions.length % PER_PAGE))) {
        this.snackBar.open('Faltan marcar, por favor revise de nuevo', 'Info', {
          duration: 3000
        });
        return;
      }

      for (const iterator of pollProgress) {
        const body = {
          respondentDocumentNumber: this.respondent.documentNumber,
          // respondentFullname: this.respondent.fullName,
          pollsterDocumentNumber: this.pollster.documentNumber,
          // pollsterFullname: this.pollster.fullName,
          pollsterType: this.pollster.type,
          idQuestion: iterator.idQuestion,
          idOption: iterator.idOption,
          qualification: iterator.qualification
        };

        const response: any = await this.pollService.saveProgress(body).toPromise();

        if (response.error) {
          this.errorMessage = 'No se guardó el avance';
          this.snackBar.open(this.errorMessage, 'Error', {
            duration: 3000
          });

          console.error(this.errorMessage, response);
        }
      }

      if (this.isCompletedQuestions()) {
        this.snackBar.open('Encuesta terminada', 'Info', {
          duration: 5000
        }).afterDismissed().subscribe(() => {
          this.location.back();
        });
        return;
      }
    }

    this.actualPage += value;
    window.scroll(0, 0);
  }

}
