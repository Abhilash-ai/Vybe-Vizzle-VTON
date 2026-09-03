import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  label: string;
  sublabel?: string;
  onImageUploaded: (url: string, file: File) => void;
  currentImageUrl?: string;
  aspectRatio?: 'portrait' | 'square';
  uploadHandler?: (file: File) => Promise<{ url: string }>;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  sublabel = 'PNG, JPG, WEBP up to 15MB',
  onImageUploaded,
  currentImageUrl,
  aspectRatio = 'portrait',
  uploadHandler
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = async (file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, WEBP).');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError('File size must be under 15MB.');
      return;
    }

    setIsUploading(true);
    try {
      if (uploadHandler) {
        const res = await uploadHandler(file);
        onImageUploaded(res.url, file);
      } else {
        // Local Object URL preview fallback
        const localUrl = URL.createObjectURL(file);
        onImageUploaded(localUrl, file);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload image.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
          {label}
        </label>
        {currentImageUrl && (
          <span className="text-[11px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Ready
          </span>
        )}
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group cursor-pointer rounded-xl border-2 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center p-4 text-center ${
          aspectRatio === 'portrait' ? 'aspect-[3/4] min-h-[220px]' : 'aspect-square min-h-[180px]'
        } ${
          isDragging
            ? 'border-[#D4AF37] bg-[#D4AF37]/10'
            : currentImageUrl
            ? 'border-white/[0.15] bg-[#121622] hover:border-[#D4AF37]/50'
            : 'border-white/[0.1] bg-[#121622]/60 hover:border-white/30 hover:bg-[#121622]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              processFile(e.target.files[0]);
            }
          }}
        />

        {currentImageUrl ? (
          <div className="relative w-full h-full flex items-center justify-center group/img">
            <img
              src={currentImageUrl}
              alt="Uploaded Preview"
              className="w-full h-full object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 text-center">
              <UploadCloud className="w-8 h-8 text-[#D4AF37] mb-1" />
              <p className="text-xs font-semibold text-white">Click to Replace</p>
              <p className="text-[10px] text-[#94A3B8]">or drag another file</p>
            </div>
          </div>
        ) : isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
            <p className="text-xs text-[#94A3B8]">Processing high-resolution image...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 p-4">
            <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center group-hover:scale-110 transition-transform group-hover:border-[#D4AF37]/40">
              <UploadCloud className="w-6 h-6 text-[#94A3B8] group-hover:text-[#D4AF37] transition-colors" />
            </div>
            <div>
              <p className="text-xs font-medium text-white group-hover:text-[#D4AF37] transition-colors">
                Upload image
              </p>
              <p className="text-[10px] text-[#64748B] mt-0.5">{sublabel}</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 px-3 py-2 rounded-lg border border-rose-500/20">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
