import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/@shared/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {

  private api = 'question';

  constructor(private apiService: ApiService) { }

  getAll = () => this.apiService.get(this.api);
}
