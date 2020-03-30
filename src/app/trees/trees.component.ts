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
// import { start } from 'repl';

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

  // Check node is down or up able
  isUpable = (node: FlatNode) => node.upable;

  isDownable = (node: FlatNode) => node.downable;

  // Check node is move able
  isMoveable = (node: FlatNode) => node.moveable;

  getChildren = (node: FoodNode): FoodNode[] => node.children;

  hasChild = (_: number, node: FlatNode) => node.expandable;

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
    flatNode.isFieldType = node.isFieldType;
    flatNode.levelDisplay = (lv - 1) / 2 + 1;
    flatNode.moveable = node.moveable;
    flatNode.upable = node.upable;
    flatNode.downable = node.downable;

    if (node.children.length > 0) {
      flatNode.expandable = true;
    } else {
      flatNode.expandable = false;
    }

    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }

  onDelete(node: FlatNode) {
    const currentNode = this.flatNodeMap.get(node);
    let isParentHasChildren = false;
    if (currentNode.children) {
      isParentHasChildren = true;
    }
    const ans = confirm('Do you want to delete tree with id: ' + node.treeId + ', name: ' + node.name);
    if (ans) {
      let parentNode = this.getParentNode(node);
      parentNode.treeId = node.treeId;
      let grandNode = this.getParentNode(parentNode);
      this.databaseService.deleteItem(node.treeId);
    }
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

    dialogConfig.width = '250px';
    dialogConfig.data = {
      flatNode: node,
      form: this.nodeForm,
      action: 'Add',
      listContinent: this.continents
    };
    const dialogRef = this.matDialog.open(AddTreeDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {

        this.continentService.getContinent(result.continentId).subscribe(value => {
          const virtualNode: FoodNode = {
            treeId: result.treeId,
            name: value.name,
            continent: value,
            parentId: result.parentId,
            children: [],
          };
          const foodNode: FoodNode = {
            treeId: result.treeId,
            name: result.name,
            parentId: result.parentId,
            continent: value,
            children: [],
          };

          const parentNode = this.flatNodeMap.get(node);

          // Because of default new node will be inserted at the end of list child 

          if (parentNode.children.length == 1) {
            foodNode.downable = false;
            foodNode.moveable = true;
            foodNode.upable = true;
            parentNode.children[parentNode.children.length - 1].children[0].downable = true;
            parentNode.children[parentNode.children.length - 1].children[0].moveable = true;
            parentNode.children[parentNode.children.length - 1].children[0].upable = false;
          } else if (parentNode.children.length > 1) {
            // this parent already has childs
            foodNode.downable = false;
            foodNode.moveable = true;
            foodNode.upable = true;
            parentNode.children[parentNode.children.length - 1].children[0].downable = true;
            console.log(parentNode.children[parentNode.children.length - 1]);
          }
          else {
            // this parent has no child
            foodNode.upable = false;
            foodNode.moveable = false;
            foodNode.downable = false;
          }

          virtualNode.children.push(foodNode);
          this.databaseService.updateItem(foodNode, virtualNode);

          this.databaseService.insertItem(parentNode, virtualNode);
        });
      }
    });
  }

  onEdited(node: FlatNode): void {
    var continentNode = this.getParentNode(node);
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '250px';
    dialogConfig.data = {
      flatNode: node,
      form: this.nodeForm,
      action: 'Edit',
      listContinent: this.continents
    };
    const dialogRef = this.matDialog.open(AddTreeDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.continentService.getContinent(result.continentId).subscribe(value => {
          const foodNode: FoodNode = {
            treeId: result.treeId,
            name: result.name,
            parentId: result.parentId,
            continent: value,
          };

          this.databaseService.updateItem(foodNode);
          const parentNode = this.flatNodeMap.get(node);
          this.databaseService.editItem(parentNode, foodNode);

          continentNode.name = value.name;
          this.databaseService.editContinent(continentNode, value.name);

          // It's doesn't work
          this.treeControl.expand(continentNode);
        });
      }
    });
  }

  // Move up event
  onMoveUp(currentNode: FlatNode): void {
    // const currentFoodNode = this.flatNodeMap.get(currentNode);
    // const aboveFoodNode = this.flatNodeMap.get(this.getAboveNode(currentNode));

    let parentCurrentFoodNode = this.flatNodeMap.get(this.getParentNode(currentNode));
    let parentAboveFoodNode = this.flatNodeMap.get(this.getParentNode(this.getAboveNode(currentNode)));

    this.databaseService.swapNodePosition(parentCurrentFoodNode, parentAboveFoodNode);
  }

  // Move down event
  onMoveDown(currentNode: FlatNode): void {
    // const currentFoodNode = this.flatNodeMap.get(currentNode);
    // const underFoodNode = this.flatNodeMap.get(this.getUnderNode(currentNode));

    let parentCurrentFoodNode = this.flatNodeMap.get(this.getParentNode(currentNode));
    let parentUnderFoodNode = this.flatNodeMap.get(this.getParentNode(this.getUnderNode(currentNode)));


    this.databaseService.swapNodePosition(parentCurrentFoodNode, parentUnderFoodNode);
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

  // Get parent of current node
  getParentNode(node: FlatNode): FlatNode | null {
    const currentLevel = this.getLevel(node);

    if (currentLevel < 1) {
      return null;
    }
    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];
      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

  // Get under node of selected noded
  getUnderNode(node: FlatNode): FlatNode | null {

    // Get the frist node satisfy the condition
    // 1. Has a same parentId
    // 2. Has a same level

    const startIndex = this.treeControl.dataNodes.indexOf(node);
    const selectedNode = this.treeControl.dataNodes[startIndex];
    for (let i = startIndex + 1; i <= this.treeControl.dataNodes.length; i++) {
      const currentNode = this.treeControl.dataNodes[i];
      if (selectedNode.parentId === currentNode.parentId && selectedNode.level === currentNode.level) {
        return currentNode;
      }
    }
    return null;
  }

  // Get above node of selectednode
  getAboveNode(node: FlatNode): FlatNode | null {

    // Get the frist node satisfy the condition
    // 1. Has a same parentId
    // 2. Has a same level

    const startIndex = this.treeControl.dataNodes.indexOf(node);
    const selectedNode = this.treeControl.dataNodes[startIndex];
    for (let i = startIndex - 1; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];
      if (selectedNode.parentId === currentNode.parentId && selectedNode.level === currentNode.level) {
        return currentNode;
      }
    }
    return null;
  }
}