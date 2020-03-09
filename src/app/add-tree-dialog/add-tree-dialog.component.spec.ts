import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTreeDialogComponent } from './add-tree-dialog.component';

describe('AddTreeDialogComponent', () => {
  let component: AddTreeDialogComponent;
  let fixture: ComponentFixture<AddTreeDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddTreeDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTreeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
