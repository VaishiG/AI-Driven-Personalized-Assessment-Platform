import numpy as np

class QuizEnv:
    def __init__(self, chapter_count=6):
        self.chapter_count = chapter_count
        self.action_space = chapter_count * 3  # 6 chapters * 3 difficulty levels
        self.state = None

    def get_state(self, performance):
        state = []
        for chapter_id in range(1, self.chapter_count + 1):
            stats = performance.get(chapter_id, {'easy': 0, 'medium': 0, 'hard': 0})

            total = sum(stats.values()) or 1
            state.extend([ 
                stats['easy'] / total,
                stats['medium'] / total,
                stats['hard'] / total 
            ])
        self.state = np.array(state)
        return self.state

    def decode_action(self, action):
        chapter = action // 3 + 1
        difficulty = ['easy', 'medium', 'hard'][action % 3]
        return chapter, difficulty

    def encode_action(self, chapter, difficulty):
        difficulty_map = {'easy': 0, 'medium': 1, 'hard': 2}
        return (chapter - 1) * 3 + difficulty_map[difficulty]
