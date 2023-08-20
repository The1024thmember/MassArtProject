import { fabric } from 'fabric';
import { Observable, isObservable, of } from 'rxjs';

export function isDefined<T>(x: T): x is NonNullable<T> {
  return x !== undefined && x !== null;
}

export function toObservable<T>(x$: T | Observable<T>): Observable<T> {
  return isObservable(x$) ? x$ : of(x$);
}

export function arrayIsShallowEqual<T>(
  a?: readonly T[],
  b?: readonly T[]
): boolean {
  return Boolean(
    a &&
      b &&
      a.length === b.length &&
      a.every((entity, index) => entity === b[index])
  );
}

export interface PositionType {
  readonly top: number;
  readonly left: number;
}

export function getObjectAbsolutePosition(
  canvasObject: fabric.Object
): PositionType {
  // Getting the position of the object, if its group selection, then need to do calculation
  // refer to: https://stackoverflow.com/a/29926545

  let topFromCanvas = canvasObject.top ? canvasObject.top : 0;
  let leftFromCanvas = canvasObject.left ? canvasObject.left : 0;

  if (canvasObject.group) {
    const leftFromGroup = canvasObject.group.left ? canvasObject.group.left : 0;
    const widthOfGroup = canvasObject.group.width
      ? canvasObject.group.width
      : 0;
    const topFromGroup = canvasObject.group.top ? canvasObject.group.top : 0;
    const heightOfGroup = canvasObject.group.height
      ? canvasObject.group.height
      : 0;

    topFromCanvas = topFromGroup + topFromCanvas + heightOfGroup / 2;
    leftFromCanvas = leftFromGroup + leftFromCanvas + widthOfGroup / 2;

    if (canvasObject.group.angle) {
      let centerX = leftFromGroup;
      let centerY = topFromGroup;

      // If there is a rotation angle refre to: https://gamefromscratch.com/gamedev-math-recipes-rotating-one-point-around-another-point/
      let angle = canvasObject.group.angle ? canvasObject.group.angle : 0;
      let angleRadians = (angle * Math.PI) / 180;
      let generalPositionX =
        Math.cos(angleRadians) * (leftFromCanvas - centerX) -
        Math.sin(angleRadians) * (topFromCanvas - centerY) +
        centerX;
      let generalPositionY =
        Math.sin(angleRadians) * (leftFromCanvas - centerX) +
        Math.cos(angleRadians) * (topFromCanvas - centerY) +
        centerY;

      topFromCanvas = generalPositionY;
      leftFromCanvas = generalPositionX;
    }

    // Scale is based on center, so it should be group center to object center distance scaled up
    const heightOfObject = canvasObject.height ? canvasObject.height : 0;
    const widthOfObject = canvasObject.width ? canvasObject.width : 0;

    const scaleX = canvasObject.group.scaleX ? canvasObject.group.scaleX : 1;
    const scaleY = canvasObject.group.scaleY ? canvasObject.group.scaleY : 1;

    const center2centerDistanceX = leftFromCanvas + widthOfObject / 2; //centerX of object to canvas
    const center2centerDistanceY = topFromCanvas + heightOfObject / 2; //centerY of object to canvas

    const scaledObjectCenterX = center2centerDistanceX * scaleX;
    const scaledObjectCenterY = center2centerDistanceY * scaleY;

    const leftFromGroupCenter =
      leftFromCanvas * scaleX - (scaleX - 1) * leftFromGroup;
    const topFromGroupCenter =
      topFromCanvas * scaleY - (scaleY - 1) * topFromGroup;

    topFromCanvas = topFromGroupCenter;
    leftFromCanvas = leftFromGroupCenter;
  }

  return { top: topFromCanvas, left: leftFromCanvas } as PositionType;
}
