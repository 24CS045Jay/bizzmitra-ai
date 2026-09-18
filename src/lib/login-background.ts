import grid01 from "@/assets/images/login-background/grid-01.jpg";
import grid02 from "@/assets/images/login-background/grid-02.jpg";
import grid03 from "@/assets/images/login-background/grid-03.jpg";
import grid04 from "@/assets/images/login-background/grid-04.jpg";
import grid05 from "@/assets/images/login-background/grid-05.jpg";
import grid06 from "@/assets/images/login-background/grid-06.jpg";
import grid07 from "@/assets/images/login-background/grid-07.jpg";
import grid08 from "@/assets/images/login-background/grid-08.jpg";
import grid09 from "@/assets/images/login-background/grid-09.jpg";
import grid10 from "@/assets/images/login-background/grid-10.jpg";
import grid11 from "@/assets/images/login-background/grid-11.jpg";

export const loginBackgroundImages = [
  grid01,
  grid02,
  grid03,
  grid04,
  grid05,
  grid06,
  grid07,
  grid08,
  grid09,
  grid10,
  grid11,
];

// Cycle through the images until all 28 grid cells are filled for GridMotion parallax
export const gridMotionItems: string[] = Array.from(
  { length: 28 },
  (_, index) => loginBackgroundImages[index % loginBackgroundImages.length]!,
);
