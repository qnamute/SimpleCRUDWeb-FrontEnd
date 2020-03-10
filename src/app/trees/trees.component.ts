import { Component, OnInit } from '@angular/core';
import { TreesService } from '../services/trees.service';
import { ListdatabaseService } from '../services/listdatabase.service';

import { FlatNode } from '../interfaces/FlatNode';
import { FoodNode } from '../interfaces/FoodNode';

import { AddTreeDialogComponent } from '../add-tree-dialog/add-tree-dialog.component';

import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig } from '@angular/material/dialog';
import { Continent } from '../models/continent';
import { ContinentService } from '../services/continent.service';
import { BehaviorSubject } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DialogData } from '../models/dialogdata';

@Component({
  selector: 'app-trees',
  templateUrl: './trees.component.html',
  styleUrls: ['./trees.component.css']
})
export class TreesComponent implements OnInit {

  dataChange: BehaviorSubject<FoodNode[]> = new BehaviorSubject<FoodNode[]>([]);

  flatNodeMap: Map<FlatNode, FoodNode> = new Map<FlatNode, FoodNode>();

  nestedNodeMap: Map<FoodNode, FlatNode> = new Map<FoodNode, FlatNode>();

  selectedParent: FlatNode | null = null;

  newItemName = '';

  isEditing = true;

  newItemId: number;

  selectedNode: FlatNode;

  treeControl = new FlatTreeControl<FlatNode>(node => node.level, node => node.expandable);

  treeFlattener: MatTreeFlattener<FoodNode, FlatNode>;

  dataSource: MatTreeFlatDataSource<FoodNode, FlatNode>;

  continents: Continent[];

  nodeForm: FormGroup;

  constructor(private treesService: TreesService, private databaseService: ListdatabaseService,
    // tslint:disable-next-line: align
    private matDialog: MatDialog, private continentService: ContinentService, private formBuilder: FormBuilder) {

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

    databaseService.dataChange.subscribe(data => {
      this.dataSource.data = data;
    });

    this.continentService.getContinents().subscribe(result => {
      this.continents = result;
    });
  }

  ngOnInit(): void {
    this.buildForm();
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
    flatNode.treeId = node.treeId;
    flatNode.parentId = node.parentId;
    flatNode.level = lv;
    flatNode.continent = node.continent;
    if (node.children) {
      if (node.children.length > 0) {
        flatNode.expandable = true;
      } else {
        flatNode.expandable = false;
      }
    } else {
      flatNode.expandable = false;
    }
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }

  deleteItem(node: FlatNode) {
    const parentNode = this.flatNodeMap.get(node);
    let isParentHasChildren = false;
    if (parentNode.children) {
      isParentHasChildren = true;
    }
    const ans = confirm('Do you want to delete tree with id: ' + node.treeId + ', name: ' + node.name);
    if (ans) {
      this.databaseService.deleteItem(node.treeId, parentNode);
    }
  }

  // Add new root item

  addnewRootItem() {

  }


  cancelNode(node: FlatNode) {
    const parentNode = this.flatNodeMap.get(node);
    this.databaseService.cancleInsertItem(parentNode);
  }

  onSelect(node: FlatNode) {
    this.selectedNode = node;
  }

  buildForm(): void {
    this.nodeForm = this.formBuilder.group({
      treeId: [''],
      name: ['', Validators.required],
      contientId: ['', Validators.required],
    });
  }

  // opendialog
  onCreated(node: FlatNode): void {
    const dialogConfig = new MatDialogConfig();

    this.expandNode(node);

    dialogConfig.width = '25%';
    dialogConfig.data = {
      flatNode: node,
      form: this.nodeForm,
      action: 'Add'
    };
    const dialogRef = this.matDialog.open(AddTreeDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(result);
        const foodNode: FoodNode = {
          treeId: result.treeId,
          name: result.name,
          parentId: result.parentId,
          continent: result.continent,
        };
        this.databaseService.updateItem(foodNode);
        const parentNode = this.flatNodeMap.get(node);
        this.databaseService.insertItem(parentNode, foodNode);
      }
    });
  }

  onEdited(node: FlatNode): void {
    const dialogConfig = new MatDialogConfig();

    this.expandNode(node);

    dialogConfig.width = '25%';
    dialogConfig.data = {
      flatNode: node,
      form: this.nodeForm,
      action: 'Edit'
    };
    const dialogRef = this.matDialog.open(AddTreeDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const foodNode: FoodNode = {
          treeId: result.treeId,
          name: result.name,
          parentId: result.parentId,
          continent: result.continent
        };
        this.databaseService.updateItem(foodNode);
      }
    });
  }

  expandNode(node: FlatNode): void {
    const parentNode = this.flatNodeMap.get(node);
    let isParentHasChildren = false;
    if (parentNode.children) {
      isParentHasChildren = true;
    }
    if (isParentHasChildren) {
      this.treeControl.expand(node);
    }
  }
}
