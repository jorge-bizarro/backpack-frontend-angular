import { Component, OnInit } from '@angular/core';
// import { jsPDF } from 'jspdf';
// import html2canvas from 'html2canvas';
import { ApiResponse } from 'src/app/@shared/class/api-response';
import { ReportService } from '../../services/report.service';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { Period } from '../../class/period';
import { UserService } from 'src/app/@modules/poll/services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-peer-employee',
  templateUrl: './peer-employee.component.html',
  styleUrls: ['./peer-employee.component.scss']
})
export class PeerEmployeeComponent implements OnInit {

  userInformation: any;
  periods: Period[];
  periodControl: FormControl;
  filteredPeriods: Observable<Period[]>;
  showReport: boolean;
  ocurredError: boolean;

  report: any;
  period$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  loadingReport: boolean;

  constructor(
    private reportService: ReportService,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) { }

  async ngOnInit(): Promise<void> {
    this.periodControl = new FormControl();
    this.periods = [];

    try {
      const userServiceResponse: any = await this.userService.getEmployeeInformation({
        token: localStorage.getItem('token')
      }).toPromise();

      if (userServiceResponse.error) {
        throw new Error(userServiceResponse.error);
      }

      this.userInformation = userServiceResponse.payload;
    } catch (error) {
      this.showError('Error al obtener la información del usuario', error);
    }

    try {
      const periodsResponse: ApiResponse = await this.reportService.getPeriods().toPromise();

      if (periodsResponse.error) {
        throw new Error(periodsResponse.error);
      }

      this.periods = periodsResponse.data;
    } catch (error) {
      this.showError('Error al obtener los periodos', error);
    }

    this.filteredPeriods = this.periodControl.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.name),
        map(name => name ? this._filter(name) : this.periods.slice())
      );

  }

  private _filter(value: string) {
    const filterValue = value.toLowerCase();

    return this.periods.filter(period => period.name.toLowerCase().indexOf(filterValue) === 0);
  }

  displayFn(period: Period): string {
    return period && period.name ? period.name : '';
  }

  async loadReport() {
    const period: Period = this.periodControl.value;

    if (!period || !period.name) {
      this.snackBar.open('Seleccione un periodo', 'Info', {
        duration: 3000
      });
      return;
    }

    this.showReport = false;
    this.ocurredError = false;

    try {
      this.loadingReport = true;

      const reportGeneral: ApiResponse = await this.reportService.getReportByEmployee({
        period: period.name,
        documentNumber: this.userInformation.documentNumber
      }).toPromise();

      if (reportGeneral.error) {
        throw new Error(reportGeneral.error);
      }

      this.report = reportGeneral.data;

      if (this.report.reportData.length === 0) {
        this.snackBar.open('No llegaron a evaluarte en este periodo', 'Info', {
          duration: 10000
        });
        return;
      }
      this.showReport = true;
      this.period$.next(this.periodControl.value.name);

    } catch (error) {
      this.ocurredError = true;
      this.showError('Error al obtener el reporte', error);
    } finally {
      this.loadingReport = false;
    }
  }

  showError(errorMessage: string, error: any) {
    this.snackBar.open(errorMessage, 'Error', {
      duration: 5000
    });
    console.error(errorMessage, error);
  }


}
