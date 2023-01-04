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
  }
  return { top: topFromCanvas, left: leftFromCanvas } as PositionType;
}
