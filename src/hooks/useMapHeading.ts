import { useRef, useCallback } from "react";
import { Animated } from "react-native";

export const useMapHeading = () => {
  const mapHeading = useRef(new Animated.Value(0)).current;
  const internalHeading = useRef(0);
  const lastRawHeading = useRef(0);

  const updateHeading = useCallback(
    (raw: number) => {
      if (typeof raw !== "number") return;

      // Unwrap rotation to prevent 360->0 jumps
      let diff = raw - (internalHeading.current % 360);
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;

      internalHeading.current += diff;

      // Use spring with high tension for "attached" feel but smooth motion
      Animated.spring(mapHeading, {
        toValue: internalHeading.current,
        useNativeDriver: true,
        tension: 200,
        friction: 25,
        restSpeedThreshold: 0.1,
        restDisplacementThreshold: 0.1,
      }).start();
    },
    [mapHeading],
  );

  const resetHeading = useCallback(() => {
    // Reset to nearest zero point
    const currentVal = internalHeading.current;
    const target = Math.round(currentVal / 360) * 360;
    internalHeading.current = target;
    lastRawHeading.current = 0;
    Animated.spring(mapHeading, {
      toValue: target,
      useNativeDriver: true,
    }).start();
  }, [mapHeading]);

  return {
    mapHeading,
    internalHeading,
    updateHeading,
    resetHeading,
  };
};
