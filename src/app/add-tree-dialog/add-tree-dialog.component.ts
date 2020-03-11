import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Continent } from '../models/continent';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ContinentService } from '../services/continent.service';
import { FlatNode } from '../interfaces/FlatNode';

@Component({
  selector: 'app-add-tree-dialog',
  templateUrl: './add-tree-dialog.component.html',
  styleUrls: ['./add-tree-dialog.component.css']
})
export class AddTreeDialogComponent implements OnInit {

  continents: Continent[];
  form: FormGroup;
  flatNode: FlatNode;
  action: string;
  selected: Continent;

  constructor(public dialogRef: MatDialogRef<AddTreeDialogComponent>, private continentService: ContinentService,
    // tslint:disable-next-line: align
    @Inject(MAT_DIALOG_DATA) public dialogData: any) {
    this.flatNode = dialogData.flatNode;
    this.form = dialogData.form;
    this.action = dialogData.action;
    this.selected = this.dialogData.flatNode.continent;
    this.buildForm();
  }

  ngOnInit(): void {
    this.continentService.getContinents().subscribe(data => {
      this.continents = data;
    });
    // this.buildForm();
  }

  buildForm(): void {
    if (this.action === 'Add') {
      this.form = new FormGroup({
        treeId: new FormControl(undefined),
        name: new FormControl('', Validators.required),
        continent: new FormControl('', Validators.required),
        parentId: new FormControl(this.flatNode.treeId, Validators.required),
      });
    } else if (this.action === 'Edit') {
      this.form = new FormGroup({
        treeId: new FormControl(this.flatNode.treeId),
        name: new FormControl(this.flatNode.name, Validators.required),
        continent: new FormControl(this.flatNode.continent, Validators.required),
        parentId: new FormControl(this.flatNode.parentId, Validators.required)
      });
    }
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  onSaveClick(): void {
    if (this.form.invalid) {
      return;
    }
    console.log(this.form.value);
    this.dialogRef.close(this.form.value);
  }
}
