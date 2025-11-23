import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfferCandidateComponent } from './offer-candidate.component';

describe('OfferCandidateComponent', () => {
  let component: OfferCandidateComponent;
  let fixture: ComponentFixture<OfferCandidateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OfferCandidateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfferCandidateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
