import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private server = `${environment.server}/api/`;

  constructor(private http: HttpClient) { }

  get = (api: string) => this.http.get(this.server + api);

  getWithOptions = (api: string, options: any): Observable<any> => this.http.get(this.server + api, options);

  post = (api: string, body: object) => this.http.post(this.server + api, body);
}
