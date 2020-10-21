import { IPDFFile } from './pdfFile';

export interface IEvent {
  title: string;
  description: string;
  date: Date;
  files: IPDFFile[];
}
