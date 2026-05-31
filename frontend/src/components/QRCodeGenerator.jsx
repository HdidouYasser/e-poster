import React from 'react';
import QRCode from 'qrcode.react';
import { Download } from 'lucide-react';

export const QRCodeGenerator = ({ 
  value, 
  size = 200, 
  level = 'H', 
  includeMargin = true,
  title = null,
  downloadable = true 
}) => {
  const qrRef = React.useRef();

  const handleDownload = () => {
    const url = qrRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `qrcode-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {title && <p className="font-semibold text-gray-700">{title}</p>}
      
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <QRCode
          ref={qrRef}
          value={value}
          size={size}
          level={level}
          includeMargin={includeMargin}
          quietZone={10}
        />
      </div>

      {downloadable && (
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          <Download size={16} />
          Télécharger
        </button>
      )}
    </div>
  );
};

export default QRCodeGenerator;
