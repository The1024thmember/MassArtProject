# MassArtProject
figma link: https://www.figma.com/file/JK4el75XZFm8BKcGZotYTt/landingPage?node-id=1%3A2
click up link: https://app.clickup.com/42088340/v/b/184dwm-80
# MassArtProject


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
