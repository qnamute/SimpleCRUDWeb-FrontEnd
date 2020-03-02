import { TestBed } from '@angular/core/testing';

import { ListdatabaseService } from './listdatabase.service';

describe('ListdatabaseService', () => {
  let service: ListdatabaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ListdatabaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
