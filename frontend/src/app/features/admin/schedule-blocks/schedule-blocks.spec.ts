import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleBlocks } from './schedule-blocks';

describe('ScheduleBlocks', () => {
  let component: ScheduleBlocks;
  let fixture: ComponentFixture<ScheduleBlocks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleBlocks],
    }).compileComponents();

    fixture = TestBed.createComponent(ScheduleBlocks);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
