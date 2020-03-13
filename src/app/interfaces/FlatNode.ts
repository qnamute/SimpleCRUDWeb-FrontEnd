import { Continent } from '../models/continent';

export class FlatNode {
    treeId: number;
    expandable: boolean;
    name: string;
    level: number;
    parentId: number;
    isExpand?: boolean;
    continent: Continent;
    levelDisplay: number;
};