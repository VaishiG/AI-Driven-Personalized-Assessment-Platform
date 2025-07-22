from quiz_env import QuizEnv
from dqn_agent import DQNAgent
import random
import torch
import os
from models import Questions

AGENT_WEIGHTS_PATH = "dqn_agent_weights.pth"

def generate_adaptive_quiz(user_performance, target_chapter=None, target_difficulty=None, num_questions=20):
    env = QuizEnv()
    agent = DQNAgent(state_size=18, action_size=18)  # 6 chapters * 3 difficulties

    if os.path.exists(AGENT_WEIGHTS_PATH):
        agent.model.load_state_dict(torch.load(AGENT_WEIGHTS_PATH))
        agent.model.eval()

    state = env.get_state(user_performance)
    questions = []
    selected_actions = set()
    used_ids = set()
    max_attempts = 100
    attempts = 0

    while len(questions) < num_questions and attempts < max_attempts:
        attempts += 1

        if target_chapter is not None and target_difficulty is not None:
            action = env.encode_action(target_chapter, target_difficulty)
        else:
            action = agent.act(state)

        if action in selected_actions:
            continue
        selected_actions.add(action)

        chapter, difficulty = env.decode_action(action)

        available_questions = Questions.query.filter_by(chapter_id=chapter, difficulty=difficulty).all()
        random.shuffle(available_questions)
        for q in available_questions:
            if q.id not in used_ids:
                questions.append(q)
                used_ids.add(q.id)
                break 

    if len(questions) < num_questions:
        all_questions = Questions.query.all()
        remaining = [q for q in all_questions if q.id not in used_ids]
        random.shuffle(remaining)
        questions.extend(remaining[:num_questions - len(questions)])

    return questions
