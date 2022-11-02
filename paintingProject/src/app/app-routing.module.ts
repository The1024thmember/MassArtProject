import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./LandingPage/LandingPage.module').then(
        (m) => m.LandingPageModule
      ),
  },
  {
    path: 'draw-board',
    loadChildren: () =>
      import('./DrawBoardPage/DrawBoardPage.module').then(
        (m) => m.DrawBoardPageModule
      ),
  },
  {
    path: 'exp',
    loadChildren: () =>
      import('./Experiment/Exp.module').then((m) => m.ExpModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
