import React from 'react';

/**
 * Modern SVG Inline Spinner
 */
export function LoadingSpinner({ size = 'md', color = 'teal', className = '' }) {
    const sizeMap = {
        xs: 'w-3.5 h-3.5 border-2',
        sm: 'w-4 h-4 border-2',
        md: 'w-6 h-6 border-[2.5px]',
        lg: 'w-9 h-9 border-[3px]',
        xl: 'w-12 h-12 border-4',
    };

    const colorMap = {
        teal: 'border-teal-200 border-t-teal-600',
        emerald: 'border-emerald-200 border-t-emerald-600',
        white: 'border-white/30 border-t-white',
        gray: 'border-gray-200 border-t-gray-600',
        current: 'border-current/25 border-t-current',
    };

    const sizeClass = sizeMap[size] || sizeMap.md;
    const colorClass = colorMap[color] || colorMap.teal;

    return (
        <span
            className={`inline-block rounded-full animate-spin ${sizeClass} ${colorClass} ${className}`}
            role="status"
            aria-label="loading"
        />
    );
}

/**
 * Animated Eco Leaf Icon for branded loading states
 */
export function EcoLeafIcon({ className = "w-8 h-8 text-teal-600" }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </svg>
    );
}

/**
 * Full page or full-container EcoCart Loading Screen
 */
export function LoadingScreen({
    message = "Loading...",
    subMessage = "Gathering eco-friendly essentials...",
    fullScreen = true,
    className = ""
}) {
    const containerClasses = fullScreen
        ? "fixed inset-0 z-50 flex items-center justify-center bg-gray-50/90 backdrop-blur-sm"
        : `flex flex-col items-center justify-center py-16 px-4 w-full ${className}`;

    return (
        <div className={containerClasses} role="alert" aria-busy="true">
            <div className="flex flex-col items-center text-center p-8 max-w-sm">
                {/* Glowing animated loader badge */}
                <div className="relative mb-6 flex items-center justify-center">
                    {/* Glowing aura */}
                    <div className="absolute w-20 h-20 bg-teal-400/20 rounded-full blur-xl animate-pulse-glow" />
                    
                    {/* Outer spinning ring */}
                    <div className="w-16 h-16 rounded-full border-3 border-teal-100 border-t-teal-600 border-r-emerald-500 animate-spin" />
                    
                    {/* Inner floating leaf */}
                    <div className="absolute inset-0 flex items-center justify-center animate-float-leaf">
                        <EcoLeafIcon className="w-7 h-7 text-teal-600 drop-shadow-sm" />
                    </div>
                </div>

                {/* Animated Loading Text */}
                <h3 className="text-lg font-bold text-gray-800 tracking-wide flex items-center gap-1">
                    <span>{message}</span>
                    <span className="flex space-x-1 ml-0.5">
                        <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce"></span>
                    </span>
                </h3>

                {subMessage && (
                    <p className="text-xs text-gray-500 mt-2 font-medium">
                        {subMessage}
                    </p>
                )}
            </div>
        </div>
    );
}

/**
 * Translucent overlay loader for container/section updates (e.g. filtering, updating cart, pagination)
 */
export function LoadingOverlay({
    message = "Updating...",
    className = ""
}) {
    return (
        <div
            className={`absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/75 backdrop-blur-[2px] rounded-xl transition-all duration-200 ${className}`}
            role="status"
            aria-busy="true"
        >
            <div className="flex flex-col items-center gap-3 bg-white/95 px-6 py-4 rounded-2xl shadow-lg border border-teal-50">
                <div className="relative flex items-center justify-center">
                    <div className="w-9 h-9 rounded-full border-3 border-teal-100 border-t-teal-600 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <EcoLeafIcon className="w-4 h-4 text-teal-600" />
                    </div>
                </div>
                {message && (
                    <p className="text-xs font-semibold text-gray-700 tracking-wide">
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
}

/**
 * Product Card Shimmer Skeleton
 */
export function ProductSkeletonCard() {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            {/* Image placeholder */}
            <div className="w-full h-48 animate-shimmer" />
            
            {/* Content placeholder */}
            <div className="p-4 flex flex-col flex-grow gap-3">
                <div className="h-4 w-3/4 rounded-md animate-shimmer" />
                <div className="h-3 w-1/2 rounded-md animate-shimmer" />
                
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                    <div className="h-5 w-20 rounded-md animate-shimmer" />
                    <div className="h-8 w-24 rounded-lg animate-shimmer" />
                </div>
            </div>
        </div>
    );
}

/**
 * Grid of Product Skeleton Cards for Shop/Home
 */
export function ProductSkeletonGrid({ count = 6 }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, index) => (
                <ProductSkeletonCard key={index} />
            ))}
        </div>
    );
}

export default LoadingSpinner;
