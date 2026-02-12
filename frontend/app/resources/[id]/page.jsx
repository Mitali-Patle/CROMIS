"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Tag, 
  FileText,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';

export default function ResourceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    fetchResourceDetails();
  }, [params.id]);

  const fetchResourceDetails = async () => {
    try {
      setLoading(true);
      const result = await apiRequest(`/resources/${params.id}/details`);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    // Navigate to booking form with pre-filled resource
    router.push(`/book?resource=${params.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading resource details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-semibold text-red-500 mb-2">Error Loading Resource</h2>
              <p className="text-gray-300">{error}</p>
              <button 
                onClick={() => router.back()}
                className="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data || !data.resource) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Resource Not Found</h1>
          <p className="text-gray-400 mb-6">The resource you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => router.back()}
            className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { resource, bookings } = data;

  // Group bookings by date for calendar view
  const bookingsByDate = bookings.reduce((acc, booking) => {
    const dateKey = new Date(booking.date).toISOString().split('T')[0];
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(booking);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Resources
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{resource.name}</h1>
          <div className="flex items-center gap-4 text-gray-400">
            <span className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              {resource.type}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs ${
              resource.isActive 
                ? 'bg-green-900 text-green-300' 
                : 'bg-red-900 text-red-300'
            }`}>
              {resource.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description Card */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Description
              </h2>
              <p className="text-gray-300 leading-relaxed">
                {resource.description || 'No description available for this resource.'}
              </p>
            </div>

            {/* Availability Calendar */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Upcoming Bookings (Next 30 Days)
              </h2>
              
              {bookings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No bookings scheduled</p>
                  <p className="text-sm text-gray-500 mt-1">This resource is available for booking</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {bookings.map((booking) => (
                    <div 
                      key={booking._id}
                      className="flex justify-between items-center p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-medium">
                            {new Date(booking.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            booking.status === 'approved' 
                              ? 'bg-green-900 text-green-300'
                              : booking.status === 'pending'
                              ? 'bg-yellow-900 text-yellow-300'
                              : 'bg-red-900 text-red-300'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {booking.startTime} - {booking.endTime}
                          </span>
                          {booking.requester && (
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {booking.requester.name} ({booking.requester.role})
                            </span>
                          )}
                        </div>
                        {booking.purpose && (
                          <p className="text-xs text-gray-500 mt-1">
                            Purpose: {booking.purpose}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Quick Info Card */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
              <h3 className="font-semibold mb-4">Quick Info</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-400 mb-1">Location</p>
                    <p className="font-medium">{resource.location}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-400 mb-1">Capacity</p>
                    <p className="font-medium">
                      {resource.capacity ? `${resource.capacity} people` : 'Not specified'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-400 mb-1">Available Hours</p>
                    <p className="font-medium">
                      {resource.availableFrom && resource.availableTo 
                        ? `${resource.availableFrom} - ${resource.availableTo}`
                        : '24/7'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tags Card */}
            {resource.tags && resource.tags.length > 0 && (
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Tags & Features
                </h3>
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-full text-sm transition cursor-default"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Book Now Button */}
            {resource.isActive && (
              <button 
                onClick={handleBookNow}
                className="w-full px-6 py-4 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition transform hover:scale-105 active:scale-95"
              >
                Book This Resource
              </button>
            )}

            {!resource.isActive && (
              <div className="w-full px-6 py-4 bg-red-900/20 border border-red-700 text-red-300 rounded-lg text-center">
                <AlertCircle className="w-5 h-5 inline-block mr-2" />
                This resource is currently unavailable
              </div>
            )}

            {/* Statistics */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
              <h3 className="font-semibold mb-4">Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Total Bookings</span>
                  <span className="font-semibold">{bookings.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Approved</span>
                  <span className="font-semibold text-green-400">
                    {bookings.filter(b => b.status === 'approved').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Pending</span>
                  <span className="font-semibold text-yellow-400">
                    {bookings.filter(b => b.status === 'pending').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
