import { Observable, from } from 'rxjs';
import { Continent } from '../models/continent';

export class Tree {
  treeId?: number;
  name: string;
  continentId: number;
  parentId?: number;
  hasChild: boolean;
  continent?: Continent;
  sortOrder?: number;
}