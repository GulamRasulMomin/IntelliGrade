import json
import requests
import time
from django.conf import settings
from requests.exceptions import RequestException, ConnectionError
from typing import List, Dict, Optional, Union

class AIService:
    def __init__(self):
        self.gemini_api_key = settings.GEMINI_API_KEY
        self.youtube_api_key = settings.YOUTUBE_API_KEY
        self.max_retries = 5
        self.retry_delay = 3
        self.timeout = 30  # seconds

    def generate_course_roadmap(self, course_name: str, difficulty: str = 'beginner', duration_weeks: int = 4) -> Dict:
        """
        Generate a complete course roadmap using Gemini API with retry logic
        """
        prompt = f'''
        Create a detailed learning roadmap for a course titled "{course_name}".
        - Target difficulty: {difficulty}
        - Duration: {duration_weeks} weeks

        Return a JSON object with this exact structure:
        {{
            "description": "Brief course description",
            "topics": [
                {{
                    "title": "Topic Title",
                    "description": "What this topic covers",
                    "estimated_time": "e.g., '2 hours'",
                    "notes": "Detailed learning notes for the topic. notes should be half page"
                }}
            ]
        }}

        Make it practical, {difficulty}-friendly, and clearly structured.
        IMPORTANT: Return ONLY the raw JSON without any markdown formatting or code block wrappers.
        '''.strip()

        response = self._call_gemini_api(prompt)
        print("course roadmap response",response)
        
        if response:
            try:
                if isinstance(response, str):
                    response = self._clean_api_response(response)
                    roadmap = json.loads(response)
                else:
                    roadmap = response
                
                if self._validate_roadmap(roadmap):
                    return roadmap
            except (json.JSONDecodeError, ValueError) as e:
                print(f"❌ Failed to parse roadmap: {str(e)}")

        return self._get_mock_roadmap(course_name, difficulty)

    def _clean_api_response(self, message: str) -> str:
        """Clean the API response by removing markdown wrappers and fixing common issues"""
        # Remove markdown code blocks
        if message.startswith('```json') and message.endswith('```'):
            message = message[7:-3].strip()
        elif message.startswith('```') and message.endswith('```'):
            message = message[3:-3].strip()
        
        # Sometimes Gemini adds extra text before/after the JSON
        # Try to find the first { or [ and last } or ]
        json_start = min(
            message.find('{') if '{' in message else float('inf'),
            message.find('[') if '[' in message else float('inf')
        )
        json_end = max(
            message.rfind('}') if '}' in message else -1,
            message.rfind(']') if ']' in message else -1
        )
        
        if json_start != float('inf') and json_end != -1:
            message = message[json_start:json_end+1]
        
        return message.strip()

    def generate_quiz(self, topic_title: str, course_name: str, num_questions: int = 5) -> list:
        prompt = f'''
        Create a {num_questions}-question quiz about "{topic_title}" in "{course_name}".
        Each question should have:
        - "id": string (unique for each question)
        - "question": the question text
        - "options": array of 4 answer options
        - "correct_answer": index (0-3) of the correct option
        - "explanation": a brief explanation of the answer

        Return ONLY a JSON array of questions, no extra text or markdown.
        '''
        response = self._call_gemini_api(prompt)
        print("quiz response",response)
        if response:
            try:
                # Clean and parse the response
                if isinstance(response, str):
                    response = self._clean_api_response(response)
                quiz = json.loads(response)
                # Validate structure
                if self._validate_quiz(quiz):
                    return quiz
            except Exception as e:
                print(f"Quiz parse error: {e}")
        # Fallback to mock quiz
        return self._get_mock_quiz(topic_title, course_name, num_questions)
    def get_youtube_resources(self, topic: str) -> List[Dict]:
        """Fetch relevant YouTube videos for a topic with error handling"""
        if not self.youtube_api_key:
            return []

        try:
            url = "https://www.googleapis.com/youtube/v3/search"
            params = {
                'part': 'snippet',
                'q': f"{topic} tutorial",
                'type': 'video',
                'maxResults': 5,
                'key': self.youtube_api_key
            }

            response = requests.get(url, params=params, timeout=self.timeout)
            if response.status_code == 200:
                return self._parse_youtube_response(response.json())
                
        except Exception as e:
            print(f"❌ YouTube API error: {str(e)}")
        
        return []

    def _call_gemini_api(self, prompt: str) -> Optional[Union[Dict, str]]:
        """Make API call to Gemini with retry logic"""
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.gemini_api_key}"
        
        payload = {
            "contents": [{
                "role": "user",
                "parts": [{"text": prompt}]
            }],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 2048,
                "topP": 1,
                "topK": 40
            }
        }

        for attempt in range(self.max_retries):
            try:
                response = requests.post(
                    url,
                    headers={"Content-Type": "application/json"},
                    json=payload,
                    timeout=self.timeout
                )

                if response.status_code == 200:
                    result = response.json()
                    return result['candidates'][0]['content']['parts'][0]['text']
                
                print(f"❌ Gemini API attempt {attempt + 1} failed: {response.status_code}")
                if attempt == self.max_retries - 1:
                    return None

            except (RequestException, ConnectionError) as e:
                print(f"❌ Connection attempt {attempt + 1} failed: {str(e)}")
                if attempt == self.max_retries - 1:
                    return None
                time.sleep(self.retry_delay * (attempt + 1))

        return None

    def _validate_roadmap(self, roadmap: Dict) -> bool:
        """Validate the roadmap structure"""
        required_keys = {'description', 'topics'}
        if not all(key in roadmap for key in required_keys):
            return False
            
        topic_keys = {'title', 'description', 'estimated_time', 'notes'}
        return all(
            all(key in topic for key in topic_keys)
            for topic in roadmap['topics']
        )

    def _validate_quiz(self, quiz: List) -> bool:
        """Validate the quiz structure"""
        if not isinstance(quiz, list):
            return False
            
        required_fields = {'id', 'question', 'options', 'correct_answer', 'explanation'}
        return all(
            all(field in item for field in required_fields) and
            isinstance(item['options'], list) and
            len(item['options']) == 4 and
            0 <= item['correct_answer'] <= 3
            for item in quiz
        )

    def _parse_youtube_response(self, data: Dict) -> List[Dict]:
        """Parse YouTube API response"""
        videos = []
        for item in data.get('items', []):
            videos.append({
                'title': item['snippet']['title'],
                'url': f"https://www.youtube.com/watch?v={item['id']['videoId']}",
                'thumbnail': item['snippet']['thumbnails']['default']['url']
            })
        return videos

    def _get_mock_roadmap(self, course_name: str, difficulty: str) -> Dict:
        """Fallback mock roadmap"""
        return {
            "description": f"Master {course_name} with our AI-curated learning path ({difficulty} level).",
            "topics": [
                {
                    "title": f"Introduction to {course_name}",
                    "description": f"Basic concepts and setup for {course_name}",
                    "estimated_time": "2 hours",
                    "notes": self._generate_topic_notes("Introduction", course_name)
                },
                {
                    "title": "Core Concepts",
                    "description": "Fundamental principles and theories",
                    "estimated_time": "4 hours",
                    "notes": self._generate_topic_notes("Core Concepts", course_name)
                }
            ]
        }

    def _get_mock_quiz(self, topic_title: str, course_name: str, num_questions: int) -> List[Dict]:
        """Fallback mock quiz"""
        base_questions = [
            {
                "id": "1",
                "question": f"What is the main purpose of {topic_title}?",
                "options": [
                    "Fundamental understanding",
                    "Random usage",
                    "Deprecated topic",
                    "Unrelated concept"
                ],
                "correct_answer": 0,
                "explanation": "It's a fundamental concept needed before moving ahead."
            },
            {
                "id": "2",
                "question": f"How does {topic_title} help in {course_name}?",
                "options": [
                    "Doesn't help at all",
                    "Helps understand core logic",
                    "Is optional",
                    "Only theoretical"
                ],
                "correct_answer": 1,
                "explanation": f"It helps build a solid base for {course_name}."
            }
        ]
        return base_questions[:num_questions]

    def _generate_topic_notes(self, topic_title: str, course_name: str) -> str:
        """Generate mock topic notes"""
        return f"""
        # {topic_title}

        ## Overview
        Key concepts about {topic_title} in {course_name}.

        ## What You'll Learn
        - Fundamental principles
        - Practical applications
        - Common use cases

        ## Example
        ```python
        def example():
            return "Practical {topic_title.lower()} example"
        ```
        """.strip()