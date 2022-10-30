# MassArtProject
figma link: https://www.figma.com/file/JK4el75XZFm8BKcGZotYTt/landingPage?node-id=1%3A2
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

     g) need to add widget for changing the weight for stroke,scrolling bar


  what the user flow should be like?
    create -> create   (free draw is more sutiable)
    create -> modify   (draw object with given tools is more sutiable) : abstract paitning, easy to draw





2. foreground and background issue, how to auto focus on foreground (the color plate and other tools)

Later:
3. how to interact with api? how to fetch and update the background? how big is the canvas?
