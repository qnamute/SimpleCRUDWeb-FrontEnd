import { Component, OnInit } from '@angular/core';
import { Observable, VirtualTimeScheduler } from 'rxjs';
import { CollectionViewer, SelectionChange } from '@angular/cdk/collections';
import { TreesService } from '../services/trees.service';
import { Tree } from '../models/tree';

import { FlatNode } from '../interfaces/FlatNode';
import { FoodNode } from '../interfaces/FoodNode';

import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';

@Component({
  selector: 'app-trees',
  templateUrl: './trees.component.html',
  styleUrls: ['./trees.component.css']
})
export class TreesComponent implements OnInit {

  flatNodeMap = new Map<FlatNode, FoodNode>();

  nestedNodeMap = new Map<FoodNode, FlatNode>();

  selectedParent: FlatNode | null = null;

  newItemName = '';

  treeControl = new FlatTreeControl<FlatNode>(
    node => node.level, node => node.expandable);

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

  treeFlattener = new MatTreeFlattener(
    this.transformer, node => node.level, node => node.expandable, node => node.children);

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor(private treesService: TreesService) {
    this.treesService.getTreesStructure().subscribe(value => {
      this.dataSource.data = value;
    });
  }
  hasChild = (_: number, node: FlatNode) => node.expandable;

  hasNoContent = (_: number, nodeData: FlatNode) => nodeData.name === '';

  ngOnInit(): void {
  }

  isExpandable(treeId) {
    this.treesService.getTree(treeId).subscribe(value => {
      if (value.hasChild === true) {
        return true;
      }
      return false;
    });
  }
  // Add new children
  addNewNode(node: FlatNode) {
    const parentNode = this.flatNodeMap.get(node);
    // this.treesService.insertNode(parentNode!, '');
    console.log(this.hasNoContent);
    this.treeControl.expand(node);
  }

  // Save node
  saveNode(node: FlatNode, itemValue: string) {
    const nestedNode = this.flatNodeMap.get(node);
    // this.treesService.update Tree(nestedNode!, itemValue);
  }
}
