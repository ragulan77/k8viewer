import { Position, Toaster, Intent } from "@blueprintjs/core";

export const MyToaster = Toaster.create({
  className: "recipe-toaster",
  position: Position.TOP
});

export const MyToasterBottomRight = Toaster.create({
  className: "recipe-toaster",
  position: Position.BOTTOM_RIGHT
});

export const toasterSuccessMsg = message => {
  MyToaster.show({
    message: message,
    icon: "tick",
    intent: Intent.SUCCESS
  });
};

export const toasterErrorMsg = message => {
  MyToaster.show({
    message: message,
    icon: "warning-sign",
    intent: Intent.DANGER
  });
};

export const toasterInfoMsg = message => {
  MyToasterBottomRight.show({
    message: message,
    icon: "info-sign"
  });
};
