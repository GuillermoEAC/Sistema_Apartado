import { Routes } from '@angular/router';

import { PublicLayout } from './layouts/public/public-layout/public-layout';
import { TeacherLayoutComponent } from './layouts/teacher/teacher-layout/teacher-layout';
import { AdminLayout } from './layouts/admin/admin-layout/admin-layout';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
    {
        path: '',
        component: PublicLayout,
        children: [
            {
                path: '',
                loadComponent: () =>
                    import('./features/public/home/home').then((m) => m.HomeComponent),
            },
        ],
    },

    {
        path: 'login',
        loadComponent: () =>
            import('./features/auth/login/login').then((m) => m.LoginComponent),
    },

    {
        path: 'register',
        loadComponent: () =>
            import('./features/auth/register/register').then((m) => m.RegisterComponent),
    },

    {
        path: 'app',
        component: TeacherLayoutComponent,
        canActivate: [authGuard],
        children: [
            {
                path: 'dashboard',
                loadComponent: () =>
                    import('./features/teacher/dashboard/dashboard').then(
                        (m) => m.DashboardComponent,
                    ),
            },
            {
                path: 'request',
                loadComponent: () =>
                    import('./features/teacher/request-form/request-form').then(
                        (m) => m.RequestFormComponent,
                    ),
            },
            {
                path: 'calendar',
                loadComponent: () =>
                    import('./features/teacher/calendar/calendar').then(
                        (m) => m.CalendarComponent,
                    ),
            },
            {
                path: 'reservations',
                loadComponent: () =>
                    import('./features/teacher/reservations/reservations').then(
                        (m) => m.Reservations,
                    ),
            },
            {
                path: 'history',
                loadComponent: () =>
                    import('./features/teacher/history/history').then((m) => m.History),
            },
            {
                path: 'attendance',
                loadComponent: () =>
                    import('./features/teacher/attendance/attendance').then(
                        (m) => m.Attendance,
                    ),
            },
        ],
    },

    {
        path: 'admin',
        component: AdminLayout,
        canActivate: [roleGuard('admin')],
        children: [
            {
                path: 'dashboard',
                loadComponent: () =>
                    import('./features/admin/dashboard/dashboard').then(
                        (m) => m.DashboardComponent,
                    ),
            },
            {
                path: 'requests',
                loadComponent: () =>
                    import('./features/admin/requests/requests').then((m) => m.Requests),
            },
            {
                path: 'calendar',
                loadComponent: () =>
                    import('./features/admin/calendar/calendar').then((m) => m.Calendar),
            },
            {
                path: 'users',
                loadComponent: () =>
                    import('./features/admin/users/users').then((m) => m.Users),
            },
            {
                path: 'catalogs',
                loadComponent: () =>
                    import('./features/admin/catalogs/catalogs').then((m) => m.Catalogs),
            },
            {
                path: 'blocks',
                loadComponent: () =>
                    import('./features/admin/schedule-blocks/schedule-blocks').then(
                        (m) => m.ScheduleBlocks,
                    ),
            },
            {
                path: 'history',
                loadComponent: () =>
                    import('./features/admin/history/history').then((m) => m.History),
            },
        ],
    },

    {
        path: '**',
        redirectTo: '',
    },
];
