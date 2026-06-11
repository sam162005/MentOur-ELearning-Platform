import React, { useState } from "react";
import "./courses.css";
import { CourseData } from "../../context/CourseContext";
import CourseCard from "../../components/coursecard/CourseCard";

const Courses = () => {
  const { courses } = CourseData();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [sortBy, setSortBy] = useState("default");

  const categories = ["All", ...new Set(courses.map((course) => course.category))];

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || course.category === selectedCategory;
    const matchesDifficulty =
      selectedDifficulty === "All" ||
      (course.difficulty || "Beginner") === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const sortedCourses = [...filteredCourses];
  if (sortBy === "price-asc") {
    sortedCourses.sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-desc") {
    sortedCourses.sort((a, b) => b.price - a.price);
  } else if (sortBy === "rating-desc") {
    sortedCourses.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  return (
    <div className="courses">
      <h2>Available Courses</h2>

      <div className="courses-filters-container">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search Courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filters-row">
          <div className="filter-group">
            <label>Categories</label>
            <div className="category-pills">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`pill ${selectedCategory === category ? "active" : ""}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label>Difficulty Level</label>
            <div className="difficulty-pills">
              {["All", "Beginner", "Intermediate", "Advanced"].map((diff) => (
                <button
                  key={diff}
                  className={`pill ${diff.toLowerCase()} ${
                    selectedDifficulty === diff ? "active" : ""
                  }`}
                  onClick={() => setSelectedDifficulty(diff)}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default">Default</option>
              <option value="price-asc">Price: Low-to-High</option>
              <option value="price-desc">Price: High-to-Low</option>
              <option value="rating-desc">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      <div className="courses-display-section">
        {searchQuery ? (
          <h3>Search Results ({sortedCourses.length})</h3>
        ) : selectedCategory === "All" && selectedDifficulty === "All" ? (
          <h3>All Courses ({sortedCourses.length})</h3>
        ) : (
          <h3>
            Filtered Courses ({sortedCourses.length})
          </h3>
        )}

        {sortedCourses.length > 0 ? (
          <div className="course-container">
            {sortedCourses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        ) : (
          <p className="no-courses-msg">No courses found matching your criteria.</p>
        )}
      </div>
    </div>
  );
};

export default Courses;
