interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export function LoadingOverlay({ isVisible, message = "Processing..." }: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-40">
      <div className="bg-black bg-opacity-80 border border-blue-500 border-opacity-30 rounded-lg p-4 flex items-center space-x-3">
        {/* Animated Loading Spinner */}
        <div className="relative">
          <div className="w-6 h-6 border-2 border-blue-500 border-opacity-20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        
        {/* Loading Message */}
        <div className="text-center">
          <p className="text-white text-sm font-medium drop-shadow-lg">{message}</p>
        </div>
        
        {/* Animated Dots */}
        <div className="flex space-x-1">
          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}