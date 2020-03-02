import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FoodNode } from '../interfaces/FoodNode';
import { TreesService } from '../services/trees.service';
@Injectable({
  providedIn: 'root'
})
export class ListdatabaseService {

  dataChange: BehaviorSubject<FoodNode[]> = new BehaviorSubject<FoodNode[]>([]);

  get data(): FoodNode[] {
    return this.dataChange.value;
  }

  constructor(private treeService: TreesService) {
    this.initialize();
  }

  initialize() {
    // Build the tree node from json object. The result is list of 'FoodNode' with nested, file node as children

    this.treeService.getTreesStructure().subscribe(value => {
      const data = this.buildFileTree(value, 0);
      console.log(data);
      this.dataChange.next(data);
    });
  }

  buildFileTree(value: any, level: number) {

    // Init data array
    const data: any[] = [];
    for (const k in value) {
      if (k != null) {
        const v = value[k];

        const node = new FoodNode();
        node.name = `${k}`;
        if (v === null || v === undefined) {
          // nothing happend here
        } else if (typeof v === 'object') {
          node.children = this.buildFileTree(v, level + 1);
        } else {
          node.name = v;
        }
        data.push(node);
      }
    }
    return data;
  }

  insertItem(parent: FoodNode, nameNode: string) {
    const child = new FoodNode();
    child.name = nameNode;

    if (parent.children) {
      // parent already has children
      parent.children.push(child);
      this.dataChange.next(this.data);
    } else {
      // if parent is a leaf node
      parent.children = [];
      parent.children.push(child);
      this.dataChange.next(this.data);
    }
  }

  updateItem(node: FoodNode, name: string) {
    node.name = name;
    this.dataChange.next(this.data);
  }
}
