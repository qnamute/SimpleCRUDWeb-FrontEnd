import { Continent } from '../models/continent';

export class FoodNode {
    treeId?: number;
    name: string;
    parentId: number;
    parent?: FoodNode;
    children?: FoodNode[];
    continent: Continent;
    isFieldType?: boolean;
};