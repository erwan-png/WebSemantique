import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChansonComponent } from './chanson.component';

describe('ChansonComponent', () => {
  let component: ChansonComponent;
  let fixture: ComponentFixture<ChansonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChansonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChansonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
