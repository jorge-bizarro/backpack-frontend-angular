import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [{
  path: 'poll',
  loadChildren: () => import('./@modules/poll/poll.module').then(m => m.PollModule)
}, {
  path: 'report',
  loadChildren: () => import('./@modules/report/report.module').then(m => m.ReportModule)
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
