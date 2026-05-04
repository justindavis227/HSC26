import { useState } from 'react';

export const MY_CAMPUS_KEY = 'myCampus';

export function useMyCampus() {
  const [myCampus, setState] = useState<string>(
    () => localStorage.getItem(MY_CAMPUS_KEY) ?? ''
  );

  function setMyCampus(campus: string) {
    if (campus) localStorage.setItem(MY_CAMPUS_KEY, campus);
    else localStorage.removeItem(MY_CAMPUS_KEY);
    setState(campus);
  }

  return { myCampus, setMyCampus };
}
