import React from 'react';
import { STAFF_PROFILES, CUSTOMER_REVIEWS } from '../constants';
import { StarIcon, TrophyIcon } from './Icons';

export const ReviewsAndStaff: React.FC = () => {
    const overallSatisfaction = (CUSTOMER_REVIEWS.reduce((sum, review) => sum + review.rating, 0) / CUSTOMER_REVIEWS.length).toFixed(1);

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Our Experts & Reviews</h2>
                <p className="text-sm text-slate-500 mt-1">Meet the team behind our success and see what our customers are saying.</p>
            </div>

            <div className="bg-slate-200 rounded-2xl shadow-digital p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Customer Satisfaction</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 flex flex-col items-center justify-center bg-slate-200 p-6 rounded-lg shadow-digital-inset text-center">
                        <TrophyIcon className="w-12 h-12 text-yellow-500" />
                        <p className="text-5xl font-bold text-slate-800 mt-2">{overallSatisfaction}</p>
                        <div className="flex mt-1">
                            {[...Array(5)].map((_, i) => <StarIcon key={i} className={`w-5 h-5 ${i < Math.round(Number(overallSatisfaction)) ? 'text-yellow-400' : 'text-slate-300'}`} />)}
                        </div>
                        <p className="text-sm text-slate-500 mt-2">Based on {CUSTOMER_REVIEWS.length} reviews</p>
                    </div>
                    <div className="md:col-span-2 space-y-4">
                        {CUSTOMER_REVIEWS.map(review => (
                            <div key={review.id} className="bg-slate-200 p-4 rounded-lg shadow-digital-inset flex items-start space-x-4">
                                {review.photoUrl && <img src={review.photoUrl} alt={review.name} className="w-12 h-12 rounded-full object-cover shadow-md" />}
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-slate-800">{review.name}</p>
                                            <p className="text-xs text-slate-500">{review.location}</p>
                                        </div>
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => <StarIcon key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-slate-300'}`} />)}
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 mt-2">"{review.comment}"</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-slate-200 rounded-2xl shadow-digital p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Meet Our Team</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {STAFF_PROFILES.map(staff => (
                        <div key={staff.id} className="text-center">
                            <img src={staff.photoUrl} alt={staff.name} className="w-32 h-32 rounded-full mx-auto shadow-digital mb-4 object-cover" />
                            <h4 className="font-bold text-lg text-slate-800">{staff.name}</h4>
                            <p className="font-semibold text-primary">{staff.role}</p>
                            <p className="text-sm text-slate-600 mt-2">{staff.bio}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};