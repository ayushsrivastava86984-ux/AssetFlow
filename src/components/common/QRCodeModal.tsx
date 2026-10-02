import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { Modal } from './Modal';
import { Asset } from '../../types';
import { Printer, Download, Check, ShieldCheck, Tag } from 'lucide-react';

interface QRCodeModalProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ asset, isOpen, onClose }) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (asset && isOpen) {
      const qrPayload = JSON.stringify({
        tag: asset.assetTag,
        id: asset.id,
        name: asset.name,
        sn: asset.serialNumber,
        deptId: asset.departmentId,
        loc: asset.location,
        v: '1.0',
      });

      QRCode.toDataURL(qrPayload, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setDataUrl(url))
        .catch((err) => console.error('QR generation error:', err));
    }
  }, [asset, isOpen]);

  if (!asset) return null;

  const handleDownload = () => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.download = `AssetFlow-${asset.assetTag}-QR.png`;
    link.href = dataUrl;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyTag = () => {
    navigator.clipboard.writeText(asset.assetTag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Asset Identification & QR Tag"
      subtitle={`Tamper-evident scannable barcode for ${asset.assetTag}`}
      maxWidth="md"
    >
      <div className="flex flex-col items-center">
        {/* Printable Asset Tag Badge */}
        <div
          ref={printRef}
          className="w-full bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center shadow-sm relative overflow-hidden"
        >
          {/* Header strip */}
          <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold tracking-tight text-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>ASSETFLOW ENTERPRISE</span>
            </div>
            <span className="text-[10px] font-mono uppercase bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
              Verified Asset
            </span>
          </div>

          {/* QR Code */}
          <div className="p-3 bg-white rounded-lg shadow-inner border border-slate-200">
            {dataUrl ? (
              <img
                src={dataUrl}
                alt={`QR code for ${asset.assetTag}`}
                className="w-48 h-48 object-contain"
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs">
                Generating QR...
              </div>
            )}
          </div>

          {/* Tag details */}
          <div className="mt-4 text-center w-full">
            <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-md mb-2">
              <Tag className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="font-mono text-base font-bold text-slate-900 dark:text-white tracking-widest">
                {asset.assetTag}
              </span>
            </div>

            <h4 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">
              {asset.name}
            </h4>

            <div className="mt-2 grid grid-cols-2 gap-2 text-left text-xs bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300">
              <div>
                <span className="block text-[10px] uppercase text-slate-400 font-medium">Serial No.</span>
                <span className="font-mono font-medium truncate block">{asset.serialNumber}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase text-slate-400 font-medium">Location</span>
                <span className="truncate block">{asset.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5 mt-5 w-full">
          <button
            onClick={handleCopyTag}
            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Tag className="w-4 h-4" />}
            {copied ? 'Tag Copied!' : 'Copy Tag ID'}
          </button>

          <button
            onClick={handleDownload}
            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download Image
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Print Tag
          </button>
        </div>
      </div>
    </Modal>
  );
};
