import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MyContainerComponent } from "./MyContainer/myContainer.component";
import { MyHeadingComponent } from "./MyHeading/myHeading.component";
import { MyTextComponent } from "./MyText";

@NgModule({
    imports:[
        CommonModule,
    ],
    declarations:[
                  MyContainerComponent,
                  MyHeadingComponent,
                  MyTextComponent
                ],
    exports:[
            MyContainerComponent,
            MyHeadingComponent,
            MyTextComponent,
            ],
})
export class ComponentLibraryModule {}