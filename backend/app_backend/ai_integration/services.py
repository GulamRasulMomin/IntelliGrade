import json
import requests
import time
import re
import ast
from django.conf import settings
from requests.exceptions import RequestException, ConnectionError
from typing import Dict, Optional, Union


class AIService:
    def __init__(self):
        self.gemini_api_key = settings.GEMINI_API_KEY
        self.max_retries = 6
        self.retry_delay = 4
        self.timeout = 100

    # ----------------------------
    # Course Roadmap Generation
    # ----------------------------
    def generate_course_roadmap(
        self,
        course_name: str,
        difficulty: str = "beginner",
        duration_weeks: int = 4,
    ) -> Dict:
        prompt = f"""
        Create a comprehensive and deeply detailed learning roadmap for a course titled "{course_name}".

        Target difficulty: {difficulty}
        Duration: {duration_weeks} weeks

        The output must be structured in valid JSON with the following exact schema:

        {{
            "description": "Brief course description",
            "topics": [
                {{
                    "title": "Topic Title",
                    "description": "What this topic covers",
                    "estimated_time": "e.g., '2 hours'",
                    "notes": "Extensive, full-length, textbook-style practical learning guide..."
                }}
            ]
        }}

        Additional Requirements:
        - Each notes field must be in-depth, ~600–1000 words per topic.
        - Use clear section headers, examples, and exercises.
        - Match the {difficulty} level but provide depth for mastery.
        - Only output the raw JSON—no extra commentary.
        """.strip()

        response = self._call_gemini_api(prompt)
        print(f"Gemini API response: {response[:500]}...")  # show preview

        if response:
            try:
                if isinstance(response, str):
                    response = self._clean_api_response(response)
                    roadmap = self._safe_json_loads(response)
                else:
                    roadmap = response

                if roadmap and self._validate_roadmap(roadmap):
                    return roadmap
            except Exception as e:
                print(f"Failed to parse roadmap: {e}")

        return self._get_fallback_roadmap(course_name, difficulty)

    # ----------------------------
    # Quiz Generation
    # ----------------------------
    def generate_quiz(
        self, topic_title: str, course_name: str, num_questions: int = 5
    ) -> list:
        prompt = f"""
        Create a {num_questions}-question quiz about "{topic_title}" in "{course_name}".
        Each question should have:
        - "id": string (unique for each question)
        - "question": the question text
        - "options": array of 4 answer options
        - "correct_answer": index (0-3) of the correct option
        - "explanation": a brief explanation

        Return ONLY a JSON array of questions, no extra text or markdown.
        """

        response = self._call_gemini_api(prompt)

        if response:
            try:
                if isinstance(response, str):
                    response = self._clean_api_response(response)
                quiz = self._safe_json_loads(response)

                if self._validate_quiz(quiz):
                    return quiz
            except Exception as e:
                print(f"Quiz parse error: {e}")

        return self._get_fallback_quiz(topic_title, course_name, num_questions)

    # ----------------------------
    # Gemini API Call
    # ----------------------------
    def _call_gemini_api(self, prompt: str) -> Optional[Union[Dict, str]]:
        url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/"
            f"gemini-1.5-flash:generateContent?key={self.gemini_api_key}"
        )

        payload = {
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 4096,  # increase tokens for long notes
                "topP": 1,
                "topK": 40,
            },
        }

        for attempt in range(self.max_retries):
            try:
                response = requests.post(
                    url,
                    headers={"Content-Type": "application/json"},
                    json=payload,
                    timeout=self.timeout,
                )

                if response.status_code == 200:
                    result = response.json()
                    return result["candidates"][0]["content"]["parts"][0]["text"]

                print(f"Gemini API attempt {attempt + 1} failed: {response.status_code}")
                if attempt == self.max_retries - 1:
                    return None

            except (RequestException, ConnectionError) as e:
                print(f"Connection attempt {attempt + 1} failed: {e}")
                if attempt == self.max_retries - 1:
                    return None
                time.sleep(self.retry_delay * (attempt + 1))

        return None

    # ----------------------------
    # Response Cleaning & Parsing
    # ----------------------------
    def _clean_api_response(self, message: str) -> str:
        """Clean Gemini API response for safe JSON parsing."""
        if not message:
            return ""

        # Remove Markdown fences like ```json ... ```
        message = re.sub(r"```(?:json|javascript|js|python)?", "", message, flags=re.IGNORECASE)
        message = message.replace("```", "")

        # Strip leading/trailing whitespace
        message = message.strip()

        return message

    def _safe_json_loads(self, s: str):
        """Try parsing JSON safely, with fallbacks."""
        try:
            return json.loads(s)
        except json.JSONDecodeError:
            # Try removing trailing commas
            fixed = re.sub(r",(\s*[}\]])", r"\1", s)
            try:
                return json.loads(fixed)
            except json.JSONDecodeError:
                try:
                    return ast.literal_eval(s)
                except Exception:
                    print("Final parse fallback triggered, returning raw string")
                    return {"raw_response": s}

    # ----------------------------
    # Validation
    # ----------------------------
    def _validate_roadmap(self, roadmap: dict) -> bool:
        """Ensure roadmap has minimal structure, don't reject rich notes."""
        if not isinstance(roadmap, dict):
            return False
        
        if "description" not in roadmap or not isinstance(roadmap["description"], str):
            return False

        if "topics" not in roadmap or not isinstance(roadmap["topics"], list) or not roadmap["topics"]:
            return False

        for topic in roadmap["topics"]:
            if not isinstance(topic, dict):
                return False
            if "title" not in topic or "description" not in topic or "notes" not in topic:
                return False
            if not all(isinstance(topic[k], str) for k in ["title", "description", "notes"]):
                return False

        return True

    def _validate_quiz(self, quiz: list) -> bool:
        if not isinstance(quiz, list):
            return False

        required_fields = {"id", "question", "options", "correct_answer", "explanation"}
        return all(
            all(field in item for field in required_fields)
            and isinstance(item["options"], list)
            and len(item["options"]) == 4
            and isinstance(item["correct_answer"], int)
            and 0 <= item["correct_answer"] <= 3
            for item in quiz
        )

    # ----------------------------
    # Fallbacks
    # ----------------------------
    def _get_fallback_roadmap(self, course_name: str, difficulty: str) -> Dict:
        return {
            "description": f"Master {course_name} with our AI-curated learning path ({difficulty} level).",
            "topics": [
                {
                    "title": f"Introduction to {course_name}",
                    "description": f"Basic concepts and setup for {course_name}",
                    "estimated_time": "2 hours",
                    "notes": self._generate_topic_notes("Introduction", course_name),
                },
                {
                    "title": "Core Concepts",
                    "description": "Fundamental principles and theories",
                    "estimated_time": "4 hours",
                    "notes": self._generate_topic_notes("Core Concepts", course_name),
                },
            ],
        }

    def _get_fallback_quiz(
        self, topic_title: str, course_name: str, num_questions: int
    ) -> list:
        base_questions = [
            {
                "id": "1",
                "question": f"What is the main purpose of {topic_title}?",
                "options": [
                    "Fundamental understanding",
                    "Random usage",
                    "Deprecated topic",
                    "Unrelated concept",
                ],
                "correct_answer": 0,
                "explanation": "It's a fundamental concept needed before moving ahead.",
            },
            {
                "id": "2",
                "question": f"How does {topic_title} help in {course_name}?",
                "options": [
                    "Doesn't help at all",
                    "Helps understand core logic",
                    "Is optional",
                    "Only theoretical",
                ],
                "correct_answer": 1,
                "explanation": f"It helps build a solid base for {course_name}.",
            },
        ]
        return base_questions[:num_questions]

    # ----------------------------
    # Helpers
    # ----------------------------
    def _generate_topic_notes(self, topic_title: str, course_name: str) -> str:
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
