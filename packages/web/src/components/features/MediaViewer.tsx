import React, { useState } from 'react';
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export interface MediaViewerProps {
  isOpen: boolean;
  onClose: () => void;
  mediaType: 'screenshot' | 'video';
  mediaUrl: string;
  mediaList?: string[];
  currentIndex?: number;
  onNavigate?: (index: number) => void;
}

export function MediaViewer({
  isOpen,
  onClose,
  mediaType,
  mediaUrl,
  mediaList = [],
  currentIndex = 0,
  onNavigate,
}: MediaViewerProps) {
  const [imageScale, setImageScale] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);

  const handleZoomIn = () => {
    setImageScale((prev) => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setImageScale((prev) => Math.max(prev / 1.2, 0.5));
  };

  const handleRotate = () => {
    setImageRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setImageScale(1);
    setImageRotation(0);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = mediaUrl;
    link.download = `${mediaType}-${Date.now()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrevious = () => {
    if (onNavigate && currentIndex > 0) {
      onNavigate(currentIndex - 1);
      handleReset();
    }
  };

  const handleNext = () => {
    if (onNavigate && currentIndex < mediaList.length - 1) {
      onNavigate(currentIndex + 1);
      handleReset();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        handlePrevious();
        break;
      case 'ArrowRight':
        e.preventDefault();
        handleNext();
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
      case '+':
      case '=':
        e.preventDefault();
        handleZoomIn();
        break;
      case '-':
        e.preventDefault();
        handleZoomOut();
        break;
      case 'r':
      case 'R':
        e.preventDefault();
        handleRotate();
        break;
    }
  };

  const canNavigate = mediaList.length > 1;
  const hasPrevious = canNavigate && currentIndex > 0;
  const hasNext = canNavigate && currentIndex < mediaList.length - 1;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      showCloseButton={false}
      closeOnOverlayClick={false}
    >
      <div
        className="fixed inset-0 bg-black bg-opacity-95 flex flex-col"
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gray-900/80 backdrop-blur-sm">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-medium text-white capitalize">
              {mediaType} Viewer
            </h3>
            {canNavigate && (
              <span className="text-sm text-gray-400">
                {currentIndex + 1} of {mediaList.length}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Navigation Controls */}
            {canNavigate && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={ChevronLeft}
                  onClick={handlePrevious}
                  disabled={!hasPrevious}
                  className="text-white hover:bg-gray-700"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  icon={ChevronRight}
                  onClick={handleNext}
                  disabled={!hasNext}
                  className="text-white hover:bg-gray-700"
                />
              </>
            )}

            {/* Image Controls */}
            {mediaType === 'screenshot' && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={ZoomOut}
                  onClick={handleZoomOut}
                  disabled={imageScale <= 0.5}
                  className="text-white hover:bg-gray-700"
                />
                <span className="text-sm text-gray-400 min-w-[3rem] text-center">
                  {Math.round(imageScale * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={ZoomIn}
                  onClick={handleZoomIn}
                  disabled={imageScale >= 3}
                  className="text-white hover:bg-gray-700"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  icon={RotateCw}
                  onClick={handleRotate}
                  className="text-white hover:bg-gray-700"
                />
              </>
            )}

            {/* Download */}
            <Button
              variant="ghost"
              size="sm"
              icon={Download}
              onClick={handleDownload}
              className="text-white hover:bg-gray-700"
            />

            {/* Close */}
            <Button
              variant="ghost"
              size="sm"
              icon={X}
              onClick={onClose}
              className="text-white hover:bg-gray-700"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
          {mediaType === 'screenshot' ? (
            <div className="relative max-w-full max-h-full overflow-auto">
              <img
                src={mediaUrl}
                alt="Screenshot"
                className="max-w-none transition-transform duration-200"
                style={{
                  transform: `scale(${imageScale}) rotate(${imageRotation}deg)`,
                  transformOrigin: 'center',
                }}
                onError={(e) => {
                  // eslint-disable-next-line no-undef
                  const target = e.target as HTMLImageElement;
                  target.src =
                    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzM3NDE1MSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Q0E0QUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+';
                }}
              />
            </div>
          ) : (
            <video
              src={mediaUrl}
              controls
              className="max-w-full max-h-full"
              onError={(e) => {
                // eslint-disable-next-line no-undef
                const target = e.target as HTMLVideoElement;
                target.style.display = 'none';
                const errorDiv = document.createElement('div');
                errorDiv.className = 'text-center text-gray-400 p-8';
                errorDiv.innerHTML = `
                  <div class="text-lg mb-2">Video not available</div>
                  <div class="text-sm">The video file could not be loaded</div>
                `;
                target.parentNode?.appendChild(errorDiv);
              }}
            />
          )}
        </div>

        {/* Footer with keyboard shortcuts */}
        <div className="p-4 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700">
          <div className="text-xs text-gray-400 text-center space-x-4">
            <span>ESC: Close</span>
            {canNavigate && (
              <>
                <span>← →: Navigate</span>
              </>
            )}
            {mediaType === 'screenshot' && (
              <>
                <span>+/-: Zoom</span>
                <span>R: Rotate</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
