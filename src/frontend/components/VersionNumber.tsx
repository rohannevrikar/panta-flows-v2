
import React from 'react';

// You can update this version number as needed
const VERSION = 'v1.0.0';

const VersionNumber = () => {
  return (
    <div className="fixed bottom-2 right-2 text-xs text-gray-500 opacity-70">
      {VERSION}
    </div>
  );
};

export default VersionNumber;
