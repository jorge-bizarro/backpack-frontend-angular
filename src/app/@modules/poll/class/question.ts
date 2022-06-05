import { Option } from './option';

export class Question {
  id: number;
  text: string;
  direction: boolean;
  options: Option[];
  idOption?: number;
}
