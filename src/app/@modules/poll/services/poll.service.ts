import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/@shared/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class PollService {

  private api = 'poll';

  constructor(private apiService: ApiService) { }

  getCollaborators = (body: object) => this.apiService.post(this.api + '/collaborators', body);

  saveProgress = (body: object) => this.apiService.post(this.api + '/save-progress', body);

  getProgress = (body: object) => this.apiService.post(this.api + '/get-progress', body);

}
