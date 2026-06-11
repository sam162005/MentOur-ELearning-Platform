import React, { useEffect, useState } from "react";
import "./lecture.css";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { server } from "../../main";
import Loading from "../../components/loading/Loading";
import toast from "react-hot-toast";
import { TiTick } from "react-icons/ti";
import { CourseData } from "../../context/CourseContext";


const Lecture = ({ user }) => {
  const [lectures, setLectures] = useState([]);
  const [lecture, setLecture] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lecLoading, setLecLoading] = useState(false);
  const [show, setShow] = useState(false);
  const params = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [video, setvideo] = useState("");
  const [videoPrev, setVideoPrev] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);
  const [showCert, setShowCert] = useState(false);
  const { course, fetchCourse } = CourseData();

  if (user && user.role !== "admin" && !user.subscription.includes(params.id))
    return navigate("/");


  async function fetchLectures() {
    try {
      const { data } = await axios.get(`${server}/api/lectures/${params.id}`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setLectures(data.lectures);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

  async function fetchLecture(id) {
    setLecLoading(true);
    try {
      const { data } = await axios.get(`${server}/api/lecture/${id}`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setLecture(data.lecture);
      setLecLoading(false);
      fetchComments(id);
    } catch (error) {
      console.log(error);
      setLecLoading(false);
    }
  }

  const changeVideoHandler = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onloadend = () => {
      setVideoPrev(reader.result);
      setvideo(file);
    };
  };

  const submitHandler = async (e) => {
    setBtnLoading(true);
    e.preventDefault();
    const myForm = new FormData();

    myForm.append("title", title);
    myForm.append("description", description);
    myForm.append("file", video);

    try {
      const { data } = await axios.post(
        `${server}/api/course/${params.id}`,
        myForm,
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );

      toast.success(data.message);
      setBtnLoading(false);
      setShow(false);
      fetchLectures();
      setTitle("");
      setDescription("");
      setvideo("");
      setVideoPrev("");
    } catch (error) {
      toast.error(error.response.data.message);
      setBtnLoading(false);
    }
  };

  const deleteHandler = async (id) => {
    if (confirm("Are you sure you want to delete this lecture")) {
      try {
        const { data } = await axios.delete(`${server}/api/lecture/${id}`, {
          headers: {
            token: localStorage.getItem("token"),
          },
        });

        toast.success(data.message);
        fetchLectures();
      } catch (error) {
        toast.error(error.response.data.message);
      }
    }
  };

  const [completed, setCompleted] = useState("");
  const [completedLec, setCompletedLec] = useState("");
  const [lectLength, setLectLength] = useState("");
  const [progress, setProgress] = useState([]);

  const [quiz, setQuiz] = useState(null);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [showQuizWizard, setShowQuizWizard] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [questions, setQuestions] = useState([]);

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [tagTimestamp, setTagTimestamp] = useState(false);
  const [activeTab, setActiveTab] = useState("lectures");
  const [replyTexts, setReplyTexts] = useState({});
  const videoRef = React.useRef(null);
  const [lastSavedTime, setLastSavedTime] = useState(0);

  const [announcements, setAnnouncements] = useState([]);
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");

  const fetchAnnouncements = async () => {
    try {
      const { data } = await axios.get(`${server}/api/course/${params.id}/announcements`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setAnnouncements(data.announcements || []);
    } catch (error) {
      console.log("Error fetching announcements:", error);
    }
  };

  const submitAnnouncementHandler = async (e) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementContent.trim()) {
      toast.error("Please fill in all announcement fields.");
      return;
    }
    setBtnLoading(true);
    try {
      const { data } = await axios.post(
        `${server}/api/course/${params.id}/announcement`,
        { title: announcementTitle, content: announcementContent },
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      toast.success(data.message);
      setAnnouncementTitle("");
      setAnnouncementContent("");
      fetchAnnouncements();
      setBtnLoading(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
      setBtnLoading(false);
    }
  };

  const savePlaytime = async (time) => {
    if (!lecture || !lecture._id) return;
    try {
      await axios.post(
        `${server}/api/user/progress/time`,
        {
          courseId: params.id,
          lectureId: lecture._id,
          time,
        },
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      
      // Fetch progress silently in background to update local state copy
      axios.get(`${server}/api/user/progress?course=${params.id}`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      }).then(({ data }) => {
        setProgress(data.progress);
      }).catch(err => console.log(err));
    } catch (error) {
      console.log("Error saving playtime:", error);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const currentTime = Math.floor(videoRef.current.currentTime);
    
    // Save every 10 seconds of playing
    if (currentTime > 0 && currentTime % 10 === 0 && currentTime !== lastSavedTime) {
      setLastSavedTime(currentTime);
      savePlaytime(currentTime);
    }
  };

  const handleVideoPause = () => {
    if (!videoRef.current) return;
    const currentTime = Math.floor(videoRef.current.currentTime);
    savePlaytime(currentTime);
  };

  const handleVideoLoadedMetadata = () => {
    if (videoRef.current && progress[0] && progress[0].lecturePlaytimes && lecture && lecture._id) {
      const savedPlaytime = progress[0].lecturePlaytimes.find(
        (item) => item.lecture === lecture._id
      );
      if (savedPlaytime && savedPlaytime.time > 0) {
        const duration = videoRef.current.duration;
        // Only seek if we have not reached the very end (less than duration - 5s)
        if (savedPlaytime.time < duration - 5) {
          videoRef.current.currentTime = savedPlaytime.time;
        }
      }
    }
  };

  useEffect(() => {
    setLastSavedTime(0);
  }, [lecture._id]);


  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const fetchComments = async (lecId) => {
    try {
      const { data } = await axios.get(`${server}/api/lecture/${lecId}/comments`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setComments(data.comments);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSeekVideo = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play().catch(() => {});
    }
  };

  const submitCommentHandler = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) {
      toast.error("Please enter a question.");
      return;
    }

    let timestamp = 0;
    if (tagTimestamp && videoRef.current) {
      timestamp = videoRef.current.currentTime;
    }

    setBtnLoading(true);
    try {
      const { data } = await axios.post(
        `${server}/api/lecture/${lecture._id}/comment`,
        { commentText, videoTimestamp: timestamp },
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      toast.success(data.message);
      setCommentText("");
      setTagTimestamp(false);
      fetchComments(lecture._id);
      setBtnLoading(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
      setBtnLoading(false);
    }
  };

  const submitReplyHandler = async (e, commentId) => {
    e.preventDefault();
    const replyText = replyTexts[commentId];
    if (!replyText || !replyText.trim()) {
      toast.error("Reply text cannot be empty.");
      return;
    }

    try {
      const { data } = await axios.post(
        `${server}/api/comment/${commentId}/reply`,
        { replyText },
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      toast.success(data.message);
      setReplyTexts(prev => ({ ...prev, [commentId]: "" }));
      fetchComments(lecture._id);
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    }
  };

  async function fetchProgress() {
    try {
      const { data } = await axios.get(
        `${server}/api/user/progress?course=${params.id}`,
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );

      setCompleted(data.courseProgressPercentage);
      setCompletedLec(data.completedLectures);
      setLectLength(data.allLectures);
      setProgress(data.progress);
    } catch (error) {
      console.log(error);
    }
  }

  const addProgress = async (id) => {
    try {
      const { data } = await axios.post(
        `${server}/api/user/progress?course=${params.id}&lectureId=${id}`,
        {},
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      console.log(data.message);
      fetchProgress();
    } catch (error) {
      console.log(error);
    }
  };

  async function fetchQuiz() {
    try {
      const { data } = await axios.get(`${server}/api/quiz/${params.id}`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setQuiz(data);
    } catch (error) {
      console.log(error);
    }
  }

  console.log(progress);

  useEffect(() => {
    fetchLectures();
    fetchProgress();
    fetchCourse(params.id);
    fetchQuiz();
    fetchAnnouncements();

    const queryParams = new URLSearchParams(window.location.search);
    const tabParam = queryParams.get("tab");
    if (tabParam === "announcements") {
      setActiveTab("announcements");
    }
  }, []);

  useEffect(() => {
    if (quiz && quiz.questions) {
      setQuestions(quiz.questions);
    }
  }, [quiz]);

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        questionText: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
      },
    ]);
  };

  const removeQuestion = (idx) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleQuestionChange = (qIdx, field, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qIdx ? { ...q, [field]: value } : q))
    );
  };

  const handleOptionChange = (qIdx, oIdx, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i === qIdx) {
          const newOptions = [...q.options];
          newOptions[oIdx] = value;
          return { ...q, options: newOptions };
        }
        return q;
      })
    );
  };

  const saveQuizHandler = async (e) => {
    e.preventDefault();
    if (questions.length === 0) {
      toast.error("Please add at least one question.");
      return;
    }

    const isValid = questions.every(
      (q) =>
        q.questionText.trim() !== "" &&
        q.options.every((opt) => opt.trim() !== "")
    );
    if (!isValid) {
      toast.error("All questions and option fields must be filled.");
      return;
    }

    setBtnLoading(true);
    try {
      const { data } = await axios.post(
        `${server}/api/quiz/${params.id}`,
        { questions },
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      toast.success(data.message);
      setQuiz(data.quiz);
      setShowQuizForm(false);
      setBtnLoading(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
      setBtnLoading(false);
    }
  };

  const handleSelectAnswer = (questionId, optionIdx) => {
    setQuizAnswers((prev) => {
      const filtered = prev.filter((ans) => ans.questionId !== questionId);
      return [...filtered, { questionId, selectedOption: optionIdx }];
    });
  };

  const submitQuizHandler = async (e) => {
    e.preventDefault();
    if (quizAnswers.length < quiz.questions.length) {
      toast.error("Please answer all questions before submitting.");
      return;
    }

    setBtnLoading(true);
    try {
      const { data } = await axios.post(
        `${server}/api/quiz/${params.id}/submit`,
        { answers: quizAnswers },
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );

      if (data.passed) {
        toast.success(data.message);
        setShowQuizWizard(false);
        fetchProgress();
      } else {
        toast.error(data.message);
      }
      setBtnLoading(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
      setBtnLoading(false);
    }
  };

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="progress">
            Lecture completed - {completedLec} out of {lectLength} <br />
            <progress value={completed} max={100}></progress> {completed} %
          </div>
          {completed === 100 && (
            <div className="congrats-banner">
              <h2>🎉 Congratulations! You have completed all lectures!</h2>
              {quiz && quiz.questions && quiz.questions.length > 0 ? (
                progress[0] && progress[0].quizPassed ? (
                  <>
                    <p>Your hard work has paid off and you have passed the final exam. You are now eligible to claim your official certificate.</p>
                    <button className="common-btn claim-cert-btn" onClick={() => setShowCert(true)}>
                      Claim Certificate
                    </button>
                  </>
                ) : (
                  <>
                    <p>To claim your official certificate, you must first pass the Final Quiz with a score of 70% or higher.</p>
                    <button className="common-btn claim-cert-btn" style={{ background: "indigo" }} onClick={() => { setShowQuizWizard(true); setQuizAnswers([]); }}>
                      Take Final Exam
                    </button>
                  </>
                )
              ) : (
                <>
                  <p>Your hard work has paid off. You are now eligible to claim your official certificate.</p>
                  <button className="common-btn claim-cert-btn" onClick={() => setShowCert(true)}>
                    Claim Certificate
                  </button>
                </>
              )}
            </div>
          )}
          <div className="lecture-page">
            <div className="left">
              {lecLoading ? (
                <Loading />
              ) : (
                <>
                  {lecture.video ? (
                    <>
                      <video
                        ref={videoRef}
                        src={`${server}/${lecture.video}`}
                        width={"100%"}
                        controls
                        controlsList="nodownload noremoteplayback"
                        disablePictureInPicture
                        disableRemotePlayback
                        autoPlay
                        onEnded={() => addProgress(lecture._id)}
                        onTimeUpdate={handleTimeUpdate}
                        onPause={handleVideoPause}
                        onLoadedMetadata={handleVideoLoadedMetadata}
                      ></video>
                      <h1>{lecture.title}</h1>
                      <h3>{lecture.description}</h3>
                    </>
                  ) : (
                    <h1>Please Select a Lecture</h1>
                  )}
                </>
              )}
            </div>
            <div className="right">
              {/* Tab Selector */}
              <div className="right-panel-tabs" style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: "15px" }}>
                <button
                  className={`panel-tab ${activeTab === "lectures" ? "active" : ""}`}
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: "none",
                    border: "none",
                    borderBottom: activeTab === "lectures" ? "2px solid var(--primary)" : "none",
                    color: activeTab === "lectures" ? "var(--primary)" : "var(--text-muted)",
                    fontWeight: "700",
                    cursor: "pointer"
                  }}
                  onClick={() => setActiveTab("lectures")}
                >
                  Lectures
                </button>
                <button
                  className={`panel-tab ${activeTab === "announcements" ? "active" : ""}`}
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: "none",
                    border: "none",
                    borderBottom: activeTab === "announcements" ? "2px solid var(--primary)" : "none",
                    color: activeTab === "announcements" ? "var(--primary)" : "var(--text-muted)",
                    fontWeight: "700",
                    cursor: "pointer"
                  }}
                  onClick={() => {
                    setActiveTab("announcements");
                    fetchAnnouncements();
                  }}
                >
                  Announcements
                </button>
                <button
                  className={`panel-tab ${activeTab === "qa" ? "active" : ""}`}
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: "none",
                    border: "none",
                    borderBottom: activeTab === "qa" ? "2px solid var(--primary)" : "none",
                    color: activeTab === "qa" ? "var(--primary)" : "var(--text-muted)",
                    fontWeight: "700",
                    cursor: "pointer"
                  }}
                  onClick={() => {
                    setActiveTab("qa");
                    if (lecture && lecture._id) {
                      fetchComments(lecture._id);
                    }
                  }}
                  disabled={!lecture || !lecture._id}
                >
                  Q&A Discussion
                </button>
              </div>

              {activeTab === "lectures" ? (
                <>
                  {user && user.role === "admin" && (
                    <div style={{ display: "flex", gap: "10px", marginBottom: "15px", flexWrap: "wrap" }}>
                      <button className="common-btn" onClick={() => { setShow(!show); setShowQuizForm(false); }}>
                        {show ? "Close" : "Add Lecture +"}
                      </button>
                      <button className="common-btn" style={{ background: "indigo" }} onClick={() => { setShowQuizForm(!showQuizForm); setShow(false); }}>
                        {showQuizForm ? "Close Quiz" : "Manage Quiz +"}
                      </button>
                    </div>
                  )}

                  {showQuizForm && (
                    <div className="lecture-form">
                      <h2>Manage Quiz</h2>
                      {questions.length === 0 ? (
                        <p style={{ margin: "10px 0" }}>No questions added yet.</p>
                      ) : (
                        questions.map((q, qIdx) => (
                          <div key={qIdx} className="quiz-question-edit-card" style={{ border: "1px solid #334155", padding: "15px", borderRadius: "8px", marginBottom: "15px", background: "#1e293b" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                              <h4>Question {qIdx + 1}</h4>
                              <button type="button" className="common-btn" style={{ background: "red", padding: "4px 8px", fontSize: "0.8rem", width: "auto" }} onClick={() => removeQuestion(qIdx)}>
                                Remove
                              </button>
                            </div>
                            <label>Question Text</label>
                            <input
                              type="text"
                              value={q.questionText}
                              onChange={(e) => handleQuestionChange(qIdx, "questionText", e.target.value)}
                              required
                              placeholder="e.g. What is React?"
                            />
                            <div className="options-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "10px" }}>
                              {q.options.map((opt, oIdx) => (
                                <div key={oIdx} style={{ display: "flex", flexDirection: "column" }}>
                                  <label style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Option {oIdx + 1}</label>
                                  <input
                                    type="text"
                                    value={opt}
                                    onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)}
                                    required
                                    placeholder={`Option ${oIdx + 1}`}
                                  />
                                </div>
                              ))}
                            </div>
                            <div style={{ marginTop: "10px" }}>
                              <label>Correct Option</label>
                              <select
                                value={q.correctAnswer}
                                onChange={(e) => handleQuestionChange(qIdx, "correctAnswer", Number(e.target.value))}
                                style={{ width: "100%", padding: "8px", background: "#0f172a", border: "1px solid #334155", borderRadius: "6px", color: "white" }}
                              >
                                <option value={0}>Option 1</option>
                                <option value={1}>Option 2</option>
                                <option value={2}>Option 3</option>
                                <option value={3}>Option 4</option>
                              </select>
                            </div>
                          </div>
                        ))
                      )}
                      <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                        <button type="button" className="common-btn" style={{ background: "#475569" }} onClick={addQuestion}>
                          + Add Question
                        </button>
                        <button type="button" className="common-btn" disabled={btnLoading} onClick={saveQuizHandler}>
                          {btnLoading ? "Saving..." : "Save Quiz"}
                        </button>
                      </div>
                    </div>
                  )}

                  {show && (
                    <div className="lecture-form">
                      <h2>Add Lecture</h2>
                      <form onSubmit={submitHandler}>
                        <label htmlFor="text">Title</label>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          required
                        />

                        <label htmlFor="text">Description</label>
                        <input
                          type="text"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          required
                        />

                        <input
                          type="file"
                          placeholder="choose video"
                          onChange={changeVideoHandler}
                          required
                        />

                        {videoPrev && (
                          <video
                            src={videoPrev}
                            alt=""
                            width={300}
                            controls
                          ></video>
                        )}

                        <button
                          disabled={btnLoading}
                          type="submit"
                          className="common-btn"
                        >
                          {btnLoading ? "Please Wait..." : "ADD"}
                        </button>
                      </form>
                    </div>
                  )}

                  {lectures && lectures.length > 0 ? (
                    lectures.map((e, i) => (
                      <React.Fragment key={e._id}>
                        <div
                          onClick={() => fetchLecture(e._id)}
                          className={`lecture-number ${
                            lecture._id === e._id && "active"
                          }`}
                        >
                          {i + 1}. {e.title}{" "}
                          {progress[0] &&
                            progress[0].completedLectures.includes(e._id) && (
                              <span
                                style={{
                                  background: "red",
                                  padding: "2px",
                                  borderRadius: "6px",
                                  color: "greenyellow",
                                }}
                              >
                                <TiTick />
                              </span>
                            )}
                        </div>
                        {user && user.role === "admin" && (
                          <button
                            className="common-btn"
                            style={{ background: "red" }}
                            onClick={() => deleteHandler(e._id)}
                          >
                            Delete {e.title}
                          </button>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <p>No Lectures Yet!</p>
                  )}
                </>
              ) : activeTab === "announcements" ? (
                <div className="announcements-panel" style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                  <h3>Course Announcements</h3>

                  {user && user.role === "admin" && (
                    <form onSubmit={submitAnnouncementHandler} style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "12px", border: "1px solid var(--border)", borderRadius: "8px", background: "var(--background)" }}>
                      <h4>Post New Announcement</h4>
                      <input
                        type="text"
                        placeholder="Announcement Title..."
                        value={announcementTitle}
                        onChange={(e) => setAnnouncementTitle(e.target.value)}
                        required
                        style={{ width: "100%", padding: "8px", border: "1px solid var(--border)", borderRadius: "6px", background: "var(--surface)", color: "var(--text-main)" }}
                      />
                      <textarea
                        placeholder="Write the announcement content here..."
                        value={announcementContent}
                        onChange={(e) => setAnnouncementContent(e.target.value)}
                        required
                        rows={3}
                        style={{ width: "100%", padding: "8px", border: "1px solid var(--border)", borderRadius: "6px", background: "var(--surface)", color: "var(--text-main)", fontFamily: "inherit" }}
                      />
                      <button type="submit" disabled={btnLoading} className="common-btn" style={{ padding: "6px 15px", fontSize: "0.85rem", width: "auto", margin: 0 }}>
                        {btnLoading ? "Posting..." : "Post Announcement"}
                      </button>
                    </form>
                  )}

                  <div className="announcements-list" style={{ display: "flex", flexDirection: "column", gap: "15px", maxHeight: "50vh", overflowY: "auto", paddingRight: "5px" }}>
                    {announcements.length > 0 ? (
                      announcements.map((ann) => (
                        <div key={ann._id} className="announcement-card" style={{ border: "1px solid var(--border)", padding: "12px", borderRadius: "8px", background: "var(--background)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                            <strong style={{ fontSize: "0.95rem", color: "var(--text-main)" }}>{ann.title}</strong>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                              {new Date(ann.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p style={{ margin: "0 0 8px 0", fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: "1.4", whiteSpace: "pre-wrap" }}>
                            {ann.content}
                          </p>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                            Posted by: {ann.createdBy}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: "0.85rem" }}>No announcements posted yet for this course.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="qa-panel" style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                  <h3>Lecture Questions</h3>

                  <form onSubmit={submitCommentHandler} style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "12px", border: "1px solid var(--border)", borderRadius: "8px", background: "var(--background)" }}>
                    <textarea
                      placeholder="Ask a question about this lecture..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      required
                      rows={2}
                      style={{ width: "100%", padding: "8px", border: "1px solid var(--border)", borderRadius: "6px", background: "var(--surface)", color: "var(--text-main)", fontFamily: "inherit" }}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.85rem", cursor: "pointer", color: "var(--text-muted)" }}>
                        <input
                          type="checkbox"
                          checked={tagTimestamp}
                          onChange={(e) => setTagTimestamp(e.target.checked)}
                        />
                        <span>Tag at current time ({videoRef.current ? formatTime(videoRef.current.currentTime) : "0:00"})</span>
                      </label>
                      <button type="submit" disabled={btnLoading} className="common-btn" style={{ padding: "6px 15px", fontSize: "0.85rem", width: "auto", margin: 0 }}>
                        {btnLoading ? "Post" : "Post"}
                      </button>
                    </div>
                  </form>

                  <div className="comments-list" style={{ display: "flex", flexDirection: "column", gap: "15px", maxHeight: "50vh", overflowY: "auto", paddingRight: "5px" }}>
                    {comments.length > 0 ? (
                      comments.map((comm) => (
                        <div key={comm._id} className="comment-card" style={{ border: "1px solid var(--border)", padding: "12px", borderRadius: "8px", background: "var(--background)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                            <div className="comment-user-info" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              {comm.user && comm.user.profilePic ? (
                                <img src={`${server}/${comm.user.profilePic}`} alt="Avatar" className="comment-avatar" style={{ width: "30px", height: "30px", borderRadius: "50%", objectFit: "cover" }} />
                              ) : (
                                <div className="comment-avatar-placeholder" style={{ width: "30px", height: "30px", borderRadius: "50%", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "0.85rem" }}>
                                  {comm.user && comm.user.name ? comm.user.name.charAt(0).toUpperCase() : "S"}
                                </div>
                              )}
                              <strong style={{ fontSize: "0.9rem", color: "var(--text-main)" }}>{comm.user ? comm.user.name : "Student"}</strong>
                            </div>
                            {comm.videoTimestamp > 0 && (
                              <button
                                className="timestamp-pill"
                                type="button"
                                style={{ padding: "2px 8px", background: "rgba(99, 102, 241, 0.15)", border: "1px solid var(--primary-light)", color: "var(--primary)", borderRadius: "12px", fontSize: "0.8rem", fontWeight: "700", cursor: "pointer" }}
                                onClick={() => handleSeekVideo(comm.videoTimestamp)}
                              >
                                🎥 {formatTime(comm.videoTimestamp)}
                              </button>
                            )}
                          </div>
                          <p style={{ margin: "0 0 8px 0", fontSize: "0.9rem", color: "var(--text-main)", lineHeight: "1.4" }}>{comm.commentText}</p>

                          <div style={{ borderTop: comm.replies.length > 0 ? "1px solid var(--border)" : "none", paddingTop: comm.replies.length > 0 ? "8px" : "0", marginTop: "8px" }}>
                            {comm.replies.map((reply, rIdx) => (
                              <div key={rIdx} className="reply-item" style={{ paddingLeft: "10px", borderLeft: "2px solid var(--primary-light)", marginBottom: "8px", display: "flex", gap: "8px", alignItems: "flex-start" }}>
                                {reply.user && reply.user.profilePic ? (
                                  <img src={`${server}/${reply.user.profilePic}`} alt="Avatar" style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover", marginTop: "2px" }} />
                                ) : (
                                  <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "0.75rem", marginTop: "2px" }}>
                                    {reply.name ? reply.name.charAt(0).toUpperCase() : "R"}
                                  </div>
                                )}
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "2px" }}>
                                    <strong>{reply.name}</strong> • {new Date(reply.createdAt).toLocaleDateString()}
                                  </div>
                                  <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>{reply.replyText}</p>
                                </div>
                              </div>
                            ))}
                          </div>

                          <form onSubmit={(e) => submitReplyHandler(e, comm._id)} style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                            <input
                              type="text"
                              placeholder="Type a reply..."
                              value={replyTexts[comm._id] || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setReplyTexts(prev => ({ ...prev, [comm._id]: val }));
                              }}
                              required
                              style={{ flex: 1, padding: "6px 10px", fontSize: "0.8rem", border: "1px solid var(--border)", borderRadius: "4px", background: "var(--surface)", color: "var(--text-main)" }}
                            />
                            <button type="submit" className="common-btn" style={{ padding: "4px 10px", fontSize: "0.8rem", width: "auto", margin: 0 }}>
                              Reply
                            </button>
                          </form>
                        </div>
                      ))
                    ) : (
                      <p style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: "0.85rem" }}>No questions posted yet for this lecture. Ask something to get started!</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {showCert && (
            <div className="cert-modal-overlay">
              <div className="cert-modal">
                <button className="close-cert-btn" onClick={() => setShowCert(false)}>×</button>
                <div id="certificate-print-area" className="certificate-paper">
                  <div className="cert-border-outer">
                    <div className="cert-border-inner">
                      <div className="cert-header">
                        <span className="cert-title-small">MentOur Academy</span>
                        <h2>Certificate of Completion</h2>
                      </div>
                      <div className="cert-body">
                        <p className="cert-presented">This certificate is proudly presented to</p>
                        <p className="cert-student-name">{user ? user.name : "Student Name"}</p>
                        <p className="cert-description">
                          for successfully completing the course
                        </p>
                        <p className="cert-course-title">
                          "{course ? course.title : "E-Learning Course"}"
                        </p>
                        <p className="cert-details">
                          A comprehensive masterclass covering all curriculum modules, technical exercises, and validation milestones.
                        </p>
                      </div>
                      <div className="cert-footer">
                        <div className="cert-signature-block">
                          <span className="signature-line"></span>
                          <span className="signature-title">Course Instructor</span>
                        </div>
                        <div className="cert-seal">
                          <div className="gold-seal">★</div>
                        </div>
                        <div className="cert-signature-block">
                          <span className="signature-line"></span>
                          <span className="signature-title">Academy Director</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <button className="common-btn print-cert-btn" onClick={() => window.print()}>
                  Print / Save Certificate as PDF
                </button>
              </div>
            </div>
          )}

          {showQuizWizard && quiz && (
            <div className="cert-modal-overlay">
              <div className="cert-modal quiz-modal">
                <button className="close-cert-btn" onClick={() => setShowQuizWizard(false)}>×</button>
                <h2>📝 Final Exam: {course ? course.title : "Course"}</h2>
                <p style={{ margin: "5px 0 20px 0", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  Answer all the questions below to test your understanding. You must score 70% or higher to pass and unlock your Certificate.
                </p>
                <form onSubmit={submitQuizHandler} style={{ textAlign: "left" }}>
                  {quiz.questions.map((q, idx) => (
                    <div key={q._id || idx} className="quiz-question-card">
                      <p>
                        {idx + 1}. {q.questionText}
                      </p>
                      <div className="options-list">
                        {q.options.map((opt, optIdx) => {
                          const questionId = q._id || idx.toString();
                          const isSelected = quizAnswers.find(ans => ans.questionId === questionId)?.selectedOption === optIdx;
                          return (
                            <label
                              key={optIdx}
                              className={`quiz-option-item ${isSelected ? "selected" : ""}`}
                            >
                              <input
                                type="radio"
                                name={`question-${questionId}`}
                                checked={isSelected}
                                onChange={() => handleSelectAnswer(questionId, optIdx)}
                                required
                              />
                              <span>{opt}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  <button type="submit" disabled={btnLoading} className="common-btn" style={{ width: "100%", marginTop: "10px" }}>
                    {btnLoading ? "Submitting..." : "Submit Exam"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default Lecture;