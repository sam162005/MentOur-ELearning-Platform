import React, { useEffect, useState } from "react";
import "./coursedescription.css";
import { useNavigate, useParams } from "react-router-dom";
import { CourseData } from "../../context/CourseContext";
import { server } from "../../main";
import axios from "axios";
import toast from "react-hot-toast";
import { UserData } from "../../context/UserContext";
import Loading from "../../components/loading/Loading";

const CourseDescription = ({ user }) => {
  const params = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [userRating, setUserRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const { fetchUser } = UserData();
  const { fetchCourse, course, fetchCourses, fetchMyCourse } = CourseData();

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`${server}/api/course/${params.id}/reviews`);
      setReviews(data.reviews);
      setAverageRating(data.averageRating);
      setTotalReviews(data.totalReviews);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCourse(params.id);
    fetchReviews();
  }, []);

  const checkoutHandler = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);

    const {
      data: { order },
    } = await axios.post(
      `${server}/api/course/checkout/${params.id}`,
      {},
      {
        headers: {
          token,
        },
      }
    );

    const options = {
      key: "rzp_test_CMsB4Ic9wCgo4O", 
      amount: order.id, 
      currency: "INR",
      name: "E learning", 
      description: "Learn with us",
      order_id: order.id, 
 
      handler: async function (response) {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
          response;

        try {
          const { data } = await axios.post(
            `${server}/api/verification/${params.id}`,
            {
              razorpay_order_id,
              razorpay_payment_id,
              razorpay_signature,
            },
            {
              headers: {
                token,
              },
            }
          );

          await fetchUser();
          await fetchCourses();
          await fetchMyCourse();
          toast.success(data.message);
          setLoading(false);
          navigate(`/payment-success/${razorpay_payment_id}`);
        } catch (error) {
          toast.error(error.response.data.message);
          setLoading(false);
        }
      },
      theme: {
        color: "#8a4baf",
      },
    };
    const razorpay = new window.Razorpay(options);

    razorpay.open();
  };

  const submitReviewHandler = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) {
      toast.error("Please enter review text.");
      return;
    }
    setSubmittingReview(true);
    try {
      const { data } = await axios.post(
        `${server}/api/course/${params.id}/review`,
        { rating: userRating, reviewText },
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      toast.success(data.message);
      setReviewText("");
      setUserRating(5);
      fetchReviews();
      fetchCourse(params.id);
      setSubmittingReview(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
      setSubmittingReview(false);
    }
  };

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <>
          {course && (
            <div className="course-description">
              <div className="course-header">
                <img
                  src={`${server}/${course.image}`}
                  alt=""
                  className="course-image"
                />
                <div className="course-info">
                  <h2>{course.title}</h2>
                  <p>Instructor: {course.createdBy}</p>
                  <p>Duration: {course.duration} weeks</p>
                  
                  {/* Course Rating Summary */}
                  <div className="course-rating-summary">
                    <span className="stars">
                      {"★".repeat(Math.round(averageRating)) + "☆".repeat(5 - Math.round(averageRating))}
                    </span>
                    <span className="rating-text">
                      ({averageRating} / 5 based on {totalReviews} reviews)
                    </span>
                  </div>
                </div>
              </div>

              <p className="course-desc-text">{course.description}</p>

              <p className="course-price-tag">Let's get started with course At ₹{course.price}</p>

              {user && user.subscription.includes(course._id) ? (
                <button
                  onClick={() => navigate(`/course/study/${course._id}`)}
                  className="common-btn"
                >
                  Study
                </button>
              ) : (
                <button onClick={checkoutHandler} className="common-btn">
                  Buy Now
                </button>
              )}

              {/* Reviews & Feedback Section */}
              <div className="reviews-section">
                <h2>Student Reviews</h2>

                {/* Write a Review Section */}
                {user && user.subscription.includes(course._id) && (
                  <div className="write-review-card">
                    <h3>Share Your Feedback</h3>
                    <form onSubmit={submitReviewHandler}>
                      <div className="rating-select">
                        <label>Rating: </label>
                        <div className="star-rating-options">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              onClick={() => setUserRating(star)}
                              className={`star-option ${star <= userRating ? "active" : ""}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="review-input-wrapper">
                        <label>Your Review</label>
                        <textarea
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          placeholder="Tell us what you liked or disliked about this course..."
                          required
                          rows={4}
                        />
                      </div>
                      <button type="submit" disabled={submittingReview} className="common-btn submit-rev-btn">
                        {submittingReview ? "Submitting..." : "Submit Review"}
                      </button>
                    </form>
                  </div>
                )}

                {/* Reviews List */}
                <div className="reviews-list">
                  {reviews.length > 0 ? (
                    reviews.map((rev) => (
                      <div key={rev._id} className="review-item">
                        <div className="review-item-header">
                          <div className="review-user-info" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            {rev.user && rev.user.profilePic ? (
                              <img src={`${server}/${rev.user.profilePic}`} alt="Avatar" className="review-avatar" style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }} />
                            ) : (
                              <div className="review-avatar-placeholder" style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "0.95rem" }}>
                                {rev.user && rev.user.name ? rev.user.name.charAt(0).toUpperCase() : "S"}
                              </div>
                            )}
                            <strong>{rev.user ? rev.user.name : "Student"}</strong>
                          </div>
                          <span className="review-date">{new Date(rev.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="review-item-stars">
                          {"★".repeat(rev.rating) + "☆".repeat(5 - rev.rating)}
                        </div>
                        <p className="review-item-text">{rev.reviewText}</p>
                      </div>
                    ))
                  ) : (
                    <p className="no-reviews-msg">No reviews yet for this course. Be the first to review!</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default CourseDescription;