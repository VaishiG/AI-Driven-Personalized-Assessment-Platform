from flask import Flask, request, jsonify, abort
from flask_login import LoginManager, login_user, login_required, logout_user, current_user
from flask_cors import CORS
from extensions import db
from werkzeug.security import check_password_hash, generate_password_hash
import os
from datetime import datetime, timezone, timedelta
import random
from quiz_selector import generate_adaptive_quiz 
from quiz_env import QuizEnv
from dqn_agent import DQNAgent


app = Flask(__name__)
app.secret_key = 'MyProject'

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(app.instance_path, 'quiz.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

CORS(app, supports_credentials=True, origins=["*"])

from models import User, Chapters, QuizQuestion, Quiz, UserResponse, Performance, UserQuiz, Questions

# Initialize LoginManager
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))

@app.route('/login', methods=['GET', 'POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    user = User.query.filter_by(email=email).first()

    if user and check_password_hash(user.password, password):
        login_user(user)
        return jsonify(success=True, user_id=user.id, is_admin=user.is_admin)
    else:
        return jsonify(success=False, message="Invalid credentials"), 401


@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    fullname = data.get('fullname')
    dob = data.get('dob')
    is_admin = data.get('is_admin', False)

    if User.query.filter_by(email=email).first():
        return jsonify({"success": False, "message": "Email already registered"}), 400

    new_user = User(
        email=email,
        password=generate_password_hash(password),
        fullname=fullname,
        dob=dob,
        is_admin=is_admin
    )

    try:
        db.session.add(new_user)
        db.session.commit()

        if not is_admin:
            create_default_quiz_for_user(new_user.id)

        return jsonify({"success": True, "message": "User registered successfully"}), 201
    except Exception as e:
        return jsonify({"success": False, "message": "Registration failed"}), 500


@app.route('/api/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({"success": True, "message": "Logged out"}), 200


def create_default_quiz_for_user(user_id):
    chapters = Chapters.query.all()
    quiz_questions = []

    for chapter in chapters:
        for difficulty in ['easy', 'medium', 'hard']:
            questions = Questions.query.filter_by(chapter_id=chapter.id, difficulty=difficulty).all()
            if len(questions) >= 2:
                quiz_questions.extend(random.sample(questions, 2))

            else:
                print(f"Not enough questions in chapter {chapter.name} for difficulty {difficulty}. Skipping.")
                continue

    default_quiz = Quiz(user_id=user_id, duration=15, remarks='First Step')

    db.session.add(default_quiz)
    db.session.commit()

    for question in quiz_questions:
        db.session.add(QuizQuestion(quiz_id=default_quiz.id, question_id=question.id))

    db.session.commit()


#fetch current user in session info
@app.route('/api/user', methods=['GET'])
@login_required
def get_user():
    user = db.session.get(User, current_user.id)
    if user:
        return jsonify({
            'id': user.id,
            'email': user.email,
            'name': user.fullname,
            'dob': user.dob,
            'is_admin': user.is_admin
        })
    return jsonify({"error": "User not found"}), 404
    



#USER
#getting user data
@app.route('/api/dashboard', methods=['GET'])
@login_required
def get_dashboard_data():
    try:
        user = current_user
        recent_attempts = UserQuiz.query.filter_by(user_id=user.id).order_by(UserQuiz.timestamp.desc()).limit(5).all()
        streak = calculate_streak(recent_attempts)
        total_xp, level = calculate_xp_level(recent_attempts)
        overall_progress = calculate_overall_progress(user)
        avg_score = calculate_avg_score(recent_attempts)
        time_spent = calculate_time_spent(recent_attempts)
        adaptive_level = calculate_adaptive_level(user)
        subject_stats = calculate_subject_stats(user)

        return jsonify({
            "streak": streak,
            "xp": int(total_xp),
            "level": level,
            "overallProgress": overall_progress,
            "avgScore": avg_score,
            "timeSpent": time_spent,
            "adaptiveLevel": adaptive_level,
            "subjectStats": subject_stats,
            "user": {
                "id": user.id,
                "name": user.fullname,
                "email": user.email,
                "dob": user.dob
            }
        })
    except Exception as e:
        print(f"Error fetching dashboard data: {e}")
        abort(500, description="Internal Server Error")

def calculate_streak(recent_attempts):
    streak = 0
    today = datetime.now(timezone.utc).date()
    # We only care about the date of the latest attempt
    if recent_attempts:
        dates = {recent_attempts[0].timestamp.date()}
    else:
        dates = set()

    for i in range(10):
        if (today - timedelta(days=i)) in dates:
            streak += 1
        else:
            break
    return streak

def calculate_xp_level(recent_attempts):
    scores = [(attempt.score or 0) * 100 for attempt in recent_attempts]
    total_xp = round(sum(scores))
    level = "Beginner"
    if total_xp > 100:
        level = "Intermediate"
    if total_xp > 300:
        level = "Advanced"
    return total_xp, level

def calculate_overall_progress(user):
    total_chapters = Chapters.query.count()
    # We check if the user has any performance data on chapters
    attempted_chapters = (
        db.session.query(Performance.chapter_id)
        .filter_by(user_id=user.id)
        .distinct()
        .count()
    )
    return round((attempted_chapters / total_chapters) * 100) if total_chapters else 0

def calculate_avg_score(recent_attempts):
    return round(sum([attempt.score or 0 for attempt in recent_attempts]) / len(recent_attempts), 2) if recent_attempts else 0

def calculate_time_spent(recent_attempts):
    total_seconds = sum([attempt.time_taken or 0 for attempt in recent_attempts])
    minutes = total_seconds // 60
    return f"{minutes // 60} hrs {minutes % 60} min"

def calculate_adaptive_level(user):
    perf = Performance.query.filter_by(user_id=user.id).all()
    hard = sum(p.hard_correct for p in perf)
    medium = sum(p.medium_correct for p in perf)
    easy = sum(p.easy_correct for p in perf)
    if hard > medium and hard > easy:
        return "Advanced"
    elif medium > easy:
        return "Intermediate"
    return "Beginner"

def calculate_subject_stats(user):
    subject_stats = []
    chapters = Chapters.query.all()
    for ch in chapters:
        ch_perf = Performance.query.filter_by(user_id=user.id, chapter_id=ch.id).first()
        total_correct = 0
        if ch_perf:
            total_correct = ch_perf.easy_correct + ch_perf.medium_correct + ch_perf.hard_correct
        completion = min(100, total_correct * 10)
        subject_stats.append({
            "name": ch.name,
            "icon": "📘",
            "completion": completion,
            "buttonText": "Continue" if total_correct else "Start Quiz"
        })
    return subject_stats


#available quizzes for a particular user
@app.route('/api/user/quizzes', methods=['GET'])
@login_required
def get_available_quizzes():
    quizzes = Quiz.query.filter_by(user_id=current_user.id).all()
    user = db.session.get(User, current_user.id)

    return jsonify({
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.fullname,
            "dob": user.dob
        },
        "quizzes": [{
            "id": quiz.id,
            "remarks": quiz.remarks,
            "duration": quiz.duration,
            "num_questions": len(quiz.questions)
        } for quiz in quizzes]
    })


@app.route('/api/quiz/<int:quiz_id>', methods=['GET'])
@login_required
def get_quiz_questions(quiz_id):
    quiz = Quiz.query.get_or_404(quiz_id)

    if quiz.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403

    questions = []
    for quiz_question in quiz.questions:
        question = quiz_question.question
        questions.append({
            'id': question.id,
            'question': question.question,
            'option_a': question.option_a,
            'option_b': question.option_b,
            'option_c': question.option_c,
            'option_d': question.option_d,
            'chapter': question.chapter.name if question.chapter else "N/A",
            'difficulty': question.difficulty
        })

    return jsonify({'questions': questions, 'duration': quiz.duration * 60})

def get_user_performance_state(user_id):
    performance_data = Performance.query.filter_by(user_id=user_id).all()

    performance_map = {1: {'easy': {'correct': 0, 'total': 0}, 'medium': {'correct': 0, 'total': 0}, 'hard': {'correct': 0, 'total': 0}},
                       2: {'easy': {'correct': 0, 'total': 0}, 'medium': {'correct': 0, 'total': 0}, 'hard': {'correct': 0, 'total': 0}},
                       3: {'easy': {'correct': 0, 'total': 0}, 'medium': {'correct': 0, 'total': 0}, 'hard': {'correct': 0, 'total': 0}},
                       4: {'easy': {'correct': 0, 'total': 0}, 'medium': {'correct': 0, 'total': 0}, 'hard': {'correct': 0, 'total': 0}},
                       5: {'easy': {'correct': 0, 'total': 0}, 'medium': {'correct': 0, 'total': 0}, 'hard': {'correct': 0, 'total': 0}},
                       6: {'easy': {'correct': 0, 'total': 0}, 'medium': {'correct': 0, 'total': 0}, 'hard': {'correct': 0, 'total': 0}}}

    for record in performance_data:
        performance_map[record.chapter_id]['easy']['correct'] += record.easy_correct
        performance_map[record.chapter_id]['medium']['correct'] += record.medium_correct
        performance_map[record.chapter_id]['hard']['correct'] += record.hard_correct

        performance_map[record.chapter_id]['easy']['total'] += record.easy_total
        performance_map[record.chapter_id]['medium']['total'] += record.medium_total
        performance_map[record.chapter_id]['hard']['total'] += record.hard_total

    state = []
    for chapter in performance_map:
        for difficulty in ['easy', 'medium', 'hard']:
            correct = performance_map[chapter][difficulty]['correct']
            total = performance_map[chapter][difficulty]['total']
            normalized_score = correct / total if total > 0 else 0.0
            state.append(normalized_score)

    return {'state': state}

@app.route("/api/quiz/<int:quiz_id>/submit", methods=["POST"])
@login_required
def submit_quiz(quiz_id):
    data = request.json
    user_answers = data.get('answers')  # { question_id: selected_option }
    time_taken = data.get('time_taken')

    user_quiz = UserQuiz(user_id=current_user.id, quiz_id=quiz_id, time_taken=time_taken)
    db.session.add(user_quiz)
    db.session.commit()

    total_questions = len(user_answers)
    correct_answers = sum(1 for q_id, user_ans in user_answers.items() if Questions.query.get(q_id).correct_answer == user_ans)
    score = correct_answers / total_questions if total_questions > 0 else 0.0

    user_quiz.score = score
    db.session.commit()

    performance_map = {}
    difficulty_count = {}

    for q_id, user_ans in user_answers.items():
        question = Questions.query.get(q_id)
        if not question:
            continue
        is_correct = question.correct_answer == user_ans

        user_response = UserResponse(
            attempt_id=user_quiz.id,
            question_id=question.id,
            user_answer=user_ans,
            is_correct=is_correct,
            chapter_id=question.chapter_id
        )
        db.session.add(user_response)

        ch = question.chapter_id
        diff = question.difficulty
        if ch not in performance_map:
            performance_map[ch] = {'easy': 0, 'medium': 0, 'hard': 0}
        if is_correct:
            performance_map[ch][diff] += 1

        difficulty_count.setdefault((ch, diff), 0)
        difficulty_count[(ch, diff)] += 1

    db.session.commit()

    for ch_id, counts in performance_map.items():
        easy_total = difficulty_count.get((ch_id, 'easy'), 0)
        medium_total = difficulty_count.get((ch_id, 'medium'), 0)
        hard_total = difficulty_count.get((ch_id, 'hard'), 0)


        perf = Performance(
            user_id=current_user.id,
            chapter_id=ch_id,
            quiz_id=quiz_id,
            easy_correct=counts['easy'],
            medium_correct=counts['medium'],
            hard_correct=counts['hard'],
            easy_total=easy_total,
            medium_total=medium_total,
            hard_total=hard_total
        )
        db.session.add(perf)

    db.session.commit()

    try:
        state = get_user_performance_state(current_user.id)['state']
        env = QuizEnv()
        agent = DQNAgent(state_size=18, action_size=18)

        action = agent.act(state)
        next_chapter, next_difficulty = env.decode_action(action)

        new_questions = generate_adaptive_quiz(performance_map, next_chapter, next_difficulty, num_questions=20)

    except Exception as e:
        print(f"[ERROR] Failed to generate adaptive quiz: {e}")
        return jsonify({'error': 'Quiz submitted but new quiz generation failed.'}), 500
    
    quiz_count = Quiz.query.filter_by(user_id=current_user.id).count()
    if quiz_count == 0:
        remarks = "First Step"
    else:
        remarks = f"Next Step {quiz_count}"

    new_quiz = Quiz(user_id=current_user.id, duration=10, remarks=remarks)
    db.session.add(new_quiz)
    db.session.commit()

    for q in new_questions:
        qq = QuizQuestion(quiz_id=new_quiz.id, question_id=q.id)
        db.session.add(qq)

    db.session.commit()

    next_quiz_plan = {
        "selected_chapter": next_chapter,
        "difficulty": next_difficulty,
        "reason": f"Low scores in {next_chapter} ({next_difficulty})"
    }

    return jsonify({
        'message': 'Quiz submitted and new quiz generated.',
        'new_quiz_id': new_quiz.id,
        'nextQuizPlan': next_quiz_plan
    }), 200




@app.route('/quiz-history', methods=['GET'])
@login_required
def get_quiz_history():
    user_id = current_user.id
    quizzes = UserQuiz.query.filter_by(user_id=user_id).all()
    quiz_data = []

    for quiz_attempt in quizzes:
        quiz = db.session.get(Quiz, quiz_attempt.quiz_id)
        if not quiz:
            continue

        responses = UserResponse.query \
            .filter_by(attempt_id=quiz_attempt.id) \
            .join(Questions, UserResponse.question_id == Questions.id) \
            .join(Chapters, Questions.chapter_id == Chapters.id) \
            .add_columns(Chapters.name.label('chapter_name'), Questions.difficulty, UserResponse.is_correct) \
            .all()

        breakdown = {}  # { (chapter, difficulty): { correct: X, incorrect: Y } }

        for _, chapter_name, difficulty, is_correct in responses:
            key = (chapter_name, difficulty)
            if key not in breakdown:
                breakdown[key] = {"correct": 0, "incorrect": 0}
            if is_correct:
                breakdown[key]["correct"] += 1
            else:
                breakdown[key]["incorrect"] += 1

        chapter_entries = []
        total_correct = 0
        total_incorrect = 0

        for (chapter, difficulty), stats in breakdown.items():
            chapter_entries.append({
                "chapter": chapter,
                "difficulty": difficulty,
                "correct": stats["correct"],
                "incorrect": stats["incorrect"]
            })
            total_correct += stats["correct"]
            total_incorrect += stats["incorrect"]

        total_questions = total_correct + total_incorrect
        score = round(quiz_attempt.score * 100, 2)

        quiz_data.append({
            "quiz_id": quiz.id,
            "remarks": quiz.remarks,
            "score": score,
            "total": total_questions,
            "correctAnswers": total_correct,
            "incorrectAnswers": total_incorrect,
            "timeTaken": quiz.duration,
            "timestamp": quiz_attempt.timestamp.isoformat(),
            "chapters": chapter_entries
        })

    return jsonify({
        'user': {
            'id': current_user.id,
            'name': current_user.fullname,
            'email': current_user.email,
            'dob':current_user.dob
        },
        'quizzes': quiz_data
    })





#ADMIN
#all routes
@app.route('/api/users/not_admins', methods=['GET'])
def get_non_admin_users():
    users = User.query.filter_by(is_admin=False).all()
    user_data = [{
        'id': user.id,
        'fullname': user.fullname,
        'email': user.email,
        'dob': user.dob
    } for user in users]
    return jsonify({'users': user_data}), 200

@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user or user.is_admin:
        return jsonify({'error': 'User not found or is admin'}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted successfully'}), 200

@app.route('/api/user/<int:user_id>/performance', methods=['GET'])
def get_user_performance(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        user_quizzes = UserQuiz.query.filter_by(user_id=user_id).all()
        quizzes_performance = []

        for uq in user_quizzes:
            quiz = uq.quiz  # use relationship instead of extra query

            responses = UserResponse.query.filter_by(attempt_id=uq.id).all()

            chapter_stats = {}
            total_correct = 0
            total_questions = 0

            for response in responses:
                chapter = response.chapter 
                if not chapter:
                    continue

                chapter_name = chapter.name
                if chapter_name not in chapter_stats:
                    chapter_stats[chapter_name] = {"easy": [0, 0], "medium": [0, 0], "hard": [0, 0]}

                question = response.question_obj
                level = question.difficulty
                correct = 1 if response.user_answer == question.correct_answer else 0

                chapter_stats[chapter_name][level][0] += correct
                chapter_stats[chapter_name][level][1] += 1
                total_correct += correct
                total_questions += 1

            formatted_chapters = []
            for chapter_name, levels in chapter_stats.items():
                formatted_chapters.append({
                    "chapter": chapter_name,
                    "easy": f"{levels['easy'][0]}/{levels['easy'][1]}",
                    "medium": f"{levels['medium'][0]}/{levels['medium'][1]}",
                    "hard": f"{levels['hard'][0]}/{levels['hard'][1]}",
                })

            quizzes_performance.append({
                "quiz_id": quiz.id,
                "remarks": quiz.remarks,
                "duration": quiz.duration,
                "score": (total_correct / total_questions) * 100 if total_questions else 0,
                "chapter_stats": formatted_chapters
            })

        return jsonify({
            "user": {
                "id": user.id,
                "fullname": user.fullname,
                "email": user.email,
                "dob":user.dob
            },
            "quizzes": quizzes_performance
        })

    except Exception as e:
        print(f"Error fetching performance data: {e}")
        return jsonify({"error": "Internal server error"}), 500



def performance_to_dict(performance):
    return {
        "id": performance.id,
        "user_id": performance.user_id,
        "chapter_id": performance.chapter_id,
        "easy_correct": performance.easy_correct,
        "medium_correct": performance.medium_correct,
        "hard_correct": performance.hard_correct,
    }


if __name__ == '__main__':
    with app.app_context():
        app.run(host='0.0.0.0', port=5000, debug=True)
