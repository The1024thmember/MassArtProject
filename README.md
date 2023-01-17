# MassArtProject
figma link: https://www.figma.com/file/JK4el75XZFm8BKcGZotYTt/landingPage?node-id=1%3A2
click up link: https://app.clickup.com/42088340/v/b/184dwm-80
Miro link: https://miro.com/app/board/uXjVPT1bNk0=/

To do:

1. create a canvas event listenting service, listening for mouse movement (for drawing), and key events (delete)
     a) differentiate between selection and real drawing (done)
     b) able to handle multi selection
        - to solve: currently, the after painting is finished, not only the one that is being paint is selected, but also the one near by, which is triggered by event "selection:created".

     c) how to interact with drawer file, the selected button for different categories and change colors later on, and different
        classes. 
        - when user click on a certain tool, say line, after draw the first line, the next key down event should still be drawing
        instead of selection, for select, need to explicitly click the "selction" button.

        - the drawing tool, once selected, whenever on key down event, will create new object, if not dragging, the new created object will have 0 length/width/radius, which need to be cleanned on key up event. (done)

        - hard to select, espeically for old drawing object selection area smaller then new drawing object selection object, make old object non seletable
          potential solution: the selection area down to the line itself, instead of the square occupied (done)

        - hard to draw on details, since key up will auto select the current object, make it hard to draw new object inside current object's selection area (done)

        - when click select, the draw mode will be disabeled

     d) how to delete object using keyboard and multi-selection, multi-selection should be able to handle all the changes (color,  weight)


     c) enable select mode when user explicitly interact with ui instead of by default

     e) need to add validation for public function for modifing existing object property

     f) color change so far cannot change the transparency
        - need to add control for selecting the color history for current color selection (done)
        - once the color is selected from the history which updating the current object color, it doesn't work when select directly from the color platte, not only ont renew the color for object, but also not change for the history of color selection. (done)

     g) need to add widget for changing the weight for stroke,scrolling bar (done)
        - under selecting mode: make the color and weight value align with that object, if select nothing, then the color and weight should be default black and 2
           - use observable for the two way binding (partially done: need to change the color platte fill the same with observerable, need to be
           careful with the logic when the user wants to create, should it use the last selected object color or default color)

           - make sure the new changes doesn't break the existing functionality:
              a) choose new color will add into color platte history
              b) choose new color will make the next draw using that color
              c) select object can still change the color both from the picker and the color history
              d) the color platte fill color need to be align with the color picker color
              d) same applies with weight
              

        - under creating mode: keep track of the last color & weight creation value

      h) might need to write ui test for the features ..


  what the user flow should be like?
    create -> create   (free draw is more sutiable)
    create -> modify   (draw object with given tools is more sutiable) : abstract paitning, easy to draw





2. foreground and background issue, how to auto focus on foreground (the color plate and other tools)

Later:
3. how to interact with api? how to fetch and update the background? how big is the canvas?



----------------------------------------------------------------------------------------
1. Property change, customized property change, deletion and creation redo undo for single selected object is fine.
2. For batch selected object, deletion  is fine.
3. For batch selection rotation, position change and scale, redo undo is buggy since the position is a problem for group selection.

----------------------------------------------------------------------------------------
 For customrized property change: single is fine for all object, group is fine if the group doesn't have path object
 For deletion, group or single is fine with or without path object
 For property change(scale, rotating, position change), single is fine for 90% of time, group always change the position even I have passed group property
   another thing need to notice is that when change single object position then change the color (customized property change + fabricjs default property change),
   it will be buggy, since update the selected obj property taken place when `object:modified` (in interactiveService) or new color observable passed to drawservice
   so if mingle one defualt property change with one customized property change, then the undo will undo two steps. (eg. change color then move, undo combine color
   change with position change while redo can separate the steps into two)

   ----------------------------------------------------------------------------------------

   For customized property and defined property change (scale, rotating, position change), single object redo, undo is fine.
   Means, undo all the way back and redo all the way through, if do undo in the middle then do redo + new property change, property sometimes get multi-step update (which is because the original object doesn't recover to the step it should be, similar with the previous problem of doing custom property change + object.modified distinguishable property change.) 

   ----------------------------------------------------------------------------------------
   Redo undo logic:
   
   after redo for certain steps, new emit event (color changing, create new object,) should make redo stack empty and undo restart.

   For group selection property change, it seems that only clean selection before redo/undo will work properly, otherwise, the position seems starting with the (right,bottom) of the original group.

   group selection: scale and rotation value are living in the group object, for somereason, the scaleX and scaleY is always undefined even try to fetch from canvas._objects, and redo will have some problem on rotation.

   -----------------------------------------------------------------------------------------
   Group scale and rotate need to recalculate the position.
   Investiage on why sometimes undo flow collpases multiple steps into one, the undo step collpases seems only happen on scale event => scale then customized event change, when do undo, the scale event will be together with customized event change and merge into one step. Now its been solved,
   the same with what I did with scale, scale is better to be calculated via object.getObjectScaling and buddle it as beforeChangeEvent object as a
   property, then passing it down to build event factory

   -----------------------------------------------------------------------------------------

   what need to be done for UI improvements:
   1. disable button when they are not eligible (redo, undo, delete)
   2. indicating the current status of tool (selection, draw tools)
   3. add close button on changing weight and color widget
   4. enlarge the drawing board to the whole screen and add on mouse enter event on color, weight change widget 
