import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MyButtonComponent } from './MyButton';
import { MyColumnComponent } from './MyColumn/myColumn.component';
import { MyContainerComponent } from './MyContainer/myContainer.component';
import { MyGridComponent } from './MyGrid/myGrid.component';
import { MyHeadingComponent } from './MyHeading/myHeading.component';
import { MyHorizontalBarComponent } from './MyHorizontalBar/myHorizontalBar.component';
import { MyTextComponent } from './MyText/myText.component';

import { MyVerticalBarComponent } from './MyVerticalBar/myVerticalBar.component';

@NgModule({
  imports: [CommonModule],
  declarations: [
    MyContainerComponent,
    MyHeadingComponent,
    MyTextComponent,
    MyGridComponent,
    MyColumnComponent,
    MyVerticalBarComponent,
    MyHorizontalBarComponent,
    MyButtonComponent,
  ],
  exports: [
    MyContainerComponent,
    MyHeadingComponent,
    MyTextComponent,
    MyGridComponent,
    MyColumnComponent,
    MyVerticalBarComponent,
    MyHorizontalBarComponent,
    MyButtonComponent,
  ],
})
export class ComponentLibraryModule {}
