# AI-Driven Personalized Assessment Platform

## Project Overview
Traditional assessment methods often overlook individual learning needs, resulting in disengagement and limited academic progress. With the rising demand for personalized education, there's a need for intelligent tools that adapt to each student’s pace and learning style.

This project aims to develop a smart scholastic assessment platform using **Natural Language Processing (NLP)** and **Deep Q-Learning** to generate personalized quizzes and provide real-time feedback. By making assessments more adaptive and data-driven, the system supports continuous learning and empowers both students and educators to achieve improved educational outcomes.

---

## ⚙️ Getting Started

### Backend Setup (Python + Flask)

1. **Create a virtual environment:**

   ```bash
   python -m venv venv
   ```
   
2. **Activate the environment:**
   
   * For Linux/WSL:
    ```bash
    source venv/bin/activate
    ```

   * For Windows:
    ```bash
   source venv/bin/activate
    ```

3. **Install dependencies:**
   
   ```bash
   pip install -r requirements.txt
   ```

4. **Frontend Setup (React):**

- Navigate to the frontend directory:
  ```bash
  cd frontend
  ```

- Install Node.js dependencies:
  ```bash
  npm install
  ```

## Features & Technologies
### Features Built:
User Authentication: Secure login and registration system.

Personalized Dashboard: Gamified view showing XP, streaks, skill level, and quiz history.

Adaptive Quiz Generation:
* Initial quiz from a predefined database.
* Subsequent quizzes tailored using Deep Q-Learning based on user performance.
  
Question Generation: Attempted integration of FLAN-T5 and LLaMA models for MCQ generation.

Performance Evaluation: Tracks chapter-wise progress and rewards the RL agent based on quiz responses.

Admin Dashboard: View user analytics, performance charts, and quiz management tools.

Visual Analytics: Interactive Pie and Bar charts for progress tracking using Chart.js.

### Languages & Technologies Used:
* Frontend: React.js, React Bootstrap, Tailwind CSS
* Backend: Python (Flask)
* Database: SQLite with SQLAlchemy ORM
  
Machine Learning/NLP:
* Reinforcement Learning: Custom Deep Q-Learning implementation
* NLP (Experimental): FLAN-T5 and LLaMA
  
Visualization: 
* Chart.js (via react-chartjs-2)

## Proposed Methodology
- User Onboarding: Secure login/registration system directs users to a personalized dashboard with an initial assessment quiz.
- Initial Assessment: A default quiz evaluates baseline performance across chapters and difficulty levels.
- Performance Evaluation: User responses (accuracy, time, difficulty) form the state input for adaptive learning.
- Reinforcement Learning Adaptation: A Deep Q-Learning (DQN) agent selects future quiz content based on user performance, optimizing for learning outcomes through reward-based feedback.
- Dynamic Quiz Generation: Quizzes are assembled from a tagged database, with attempted use of NLP models (FLAN-T5, LLaMA) to diversify questions dynamically.
- Visualization & Admin Tools: React-based dashboard uses Chart.js for visualizing performance trends; admin panel supports quiz monitoring and management.
- Continuous Learning Loop: The DQN agent updates its policy after each quiz to deliver progressively refined and personalized assessments.
