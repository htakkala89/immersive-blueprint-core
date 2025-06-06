interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export function LoadingOverlay({ isVisible, message = "Processing..." }: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="bg-black bg-opacity-80 border border-blue-500 border-opacity-30 rounded-lg p-6 flex flex-col items-center space-y-4">
        {/* Animated Loading Spinner */}
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-500 border-opacity-20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        
        {/* Loading Message */}
        <div className="text-center">
          <p className="text-white text-lg font-medium drop-shadow-lg">{message}</p>
          <p className="text-blue-300 text-sm mt-1 drop-shadow-lg">AI is generating your adventure...</p>
        </div>
        
        {/* Animated Dots */}
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}