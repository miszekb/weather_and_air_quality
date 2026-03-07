import React from 'react';
import PropTypes from 'prop-types';
import { Box, CloseButton, useColorModeValue } from '@chakra-ui/react';

const Modal = ({ children, onClose }) => {
  const closeButtonColor = useColorModeValue("gray.600", "whiteAlpha.900");
  const closeButtonHoverColor = useColorModeValue("red.500", "blue.300");

  // Ensure the modal content box also uses dynamic background
  const modalContentBg = useColorModeValue("gray.100", "gray.800");

  return (
    <Box 
      position="fixed" 
      top="0" 
      left="0" 
      width="100%" 
      height="100%" 
      backgroundColor={"rgba(0, 0, 0, 0.6)"} // Use dynamic background color
      display="flex" 
      justifyContent="center" 
      alignItems="center"
      zIndex="9999"
    >
      <Box 
        position="relative" 
        width="90%" 
        maxHeight="80vh" 
        overflowY="hidden"
        p={4} 
        bg={modalContentBg} // Use dynamic background color for content
        borderRadius="md"
        _hover={{ cursor: 'pointer' }} // Optional: change cursor on hover
      >
        {children}
        {/* Custom close button using Box */}
        <Box 
          position="absolute" 
          top="1rem" 
          right="1rem" 
          color={closeButtonColor} // Use dynamic text color
          onClick={onClose} 
          _hover={{ color: closeButtonHoverColor }} // Optional: change color on hover
        >
          <CloseButton />
        </Box>
      </Box>
    </Box>
  );
};

Modal.propTypes = {
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Modal;