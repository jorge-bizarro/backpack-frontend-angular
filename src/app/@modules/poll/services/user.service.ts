import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/@shared/services/api.service';
import { Respondent } from '../class/respondent';
import { Collaborator } from '../class/collaborator';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private api = 'user';

  collaboratorSelected: Collaborator;
  respondentSelected: Respondent;
  showNotificationPair = new BehaviorSubject<boolean>(true);

  constructor(private apiService: ApiService) { }

  getEmployeeInformation = (body: object) => this.apiService.post(this.api + '/information', body);

}
