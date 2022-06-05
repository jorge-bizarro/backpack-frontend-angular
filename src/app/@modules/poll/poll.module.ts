import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PollRoutingModule } from './poll-routing.module';
import { PollComponent } from './poll.component';
import { MaterialModule } from 'src/app/@shared/material/material.module';
import { QuestionPaginationPipe } from './pipes/question-pagination.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QuestionsComponent } from './components/questions/questions.component';
import { CollaboratorListComponent } from './components/collaborator-list/collaborator-list.component';

@NgModule({
  declarations: [
    PollComponent,
    QuestionPaginationPipe,
    QuestionsComponent,
    CollaboratorListComponent
  ],
  imports: [
    CommonModule,
    PollRoutingModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class PollModule { }
