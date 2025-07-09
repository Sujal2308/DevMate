import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import ShimmerEffect from "../components/ShimmerEffect";
import LoadingSpinner from "../components/LoadingSpinner";
import PostCard from "../components/PostCard";

const PostDetail = () => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { id } = useParams();

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await axios.get(`/api/posts/${id}`);
      setPost(response.data);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch post");
    } finally {
      setLoading(false);
    }
  };

  const handlePostUpdate = (updatedPost) => {
    setPost(updatedPost);
  };

  const handlePostDelete = () => {
    // Redirect to feed after deletion
    window.location.href = "/feed";
  };

  if (loading) {
    return <ShimmerEffect type="post-detail" />;
  }

  if (error || !post) {
    return (
      <div className="w-full max-w-2xl mx-auto py-4 sm:py-8 px-3 sm:px-4">
        <div className="text-center px-4">
          <svg
            className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
            Post Not Found
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
            {error || "The post you're looking for doesn't exist."}
          </p>
          <Link
            to="/feed"
            className="btn-primary text-sm sm:text-base px-4 py-2 sm:px-6 sm:py-3"
          >
            Back to Feed
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto py-4 sm:py-8 px-3 sm:px-4 pb-20 lg:pb-8">
      <div className="mb-4 sm:mb-6">
        <Link
          to="/feed"
          className="flex items-center text-gray-600 hover:text-primary-600 transition-colors text-sm sm:text-base"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Feed
        </Link>
      </div>

      <PostCard
        post={post}
        onUpdate={handlePostUpdate}
        onDelete={handlePostDelete}
        expandedView
      />
    </div>
  );
};

export default PostDetail;
// No unused variables found in PostDetail.js main logic
