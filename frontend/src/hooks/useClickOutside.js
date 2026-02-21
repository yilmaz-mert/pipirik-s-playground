// src/hooks/useClickOutside.js
import { useEffect } from 'react';

export function useClickOutside(ref, handler, excludeRefs = []) {
  useEffect(() => {
    const listener = (event) => {
      // Menünün içine tıklandıysa hiçbir şey yapma
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      
      // Hariç tutulan bir yere (örneğin hamburger butonuna) tıklandıysa da bir şey yapma
      for (const excludeRef of excludeRefs) {
        if (excludeRef.current && excludeRef.current.contains(event.target)) {
          return;
        }
      }

      // Yukarıdakilerin hiçbiri değilse (gerçekten dışarı tıklandıysa) menüyü kapat
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, excludeRefs]);
}