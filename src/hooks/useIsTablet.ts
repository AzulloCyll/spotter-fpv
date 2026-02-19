import { useWindowDimensions } from 'react-native';

/**
 * Hook to determine if the device is currently in tablet landscape mode
 * (Width > Height and Width > 800)
 */
export const useIsTablet = () => {
  const { width, height } = useWindowDimensions();
  const isTabletLandscape = width > height && width > 800;

  return {
    isTabletLandscape,
    width,
    height,
    // Add other breakpoints if needed
    isSmallPhone: width < 380,
    sidebarWidth: isTabletLandscape ? Math.min(width * 0.3, 400) : 0,
  };
};
