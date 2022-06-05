import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PeerEmployeeComponent } from './components/peer-employee/peer-employee.component';
import { GeneralComponent } from './components/general/general.component';

const routes: Routes = [{
  path: 'peer-employee',
  component: PeerEmployeeComponent
}, {
  path: 'general',
  component: GeneralComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportRoutingModule { }
