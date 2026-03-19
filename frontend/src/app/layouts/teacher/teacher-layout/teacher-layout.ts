import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-teacher-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './teacher-layout.html',
  styleUrl: './teacher-layout.scss',
})
export class TeacherLayout { }