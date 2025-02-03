import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SyncEditoComponent } from './sync-edito.component';

describe('SyncEditoComponent', () => {
  let component: SyncEditoComponent;
  let fixture: ComponentFixture<SyncEditoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SyncEditoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SyncEditoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
