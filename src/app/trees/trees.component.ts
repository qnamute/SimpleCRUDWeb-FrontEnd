import { Component, OnInit } from '@angular/core';
import { Observable, VirtualTimeScheduler, BehaviorSubject } from 'rxjs';
import { TreesService } from '../services/trees.service';
import { ListdatabaseService } from '../services/listdatabase.service';

import { FlatNode } from '../interfaces/FlatNode';
import { FoodNode } from '../interfaces/FoodNode';

import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';

@Component({
  selector: 'app-trees',
  templateUrl: './trees.component.html',
  styleUrls: ['./trees.component.css']
})
export class TreesComponent {

  dataChange: BehaviorSubject<FoodNode[]> = new BehaviorSubject<FoodNode[]>([]);

  flatNodeMap: Map<FlatNode, FoodNode> = new Map<FlatNode, FoodNode>();

  nestedNodeMap: Map<FoodNode, FlatNode> = new Map<FoodNode, FlatNode>();

  selectedParent: FlatNode | null = null;

  newItemName = '';

  treeControl = new FlatTreeControl<FlatNode>(node => node.level, node => node.expandable);

  treeFlattener: MatTreeFlattener<FoodNode, FlatNode>;

  dataSource: MatTreeFlatDataSource<FoodNode, FlatNode>;

  constructor(private treesService: TreesService, private databaseService: ListdatabaseService) {

    this.treeFlattener = new MatTreeFlattener(
      this.transformer,
      this.getLevel,
      this.isExpandable,
      this.getChildren
    );

    this.treeControl = new FlatTreeControl<FlatNode>(
      this.getLevel,
      this.isExpandable
    );

    this.dataSource = new MatTreeFlatDataSource(
      this.treeControl,
      this.treeFlattener
    );

    this.treesService.getTreesStructure().subscribe(value => {
      this.dataSource.data = value;
    });

    databaseService.dataChange.subscribe(data => {
      this.dataSource.data = data;
    });
  }



  getLevel = (node: FlatNode) => node.level;

  isExpandable = (node: FlatNode) => node.expandable;

  getChildren = (node: FoodNode): FoodNode[] => node.children;

  hasChild = (_: number, node: FlatNode) => node.expandable;

  hasNoContent = (_: number, nodeData: FlatNode) => nodeData.name === '';

  // Transformer to convert nested node to flat node. Record the nodes in maps for later use.
  transformer = (node: FoodNode, lv: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.name === node.name
      ? existingNode
      : new FlatNode();
    flatNode.name = node.name;
    flatNode.level = lv;
    if (node.children.length > 0) {
      flatNode.expandable = true;
    } else {
      flatNode.expandable = false;
    }
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }

  // Add new children
  addNewItem(node: FlatNode) {
    const parentNode = this.flatNodeMap.get(node);

    let isParentHasChildren = false;
    if (parentNode.children) {
      isParentHasChildren = true;
    }
    this.databaseService.insertItem(parentNode, '');
    if (isParentHasChildren) {
      this.treeControl.expand(node);
    }
  }

  // Save node
  saveNode(node: FlatNode, itemValue: string) {
    const nestedNode = this.flatNodeMap.get(node);
    // this.treesService.update Tree(nestedNode!, itemValue);
  }

  get data(): FoodNode[] {
    return this.dataChange.value;
  }
}
