import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Link as LinkIcon, Loader2 } from 'lucide-react';
import { uploadImage } from '../../lib/storage';

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  helperText?: string;
  aspectRatio?: 'square' | 'video' | 'any';
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  value,
  onChange,
  helperText,
  aspectRatio = 'any',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [urlMode, setUrlMode] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (< 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit. Please choose a smaller image.');
      return;
    }

    // Validate type
    if (!file.type.startsWith('image/')) {
      alert('Only image files (JPEG, PNG, WebP, SVG) are supported.');
      return;
    }

    try {
      setIsUploading(true);
      const uploadedUrl = await uploadImage(file);
      onChange(uploadedUrl);
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to process image. Please try again or provide an image URL.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleApplyUrl = () => {
    if (manualUrl.trim()) {
      onChange(manualUrl.trim());
      setManualUrl('');
      setUrlMode(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-neutral-800 uppercase tracking-wider">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setUrlMode(!urlMode)}
          className="text-xs text-neutral-500 hover:text-black flex items-center gap-1 underline transition-colors"
        >
          {urlMode ? 'Upload from device' : 'Use image URL'}
        </button>
      </div>

      {urlMode ? (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-300 focus:outline-none focus:border-black transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={handleApplyUrl}
            className="px-4 py-2 bg-black text-white text-xs font-medium hover:bg-neutral-800 transition-colors"
          >
            Apply
          </button>
        </div>
      ) : (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {value ? (
            <div className="relative border border-neutral-300 p-2 bg-neutral-50 group">
              <div
                className={`w-full overflow-hidden bg-neutral-200 flex items-center justify-center ${
                  aspectRatio === 'square'
                    ? 'aspect-square max-w-[200px]'
                    : aspectRatio === 'video'
                    ? 'aspect-video'
                    : 'max-h-56'
                }`}
              >
                <img
                  src={value}
                  alt={label}
                  className="w-full h-full object-cover transition-transform group-hover:scale-[1.02] duration-300"
                />
              </div>

              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-3 py-1.5 bg-black/85 text-white text-xs font-medium hover:bg-black transition-colors flex items-center gap-1.5 shadow-md"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Replace
                </button>
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="p-1.5 bg-black/85 text-white hover:bg-black transition-colors shadow-md"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className="border-2 border-dashed border-neutral-300 hover:border-black p-6 text-center cursor-pointer transition-colors bg-white hover:bg-neutral-50 flex flex-col items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin text-neutral-900" />
                  <span className="text-xs text-neutral-600">Uploading & processing image...</span>
                </>
              ) : (
                <>
                  <div className="p-3 bg-neutral-100 rounded-none border border-neutral-200">
                    <ImageIcon className="w-6 h-6 text-neutral-700" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-neutral-900 underline">Click to upload image</span>
                    <span className="text-xs text-neutral-500 block mt-0.5">PNG, JPG, WebP up to 10MB</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {helperText && <p className="text-[11px] text-neutral-500">{helperText}</p>}
    </div>
  );
};
