import { TestBed } from '@angular/core/testing';

import { BluetoothleService } from './bluetoothle.service';

describe('BluetoothleService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BluetoothleService = TestBed.get(BluetoothleService);
    expect(service).toBeTruthy();
  });
});
