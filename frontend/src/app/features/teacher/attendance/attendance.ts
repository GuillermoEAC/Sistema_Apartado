import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-attendance',
  imports: [],
  templateUrl: './attendance.html',
  styleUrl: './attendance.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Attendance {}
