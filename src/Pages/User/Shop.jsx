import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../../Components/Navbar';
import Sidebar from '../../Components/Sidebar';
import ProductCard from '../../Components/ProductCard';
import Pagination from '../../Components/Pagination';
import { LoadingScreen, LoadingOverlay, ProductSkeletonGrid } from '../../Components/LoadingSpinner';
import { getWishlist } from '../../Service/Buyer.js';
import { getAllProducts } from '../../Service/Product';
import toast from 'react-hot-toast';

export default function Shop() {
    const [wishlist, setWishlist] = useState([]);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [totalProducts, setTotalProducts] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [initialLoading, setInitialLoading] = useState(true);
    const [sortBy, setSortBy] = useState('title-asc');
    const [filters, setFilters] = useState({
        price: '',
        category: 'All',
        rating: '0',
        ecoPoints: ''
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage] = useState(9);

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const searchTerm = searchParams.get('search') || '';

    const fetchPageData = useCallback(async () => {
        setLoading(true);
        try {
            const userData = JSON.parse(localStorage.getItem('user'));
            if (!userData || !userData.token) {
                toast.error("Please login to access the shop.");
                navigate('/login');
                return;
            }

            const queryParams = {
                category: filters.category,
                price: filters.price,
                rating: filters.rating,
                ecoPoints: filters.ecoPoints,
                sortBy,
                page: currentPage,
                limit: productsPerPage,
                search: searchTerm
            };

            const [productsResult, wishlistData] = await Promise.all([
                getAllProducts(queryParams),
                getWishlist()
            ]);

            const productList = Array.isArray(productsResult)
                ? productsResult
                : (productsResult?.products || []);
            const total = Array.isArray(productsResult)
                ? productsResult.length
                : (productsResult?.totalProducts ?? productList.length);
            const pages = Array.isArray(productsResult)
                ? Math.ceil(productsResult.length / productsPerPage) || 1
                : (productsResult?.totalPages || 1);

            setProducts(productList);
            setTotalProducts(total);
            setTotalPages(pages);
            if (productsResult?.categories) {
                setCategories(productsResult.categories);
            } else if (Array.isArray(productsResult)) {
                const uniqueCategories = [...new Set(productsResult.map(p => p.Category).filter(Boolean))];
                setCategories(uniqueCategories);
            }
            setWishlist(wishlistData?.products || []);
        } catch (error) {
            toast.error(error.message || "Could not fetch page data.");
        } finally {
            setLoading(false);
            setInitialLoading(false);
        }
    }, [navigate, filters, sortBy, currentPage, productsPerPage, searchTerm]);

    useEffect(() => {
        fetchPageData();
    }, [fetchPageData]);

    // Reset pagination to first page when filtering, sorting, or search criteria change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters, sortBy, searchTerm]);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (initialLoading) {
        return (
            <div className="bg-gray-50 min-h-screen">
                <Navbar />
                <LoadingScreen message="Loading EcoCart Shop..." subMessage="Fetching the latest eco-friendly items..." fullScreen={false} className="min-h-[80vh]" />
            </div>
        );
    }

    const startRange = (currentPage - 1) * productsPerPage + 1;
    const endRange = Math.min(currentPage * productsPerPage, totalProducts);

    return (
        <div className="bg-gray-50 min-h-screen">
            <Navbar />
            <main className="container mx-auto px-6 py-8 flex flex-col md:flex-row gap-8">
                <Sidebar filters={filters} setFilters={setFilters} categories={categories} />
                <div className="w-full">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex flex-col gap-1">
                            <p className="text-gray-600">
                                Showing <span className="font-bold">{products.length > 0 ? `${startRange}-${endRange}` : '0'}</span> of <span className="font-bold">{totalProducts}</span> Products
                            </p>
                            {searchTerm && (
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-2 select-none">
                                        Search: <strong className="font-semibold">"{searchTerm}"</strong>
                                        <button 
                                            onClick={() => navigate('/shop')} 
                                            className="text-emerald-600 hover:text-emerald-800 font-bold ml-1 cursor-pointer focus:outline-none"
                                            title="Clear search"
                                        >
                                            &times;
                                        </button>
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center space-x-2">
                            <label htmlFor="sort" className="text-gray-600">Sort By</label>
                            <select id="sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="p-2 border rounded-md">
                                <option value="title-asc">Title (A-Z)</option>
                                <option value="title-desc">Title (Z-A)</option>
                                <option value="price-asc">Price (Low to High)</option>
                                <option value="price-desc">Price (High to Low)</option>
                            </select>
                        </div>
                    </div>

                    {/* Products Grid with Overlay Spinner on action update */}
                    <div className="relative min-h-[300px]">
                        {loading && (
                            <LoadingOverlay message="Updating products..." />
                        )}

                        {products.length > 0 ? (
                            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                                {products.map(product => (
                                    <ProductCard 
                                        key={product._id} 
                                        product={product} 
                                        wishlistItems={wishlist}
                                        refreshWishlist={fetchPageData}
                                    />
                                ))}
                            </div>
                        ) : (
                            !loading && <p className="text-center text-gray-500 mt-12 bg-white p-8 rounded-xl shadow-sm border border-gray-100">No products match your filters.</p>
                        )}
                    </div>

                    <Pagination 
                        productsPerPage={productsPerPage}
                        totalProducts={totalProducts}
                        paginate={paginate}
                        currentPage={currentPage}
                    />
                </div>
            </main>
        </div>
    );
}