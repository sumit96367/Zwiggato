import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { FoodDeliveryHero } from "../components/blocks/food-delivery-hero";
import { FoodOrbitShowcase } from "../components/blocks/food-orbit-showcase";
import { RestaurantCard } from "../components/ui/restaurant-card";
import { Skeleton } from "../components/ui/skeleton";
import { motion } from "framer-motion";

export default function HomePage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async (search = "") => {
    try {
      setLoading(true);
      const response = await api.get("/restaurants", {
        params: search ? { search, limit: 24 } : { limit: 18 },
      });
      setRestaurants(response.data.data.restaurants);
    } catch (error) {
      console.error("Failed to load restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleHeroSearch = (term) => {
    setSearchTerm(term);
    loadRestaurants(term);
  };

  return (
    <div>
      {/* Hero Section */}
      <FoodDeliveryHero onSearch={handleHeroSearch} />

      {/* Interactive Orbit Showcase */}
      <FoodOrbitShowcase />

      {/* Featured Restaurants */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-10"
        >
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">
              Featured Restaurants
            </h2>
            <p className="text-gray-600">
              Discover amazing food from top-rated restaurants
            </p>
          </div>
          <Link
            to="/restaurants"
            className="hidden md:flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold transition-colors"
          >
            View All
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-2xl overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">🍽️</div>
            <p className="text-gray-500 text-lg font-medium">
              No restaurants found
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Try adjusting your search
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant, index) => (
              <RestaurantCard
                key={restaurant._id}
                restaurant={restaurant}
                index={index}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
