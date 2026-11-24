import React from 'react';

const paths = {
  moon: <><path d="M19.8 14.5A8 8 0 0 1 9.5 4.2a8.2 8.2 0 1 0 10.3 10.3Z"/><path d="m17.9 3 .6 1.9 1.9.6-1.9.6-.6 1.9-.6-1.9-1.9-.6 1.9-.6z"/></>,
  sun: <><circle cx="12" cy="12" r="3.7"/><path d="M12 2v2.4M12 19.6V22M2 12h2.4m15.2 0H22M4.9 4.9l1.7 1.7m10.8 10.8 1.7 1.7m0-14.2-1.7 1.7M6.6 17.4l-1.7 1.7"/></>,
  sound: <><path d="M3.5 9h4.2l5.1-4.4v14.8L7.7 15H3.5zM16 8.2a5.6 5.6 0 0 1 0 7.6m2.6-10.2a9.1 9.1 0 0 1 0 12.8"/></>,
  stop: <rect x="6.3" y="6.3" width="11.4" height="11.4" rx="2"/>,
  bell: <><path d="M5.1 16.1h13.8c-1.4-1.7-2.2-3-2.2-6a4.7 4.7 0 1 0-9.4 0c0 3-.8 4.3-2.2 6Z"/><path d="M10.2 19a2.1 2.1 0 0 0 3.6 0M12 3v1.3"/></>,
  sparkle: <><path d="M12 2.7c.8 5.6 3.7 8.5 9.3 9.3-5.6.8-8.5 3.7-9.3 9.3C11.2 15.7 8.3 12.8 2.7 12c5.6-.8 8.5-3.7 9.3-9.3Z"/></>,
  repeat: <><path d="M4.2 10.6a8 8 0 1 1 1.9 6.9M3.6 5.9v5.2h5.2M12 7.7v4.7l3 1.6"/></>,
  leaf: <><path d="M4 18c0-9 5-14 15.7-14.3.2 10.2-4.7 15.4-12.8 14.7M3.7 20.4l11-11"/></>,
  pencil: <><path d="m4.5 16 11-11a2 2 0 0 1 3 3l-11 11-4 1zM14.1 6.4l3.5 3.5"/></>,
};
export function Icon({name, size = 22}) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export function ForestMark() {
  return <svg className="forest-mark" aria-hidden="true" width="34" height="34" viewBox="0 0 40 40" fill="none">
    <path d="M19.6 2.7C13 7.9 6 9.8 5.1 10.2v10.1c.3 7.3 5.7 12.5 14.5 16.9 8.8-4.4 14.3-9.7 14.6-16.9V10.2c-4.3-1.1-10.1-4.1-14.6-7.5Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="m20 8.5-5.1 7.2h2.7l-5 6.1h3l-4 5.4h6.9v4h3v-4h6.9l-4-5.4h3l-5-6.1h2.7Z" fill="currentColor"/>
    <path d="M9.3 14.9v3m-1.5-1.5h3m18.1.5v2.4m-1.2-1.2h2.4" stroke="currentColor" strokeWidth="1.15"/>
  </svg>;
}
