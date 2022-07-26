import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MyContainerComponent } from "./MyContainer/myContainer.component";
import { MyHeadingComponent } from "./MyHeading/myHeading.component";
import { MyTextComponent } from "./MyText";
import { MyGridComponent } from "./MyGrid/myGrid.component";
import { MyColumnComponent } from "./MyColumn/myColumn.component";

@NgModule({
    imports:[
        CommonModule,
    ],
    declarations:[
                  MyContainerComponent,
                  MyHeadingComponent,
                  MyTextComponent,
                  MyGridComponent,
                  MyColumnComponent,
                ],
    exports:[
            MyContainerComponent,
            MyHeadingComponent,
            MyTextComponent,
            MyGridComponent,
            MyColumnComponent,
            ],
})
export class ComponentLibraryModule {}