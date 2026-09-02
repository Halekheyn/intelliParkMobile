import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VehicleEntryPage } from './vehicle-entry.page';

describe('VehicleEntryPage', () => {
  let component: VehicleEntryPage;
  let fixture: ComponentFixture<VehicleEntryPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VehicleEntryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
