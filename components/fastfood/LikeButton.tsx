'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { fastfoodApi } from '@/api/fastfoodApi';
import { toast } from 'sonner';

interface LikeButtonProps {
    restaurantId: number;
    initialLikes: number;
    initialLiked: boolean | null;
    size?: 'sm' | 'md' | 'lg';
    showCount?: boolean;
}

export default function LikeButton({
    restaurantId,
    initialLikes,
    initialLiked,
    size = 'md',
    showCount = true
}: LikeButtonProps) {
    const [liked, setLiked] = useState(initialLiked ?? false);
    const [likes, setLikes] = useState(initialLikes);
    const [isLoading, setIsLoading] = useState(false);

    const handleLike = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isLoading) return;

        setIsLoading(true);
        const previousLiked = liked;
        const previousLikes = likes;

        // Optimistic update
        setLiked(!liked);
        setLikes(liked ? likes - 1 : likes + 1);

        try {
            if (liked) {
                const response = await fastfoodApi.unlikeRestaurant(restaurantId);
                setLikes(response.likes);
            } else {
                const response = await fastfoodApi.likeRestaurant(restaurantId);
                setLikes(response.likes);
            }
        } catch (error: any) {
            // Revert on error
            setLiked(previousLiked);
            setLikes(previousLikes);

            if (error.response?.status === 401) {
                toast.error('Faça login para dar like');
            } else {
                toast.error('Erro ao processar like');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const sizeClasses = {
        sm: 'px-2 py-1 text-xs gap-1',
        md: 'px-3 py-1.5 text-sm gap-1.5',
        lg: 'px-4 py-2 text-base gap-2'
    };

    const iconSizes = {
        sm: 14,
        md: 16,
        lg: 20
    };

    return (
        <button
            onClick={handleLike}
            disabled={isLoading}
            className={`
        inline-flex items-center justify-center
        ${sizeClasses[size]}
        rounded-full
        transition-all duration-200
        ${liked
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
        font-medium
      `}
            aria-label={liked ? 'Unlike restaurant' : 'Like restaurant'}
        >
            <Heart
                size={iconSizes[size]}
                className={`transition-all duration-200 ${liked ? 'fill-red-600 stroke-red-600' : 'stroke-current'
                    }`}
            />
            {showCount && (
                <span className="tabular-nums">
                    {likes}
                </span>
            )}
        </button>
    );
}
