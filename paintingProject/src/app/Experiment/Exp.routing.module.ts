import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExpComponent } from './Exp.component';

const routes: Routes = [
  {
    path: '',
    component: ExpComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExpRoutingModule {}
