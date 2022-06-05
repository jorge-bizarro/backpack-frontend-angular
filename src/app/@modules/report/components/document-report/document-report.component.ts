import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { ReportService } from '../../services/report.service';

@Component({
  selector: 'app-document-report',
  templateUrl: './document-report.component.html',
  styleUrls: ['./document-report.component.scss']
})
export class DocumentReportComponent implements OnInit {

  @Input() report: any;
  @Input() userInformation: any;
  @Input() period: any;

  totalDeEvaluadores: any;
  totalDeEvaluados: any;

  summaryClusters: any;
  summaryRespondent: any;
  percent: string;
  reportData: any;
  reportByCluster: any[];

  pages = Array.from(new Array(2), (x, i) => i + 1);
  quantityClusterPerPage = 6;

  exportingToPDF: boolean = false;

  constructor(
    private reportService: ReportService
  ) { }

  ngOnInit(): void {    
    this.reportData = this.report.reportData;
    this.summaryClusters = this.report.summaryClusters;
    this.summaryRespondent = this.report.summaryRespondent;
    this.percent = this.report.percent;
    this.totalDeEvaluadores = this.report.totales.totalDeEvaluadores;
    this.totalDeEvaluados = this.report.totales.totalDeEvaluados;
    this.reportByCluster = [];

    for (const report of this.reportData) {
      for (const reportCluster of report.data) {
        this.reportByCluster.push(reportCluster);
      }
    }
  }

  exportPDF(): void {
    this.exportingToPDF = true;
    this.reportService.getReportByEmployeePDF({
      period: this.period,
      documentNumber: this.userInformation.documentNumber,
      fullName: this.userInformation.fullName
    })
      .pipe(
        finalize(() => this.exportingToPDF = false)
      )
      .subscribe(data => {
        const newBlob = new Blob([data], {
          type: 'application/pdf'
        });

        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(newBlob);
          return;
        }

        const info = window.URL.createObjectURL(newBlob);

        const link = document.createElement('a');
        link.href = info;
        link.download = `${this.userInformation.fullName.toLowerCase()} - reporte ESCI ${new Date().getTime()}.pdf`;
        link.dispatchEvent(new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        }));

        setTimeout(() => {
          window.URL.revokeObjectURL(info);
          link.remove();
        }, 100);
      });
  }

  scrollToElement($element): void {
    $element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest'
    });
  }

  clustersDetail(numberPage) {
    const START = this.quantityClusterPerPage * (numberPage - 1);
    const END = START + this.quantityClusterPerPage;

    return this.reportByCluster.slice(START, END);
  }

}
