import { Observable, from } from 'rxjs';
import { Continent } from '../models/continent';

export class Tree {
  treeId?: number;
  name: string;
  continent?: Continent[];
  parentId: number;
  hasChild: boolean;
}