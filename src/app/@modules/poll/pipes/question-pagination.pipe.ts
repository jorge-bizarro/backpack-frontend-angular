import { Pipe, PipeTransform } from '@angular/core';

const PER_PAGE = 10;

@Pipe({
  name: 'questionPagination'
})
export class QuestionPaginationPipe implements PipeTransform {

  transform(questions: any[], actualPage: number, responses: any[]): unknown {
    return questions.map(question => {
      const response = responses.find(x => x.idQuestion === question.id);
      return {
        ...question,
        visible: ((actualPage * PER_PAGE) + 1 <= question.id && question.id <= (actualPage + 1) * PER_PAGE),
        idOption: response.idOption
      };
    }).filter(x => x.visible === true);
  }

}
