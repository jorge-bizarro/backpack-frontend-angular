import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/@modules/poll/services/user.service';
import { FormControl } from '@angular/forms';
import { Observable, BehaviorSubject } from 'rxjs';
import { startWith, map, debounceTime, tap, switchMap, finalize } from 'rxjs/operators';
import { ReportService } from '../../services/report.service';
import { ApiResponse } from 'src/app/@shared/class/api-response';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Period } from '../../class/period';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import * as FileSaver from 'file-saver'

@Component({
  selector: 'app-general',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.scss']
})
export class GeneralComponent implements OnInit {

  userInformation: any = null;
  searchParameters = {
    searchText: '',
    documentNumberBoss: '',
    typeSearch: ''
  };
  personnelInCharge: any[];
  employeeControl: FormControl;
  loadingPersonnel: boolean;

  filteredPeriods: Observable<any[]>;
  listPeriods: any[];
  periodControl: FormControl;
  loadingPeriod: boolean;

  report: any;
  reportByClusters: any[];
  showReport: boolean;
  ocurredError: boolean;

  employee$ = new BehaviorSubject<any>(null);
  period$ = new BehaviorSubject<any>(null);

  loadingReport: boolean;

  adminReports = [{
    position: 1,
    loading: false,
    text: 'Exportar a Excel toda la información de las encuestas',
    filename: 'Reporte general'
  }, {
    position: 2,
    loading: false,
    text: 'Exportar a Excel el estado de los evaluadores',
    filename: 'Reporte de estado de los evaluadores'
  }, {
    position: 3,
    loading: false,
    text: 'Exportar a Excel el resúmen de la encuesta',
    filename: 'Reporte resúmen de la encuesta'
  }, {
    position: 4,
    loading: false,
    text: 'Exportar a Excel el reporte general con los nuevos cálculos',
    filename: 'Reporte ESCI nuevos cálculos'
  }]

  constructor(
    private userService: UserService,
    private reportService: ReportService,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) { }

  async ngOnInit(): Promise<void> {
    this.employeeControl = new FormControl();
    this.personnelInCharge = [];
    this.loadingPersonnel = false;

    this.listPeriods = [];
    this.periodControl = new FormControl();
    this.loadingPeriod = false;

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

    if (this.userInformation) {
      this.searchParameters.documentNumberBoss = this.userInformation.documentNumber;

      if (this.userInformation.typeEmployee === 'JEFE') {
        this.searchParameters.typeSearch = 'STAFF IN MY CHARGE';
      }

      if (this.userInformation.accessToReportAdmin) {
        this.searchParameters.typeSearch = 'ALL';
      }
    }

    try {
      const periodsResponse: ApiResponse = await this.reportService.getPeriods().toPromise();

      if (periodsResponse.error) {
        throw new Error(periodsResponse.error);
      }

      this.listPeriods = periodsResponse.data;
    } catch (error) {
      this.showError('Error al obtener los periodos', error);
    }

    this.employeeControl.valueChanges
      .pipe(
        tap(() => this.loadingPersonnel = true),
        debounceTime(1000),
        switchMap(value => {
          value = typeof value === 'string' ? value : value.fullNameDisplay;
          const filterValue = value.toLowerCase();
          this.searchParameters.searchText = filterValue;

          return this.reportService.getPersonnelInMyChargue(this.searchParameters)
            .pipe(
              finalize(() => this.loadingPersonnel = false)
            );
        })
      )
      .subscribe((personnelInChargueResponse: ApiResponse) => {
        if (personnelInChargueResponse.error) {
          throw new Error(personnelInChargueResponse.error);
        }

        const data = personnelInChargueResponse.data;
        const value = typeof this.employeeControl.value === 'string' ? this.employeeControl.value.toLowerCase() : '';
        this.personnelInCharge = data.filter(personnel => personnel.fullNameDisplay.toLowerCase().includes(value));
      });

    this.filteredPeriods = this.periodControl.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.name),
        map(name => name ? this._filter(name) : this.listPeriods.slice())
      );

  }

  private _filter(value: string) {
    const filterValue = value.toLowerCase();
    return this.listPeriods.filter(period => period.name.toLowerCase().indexOf(filterValue) === 0);
  }

  displayFnPersonnelInChargue(personnel: any): string {
    return personnel && personnel.fullNameDisplay ? personnel.fullNameDisplay : '';
  }

  displayFnPeriod(period: any): string {
    return period && period.name ? period.name : '';
  }

  async loadReport() {
    const period: Period = this.periodControl.value;
    const personnel = this.employeeControl.value;

    if (!period || !period.name || !personnel || !personnel.documentNumber) {
      this.snackBar.open('Seleccione un empleado y el periodo correspondiente', 'Info', {
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
        documentNumber: personnel.documentNumber
      }).toPromise();

      if (reportGeneral.error) {
        throw new Error(reportGeneral.error);
      }

      this.report = reportGeneral.data;

      if (this.report.reportData.length === 0) {
        this.snackBar.open('No llegaron a evaluarle en este periodo', 'Info', {
          duration: 3000
        });
        return;
      }

      this.showReport = true;
      this.employee$.next(this.employeeControl.value);
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

  exportReport(position: number) {
    const period: Period = this.periodControl.value;

    if (!period || !period.name) {
      this.snackBar.open('Seleccione un periodo', 'Info', {
        duration: 3000
      });
      return;
    }

    const reportSelected = this.adminReports.find(x => x.position === position);
    reportSelected.loading = true;

    this.http.post(`${environment.server}/api/report/general`, {
      period: period.name,
      position: position
    }, {
      responseType: 'blob',
      headers: new HttpHeaders().set('Accept', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    }).subscribe(response => {
      const blob = new Blob([response], {
        type: 'application/vnd.ms-excel'
      })

      FileSaver.saveAs(blob, `${reportSelected.filename}_${new Date().toLocaleDateString()}.xlsx`)
    }, error => {
      this.snackBar.open('Ocurrió un error inesperado', 'Error', {
        duration: 5000
      });
      console.error('Ocurred a error on export report => ', error);
    }, () => {
      reportSelected.loading = false;
    });
  }

}
