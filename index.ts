import { registerRootComponent } from 'expo';
import App from './App';

// Fix for "non-passive event listener" warning on web
if (typeof window !== 'undefined') {
  const originalAddEventListener = window.addEventListener;
  window.addEventListener = function (type: any, listener: any, options: any) {
    let modOptions = options;
    if (
      type === 'wheel' ||
      type === 'mousewheel' ||
      type === 'touchstart' ||
      type === 'touchmove'
    ) {
      if (typeof options === 'boolean') {
        modOptions = { capture: options, passive: true };
      } else if (typeof options === 'object') {
        modOptions = {
          ...options,
          passive: options.passive !== undefined ? options.passive : true,
        };
      } else {
        modOptions = { passive: true };
      }
    }
    return originalAddEventListener.call(this, type, listener, modOptions);
  };
}

registerRootComponent(App);
