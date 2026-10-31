import PropTypes from 'prop-types';
import { Box } from '@chakra-ui/react';

// Inline SVG flags: flag emoji are not rendered on Windows, and react-icons has no country flags.
const FLAGS = {
  en: (
    <svg viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">
      <clipPath id="flag-en-box"><path d="M0,0 v30 h60 v-30 z" /></clipPath>
      <clipPath id="flag-en-diag"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" /></clipPath>
      <g clipPath="url(#flag-en-box)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#flag-en-diag)" stroke="#C8102E" strokeWidth="4" />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  ),
  pl: (
    <svg viewBox="0 0 16 10" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">
      <rect width="16" height="5" fill="#fff" />
      <rect y="5" width="16" height="5" fill="#DC143C" />
    </svg>
  ),
};

/** Round flag icon for a language code. */
export default function LanguageFlag({ code, size = "22px" }) {
  return (
    <Box
      boxSize={size}
      borderRadius="full"
      overflow="hidden"
      boxShadow="0 0 0 1px rgba(128,128,128,0.5)"
      aria-hidden="true"
    >
      {FLAGS[code]}
    </Box>
  );
}

LanguageFlag.propTypes = {
  code: PropTypes.string.isRequired,
  size: PropTypes.string,
};
