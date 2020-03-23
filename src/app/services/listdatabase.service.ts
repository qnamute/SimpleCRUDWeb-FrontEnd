import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FoodNode } from '../interfaces/FoodNode';
import { TreesService } from '../services/trees.service';
import { Tree } from '../models/tree';
@Injectable({
  providedIn: 'root'
})
export class ListdatabaseService {

  dataChange: BehaviorSubject<FoodNode[]> = new BehaviorSubject<FoodNode[]>([]);

  get data(): FoodNode[] {
    return this.dataChange.value;
  }

  set data(value: FoodNode[]) {
    this.data = value;
  }

  constructor(private treeService: TreesService) {
    this.initialize();
  }

  initialize() {
    // Build the tree node from json object. The result is list of 'FoodNode' with nested, file node as children

    this.treeService.getTreesStructure().subscribe(value => {
      const data = this.buildFileTree(value, 0);
      this.dataChange.next(data);
    });
  }

  buildFileTree(value: any, level: number): FoodNode[] {
    const data: any[] = [];
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < value.length; i++) {
      const node = new FoodNode();
      node.name = value[i].name;
      node.parentId = value[i].parentId;
      node.treeId = value[i].treeId;
      node.continent = value[i].continent;
      node.isFieldType = false;

      const virtualNode = new FoodNode();
      virtualNode.treeId = value[i].treeId;
      virtualNode.name = value[i].continent.name;
      virtualNode.continent = value[i].continent;
      virtualNode.children = [];
      virtualNode.isFieldType = true;

      node.parent = virtualNode;

      virtualNode.children.push(node);
      virtualNode.isFieldType = true;

      if (value[i].children.length > 0) {
        node.children = this.buildFileTree(value[i].children, level + 1);
      } else {
        node.children = [];
      }

      data.push(virtualNode);
    }
    return data;
  }

  deleteItem(treeId: number, parent: FoodNode, ) {
    let tree: Tree;
    this.treeService.getTree(treeId).subscribe(value => {
      tree = value;
      if (tree.hasChild) {
        const ans = confirm('The ' + tree.name + ' have children node. Do you want to delete this node and all children node');
        if (ans) {
          this.treeService.deleteTree(treeId).subscribe(result => {
          });
        }
      } else {
        this.treeService.deleteTree(treeId).subscribe(result => {
        });
      }
      this.data.forEach(value => {
        this.removeNodeInData(value.children, treeId);
      });
      this.dataChange.next(this.data);
    });
  }

  removeNodeInData(nodes: FoodNode[], treeId: number) {
    for (const index in nodes) {
      if (nodes[index].treeId === treeId) {
        nodes.splice(Number(index), 1);
        this.dataChange.next(this.data);
        return;
      } else {
        if (nodes[index].children.length > 0) {
          this.removeNodeInData(nodes[index].children, treeId);
          continue;
        }
      }
    }
  }

  insertItem(parent: FoodNode, child: FoodNode) {
    // this.parentNode = parent;
    child.isFieldType = true;
    if (parent.children) {
      if (parent.children.length >= 1) {
        // parent already has children
        parent.children.push(child);
      } else {
        // if parent is a leaf node
        parent.children = [];
        parent.children.push(child);
      }
    }
    this.dataChange.next(this.data);
  }

  // Edit real node
  editItem(node: FoodNode, newValue: FoodNode) {
    node.name = newValue.name;
    node.continent.name = newValue.continent.name;
    node.parent = newValue.parent;
    node.continent.continentId = newValue.continent.continentId;
    this.dataChange.next(this.data);
  }
  // Edit contient (fake node)
  editContinent(node: FoodNode, newName: string) {
    node.name = newName;
    this.dataChange.next(this.data);
  }

  // Check add or edit node and call funciton from service
  updateItem(node: FoodNode, virtualNode?: FoodNode) {
    if (node.treeId) {
      // Edit node
      const tree: Tree = {
        treeId: node.treeId,
        parentId: node.parentId,
        name: node.name,
        hasChild: false,
        continentId: node.continent.continentId,
      };
      this.treeService.updateTree(node.treeId, tree).subscribe();
    } else {
      // Add new node
      const tree: Tree = {
        name: node.name,
        parentId: node.parentId,
        hasChild: false,
        continentId: node.continent.continentId,
      };
      this.treeService.saveTree(tree).subscribe(value => {
        node.treeId = value.treeId;
        virtualNode.treeId = value.treeId;
        this.dataChange.next(this.data);
      });
    }
  }
}
