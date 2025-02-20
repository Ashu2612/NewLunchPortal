import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextControlEditoComponent } from './text-control-edito.component';

describe('TextControlEditoComponent', () => {
  let component: TextControlEditoComponent;
  let fixture: ComponentFixture<TextControlEditoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextControlEditoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TextControlEditoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
