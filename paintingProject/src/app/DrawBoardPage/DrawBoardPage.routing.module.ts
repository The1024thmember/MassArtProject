import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DrawBoardPageComponent } from './DrawBoardPage.component';

const routes: Routes = [
  {
    path: '',
    component: DrawBoardPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DrawBoardPageRoutingModule {}
