import { TestBed } from '@angular/core/testing';

import { DevicesService } from './devices.service';

describe('DevicesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DevicesService = TestBed.get(DevicesService);
    expect(service).toBeTruthy();
  });
});
