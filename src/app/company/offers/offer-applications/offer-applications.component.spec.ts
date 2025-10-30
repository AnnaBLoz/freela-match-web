import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfferApplicationsComponent } from './offer-applications.component';

describe('OfferApplicationsComponent', () => {
  let component: OfferApplicationsComponent;
  let fixture: ComponentFixture<OfferApplicationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OfferApplicationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfferApplicationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
