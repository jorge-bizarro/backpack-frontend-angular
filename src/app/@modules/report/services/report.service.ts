import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/@shared/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  private api = 'report/';

  constructor(
    private apiService: ApiService
  ) { }

  getReportByEmployee = (body: object) => {
    return this.apiService.post(this.api + 'by-employee', body);
  }

  getPeriods = () => {
    return this.apiService.get(this.api + 'periods');
  }

  getPersonnelInMyChargue = (body: object) => {
    return this.apiService.post(this.api + 'personnel-in-my-chargue', body);
  }

  getReportByEmployeePDF = (body: any) => {
    return this.apiService.getWithOptions(this.api + `by-employee/${body.documentNumber}/${body.period}/${body.fullName}`, {
      responseType: 'blob' as 'json'
    });
  }

}
