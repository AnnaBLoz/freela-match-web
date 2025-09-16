import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FreelancerViewComponent } from './freelancer-view.component';

describe('FreelancerViewComponent', () => {
  let component: FreelancerViewComponent;
  let fixture: ComponentFixture<FreelancerViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FreelancerViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FreelancerViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
