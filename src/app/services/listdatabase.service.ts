import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FoodNode } from '../interfaces/FoodNode';
import { TreesService } from '../services/trees.service';
import { Tree } from '../models/tree';
import { first } from 'rxjs/operators';
import { isSameMultiYearView } from '@angular/material/datepicker/multi-year-view';
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
      let data: FoodNode[];
      if (value.length > 1) {
        data = this.buildFileTree(value, 0, true);
        // This node is moveable
      } else {
        data = this.buildFileTree(value, 0, false);
      }
      this.dataChange.next(data);
    });
  }

  buildFileTree(value: any, level: number, isMoveable?: boolean): FoodNode[] {
    const data: any[] = [];
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < value.length; i++) {
      const node = new FoodNode();
      node.name = value[i].name;
      node.parentId = value[i].parentId;
      node.treeId = value[i].treeId;
      node.continent = value[i].continent;
      node.isFieldType = false;
      node.sortOrder = value[i].sortOrder;
      node.moveable = isMoveable;

      // node.upable = node.downable = true;

      if (i === 0) {
        // Is the first element of array has sorted
        // This node can only move down
        // upable = false
        node.upable = false;
        node.downable = true;
      } else if (i === value.length - 1) {
        // is the last element of array has sorted
        // This node can only move up
        // Downable = false
        node.upable = true;
        node.downable = false;
      } else {
        node.upable = node.downable = true;
      }


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
        if (value[i].children.length > 1) {
          // Child node moveable
          node.children = this.buildFileTree(value[i].children, level + 1, true);
        } else {
          node.children = this.buildFileTree(value[i].children, level + 1, false);
        }
      } else {
        node.children = [];
      }

      data.push(virtualNode);
    }
    return data;
  }

  deleteItem(treeId: number) {
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
      this.initialize();
      this.dataChange.next(this.data);
    });
  }

  removeNodeInData(nodes: FoodNode[], treeId: number) {
    for (const index in nodes) {
      if (nodes[index].treeId === treeId) {
        console.log(nodes[index]);
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

  // Swap position 2 node
  swapNodePosition(parentSelectedNode: FoodNode, parentTargetNode: FoodNode) {
    const selectedNode = parentSelectedNode.children[0];
    const targetNode = parentTargetNode.children[0];
    this.treeService.swapTreeSortOrder(selectedNode.treeId, targetNode.treeId).subscribe(result => {
      this.data.forEach(value => {
        this.swapNode(value.children, selectedNode, targetNode, false, false);
      })

      let temp = new FoodNode();
      let tempChild = new FoodNode();
      temp.children = [];
      temp.children.push(tempChild); 

      temp.name = parentSelectedNode.name;
      temp.parentId = parentSelectedNode.parentId;
      temp.continent = parentSelectedNode.continent;
      temp.children[0].upable = parentSelectedNode.children[0].upable;
      temp.children[0].downable = parentSelectedNode.children[0].downable;

      parentSelectedNode.name = parentTargetNode.name;
      parentSelectedNode.parentId = parentTargetNode.parentId;
      parentSelectedNode.continent = parentTargetNode.continent;
      parentSelectedNode.children[0].upable = parentTargetNode.children[0].upable;
      parentSelectedNode.children[0].downable = parentTargetNode.children[0].downable;

      parentTargetNode.name = temp.name;
      parentTargetNode.parentId = temp.parentId;
      parentTargetNode.continent = temp.continent;
      parentTargetNode.children[0].upable = temp.children[0].upable;
      parentTargetNode.children[0].downable = temp.children[0].downable;
    
      console.log(parentSelectedNode, parentTargetNode);

      this.dataChange.next(this.data);
    });

  }

  swapNode(nodes: FoodNode[], selectedNode: FoodNode, targetNode: FoodNode, selectedNodeAssignFlag: boolean, targetNodeAssignFlag: boolean) {
    for (const index in nodes) {
      if (nodes[index] === selectedNode) {
        nodes[index] = targetNode;
        selectedNodeAssignFlag = true;
      } else if (nodes[index] === targetNode) {
        nodes[index] = selectedNode;
        targetNodeAssignFlag = true;
      }

      // ASsign two of value success
      if (selectedNodeAssignFlag === true && targetNodeAssignFlag === true) {
        this.dataChange.next(this.data);
        return;
      } else if (nodes[index].children.length > 0) {
        this.swapNode(nodes[index].children, selectedNode, targetNode, selectedNodeAssignFlag, targetNodeAssignFlag);
        continue;
      }
    }
  }
}

