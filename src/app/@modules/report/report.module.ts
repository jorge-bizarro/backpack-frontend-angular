import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportRoutingModule } from './report-routing.module';
import { PeerEmployeeComponent } from './components/peer-employee/peer-employee.component';
import { GeneralComponent } from './components/general/general.component';
import { MaterialModule } from 'src/app/@shared/material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DocumentReportComponent } from './components/document-report/document-report.component';

@NgModule({
  declarations: [
    PeerEmployeeComponent,
    GeneralComponent,
    DocumentReportComponent,
  ],
  imports: [
    CommonModule,
    ReportRoutingModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class ReportModule { }
