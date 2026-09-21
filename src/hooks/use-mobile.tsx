import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export type DeviceClass = "phone" | "tablet" | "desktop";

export function getDeviceClass(width: number): DeviceClass {
  if (width < 640) return "phone";
  if (width < 1024) return "tablet";
  return "desktop";
}

export function useDeviceClass(): DeviceClass {
  const [deviceClass, setDeviceClass] = React.useState<DeviceClass>(() => {
    if (typeof window === "undefined") return "desktop";
    return getDeviceClass(window.innerWidth);
  });

  React.useEffect(() => {
    const handleResize = () => {
      setDeviceClass(getDeviceClass(window.innerWidth));
    };
    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return deviceClass;
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}

