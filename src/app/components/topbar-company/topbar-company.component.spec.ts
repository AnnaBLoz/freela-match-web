import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopbarCompanyComponent } from './topbar-company.component';

describe('TopbarCompanyComponent', () => {
  let component: TopbarCompanyComponent;
  let fixture: ComponentFixture<TopbarCompanyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TopbarCompanyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopbarCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
