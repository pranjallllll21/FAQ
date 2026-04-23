/**
 * SVG Icon Components
 */

export const ChevronDownIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

export const MagnifyingGlassIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.5 5.5a7.5 7.5 0 0010.5 10.5z"
    />
  </svg>
);

export const MicrophoneIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 24 24"
    {...props}
  >
    <path d="M8 2a2 2 0 00-2 2v7a6 6 0 1012 0V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v7a2 2 0 11-4 0V4a2 2 0 00-2 0z" />
    <path d="M8 20a4 4 0 004 4h4a4 4 0 004-4v-2h-4v2a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2H8v2z" />
  </svg>
);

export const XMarkIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const CheckCircleIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M2.25 12c0-6.215 5.034-11.25 11.25-11.25s11.25 5.035 11.25 11.25S19.715 23.25 12 23.25 2.25 18.215 2.25 12zm13.954-1.529L10.5 14.823 8.296 12.62a.75.75 0 00-1.06 1.06l2.75 2.75a.75.75 0 001.06 0l6.5-6.5a.75.75 0 10-1.06-1.061z"
      clipRule="evenodd"
    />
  </svg>
);

export const ExclamationTriangleIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M9.401 3.003c1.492-2.004 4.716-2.004 6.208 0l5.904 7.872c1.492 1.994.277 4.991-1.85 4.991H4.547c-2.127 0-3.342-2.997-1.85-4.991L9.401 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 10-1.5 0 .75.75 0 001.5 0z"
      clipRule="evenodd"
    />
  </svg>
);
