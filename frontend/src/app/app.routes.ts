import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RecruiterLayoutComponent } from './layouts/recruiter-layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { JobsComponent } from './pages/jobs/jobs.component';
import { CandidatesComponent } from './pages/candidates/candidates.component';
import { PipelineComponent } from './pages/pipeline/pipeline.component';
import { InterviewsComponent } from './pages/interviews/interviews.component';
import { ReviewComponent } from './pages/review/review.component';
import { AssistantComponent } from './pages/assistant/assistant.component';
import { AnalyticsComponent } from './pages/analytics/analytics.component';
import { CandidateInterviewComponent } from './pages/candidate-interview/candidate-interview.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'candidate/interview/:token', component: CandidateInterviewComponent },
  {
    path: '',
    component: RecruiterLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'jobs', component: JobsComponent },
      { path: 'candidates', component: CandidatesComponent },
      { path: 'pipeline', component: PipelineComponent },
      { path: 'interviews', component: InterviewsComponent },
      { path: 'review/:sessionId', component: ReviewComponent },
      { path: 'assistant', component: AssistantComponent },
      { path: 'analytics', component: AnalyticsComponent }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
