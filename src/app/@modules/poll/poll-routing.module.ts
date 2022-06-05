import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PollComponent } from './poll.component';
import { QuestionsComponent } from './components/questions/questions.component';

const routes: Routes = [{
  path: '',
  component: PollComponent
}, {
  path: 'questions',
  component: QuestionsComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PollRoutingModule { }
