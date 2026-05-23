import React from 'react';

// Star Icon component for premium rating rendering
const StarIcon = ({ filled }) => (
    <svg 
        className={`w-4.5 h-4.5 transition-colors duration-200 ${filled ? 'text-amber-400 fill-current' : 'text-gray-200'}`} 
        viewBox="0 0 20 20" 
        fill="currentColor"
    >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const LeafIcon = () => (
    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 7a5 5 0 100 10 5 5 0 000-10z" />
    </svg>
);

export default function Sidebar({ filters, setFilters, categories }) {
    const handleFilterChange = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const resetAllFilters = () => {
        setFilters({
            price: '',
            category: 'All',
            rating: '0',
            ecoPoints: ''
        });
    };

    const isFiltered = filters.price !== '' || filters.category !== 'All' || filters.rating !== '0' || filters.ecoPoints !== '';

    // Price ranges defined
    const priceOptions = [
        { label: 'All Prices', value: '' },
        { label: 'Under Rs. 2,500', value: '0-2500' },
        { label: 'Rs. 2,500 - Rs. 5,000', value: '2500-5000' },
        { label: 'Rs. 5,000 - Rs. 10,000', value: '5000-10000' },
        { label: 'Over Rs. 10,000', value: '10000-Infinity' },
    ];

    // EcoPoints ranges defined
    const ecoPointsOptions = [
        { label: 'Any EcoPoints', value: '' },
        { label: '0 - 100 EP', value: '0-100' },
        { label: '100 - 500 EP', value: '100-500' },
        { label: '500 - 1000 EP', value: '500-1000' },
        { label: '1,000+ EP', value: '1000-Infinity' },
    ];

    return (
        <aside className="w-full md:w-80 p-6 bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-100/50 flex flex-col gap-6 select-none self-start">
            {/* Sidebar Header */}
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <LeafIcon />
                    <h2 className="text-xl font-extrabold text-gray-800 tracking-tight">Filters</h2>
                </div>
                {isFiltered && (
                    <button 
                        onClick={resetAllFilters}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer"
                    >
                        Reset All
                    </button>
                )}
            </div>

            {/* Category Filter */}
            <div className="flex flex-col gap-2.5">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Categories</h3>
                <div className="flex flex-col gap-1.5">
                    <button
                        onClick={() => handleFilterChange('category', 'All')}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-between cursor-pointer group ${
                            filters.category === 'All'
                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                        }`}
                    >
                        <span>All Categories</span>
                        <span className={`text-xs px-2 py-0.5 rounded-md font-bold transition-all ${
                            filters.category === 'All' ? 'bg-emerald-700 text-emerald-100' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                        }`}>
                            ★
                        </span>
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => handleFilterChange('category', cat)}
                            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-between cursor-pointer group ${
                                filters.category === cat
                                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                            }`}
                        >
                            <span className="capitalize">{cat}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Price Filter */}
            <div className="flex flex-col gap-2.5 pt-2 border-t border-gray-50">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Price Range</h3>
                <div className="flex flex-col gap-1">
                    {priceOptions.map(option => (
                        <label 
                            key={option.value}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 border ${
                                filters.price === option.value 
                                    ? 'bg-emerald-50/50 border-emerald-200' 
                                    : 'border-transparent hover:bg-gray-50/50'
                            }`}
                        >
                            <input 
                                type="radio" 
                                name="price-group" 
                                value={option.value}
                                checked={filters.price === option.value}
                                onChange={() => handleFilterChange('price', option.value)}
                                className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 focus:ring-emerald-500 focus:ring-2 cursor-pointer accent-emerald-600"
                            />
                            <span className={`text-sm font-medium transition-colors ${
                                filters.price === option.value ? 'text-emerald-900 font-semibold' : 'text-gray-600'
                            }`}>
                                {option.label}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Rating Filter */}
            <div className="flex flex-col gap-2.5 pt-2 border-t border-gray-50">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Minimum Rating</h3>
                <div className="flex flex-col gap-1">
                    {['0', '4', '3', '2', '1'].map(stars => {
                        const starsNum = parseInt(stars);
                        const isSelected = filters.rating === stars;
                        return (
                            <button
                                key={stars}
                                onClick={() => handleFilterChange('rating', stars)}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 border cursor-pointer ${
                                    isSelected
                                        ? 'bg-emerald-50/50 border-emerald-200'
                                        : 'border-transparent hover:bg-gray-50/50'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    {starsNum === 0 ? (
                                        <span className={`text-sm font-medium ${isSelected ? 'text-emerald-950 font-semibold' : 'text-gray-600'}`}>
                                            Any Rating
                                        </span>
                                    ) : (
                                        <div className="flex gap-0.5">
                                            {[1, 2, 3, 4, 5].map(idx => (
                                                <StarIcon key={idx} filled={idx <= starsNum} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {starsNum > 0 && (
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                                        isSelected ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                        & Up
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* EcoPoints Filter */}
            <div className="flex flex-col gap-2.5 pt-2 border-t border-gray-50">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">EcoPoints</h3>
                <div className="flex flex-wrap gap-2">
                    {ecoPointsOptions.map(option => {
                        const isSelected = filters.ecoPoints === option.value;
                        return (
                            <button
                                key={option.value}
                                onClick={() => handleFilterChange('ecoPoints', option.value)}
                                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer border ${
                                    isSelected
                                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/20'
                                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                {option.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </aside>
    );
}