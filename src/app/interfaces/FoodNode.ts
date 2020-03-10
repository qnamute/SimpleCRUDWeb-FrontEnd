import { Continent } from '../models/continent';

export class FoodNode {
    treeId: number;
    name: string;
    parentId: number;
    children?: FoodNode[];
    continent: Continent;
};