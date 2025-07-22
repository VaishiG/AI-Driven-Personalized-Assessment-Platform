# AI-Driven-Personalized-Assessment-Platform
## Project Overview:
Traditional assessment methods often overlook individual learning needs, leading to disengagement and limited academic progress. With the growing demand for personalized education, there is a need for intelligent tools that adapt to each student’s learning pace and style.
This project aims to develop a smart scholastic assessment platform using NLP and Deep Q-Learning to generate personalized quizzes and provide real-time feedback. By making assessments more adaptive and data-driven, the system supports continuous learning and empowers both students and educators to achieve better educational outcomes.



## Getting Started:
First, setup a virtual environment. Go to your project directory using cd. using the following command: python -m venv venv

Your virtual setup will be complete.

Then
source venv/bin/activate   (if linux/wsl)

or

venv\Scripts\activate     (if windows)

Then
pip install -r requirements.txt


To setup npm, u already have package.json file.
All u need to do is cd to frontend folder then run:
npm install

All dependencies needed will be installed from this in node setup.

##  Features Built and Technologies Used
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

Languages & Technologies Used:
* Frontend: React.js, React Bootstrap, Tailwind CSS
* Backend: Python (Flask)
* Database: SQLite with SQLAlchemy ORM
* 
Machine Learning/NLP:
* Reinforcement Learning: Custom Deep Q-Learning implementation
* NLP (Experimental): FLAN-T5 and LLaMA
Visualization: Chart.js (via react-chartjs-2)

