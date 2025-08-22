import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Download, BookOpen, Clock } from 'lucide-react';
import { apiService } from '../services/api';

export default function NotesPage() {
  const { courseId, topicId } = useParams();
  const location = useLocation();
  const { topicTitle, courseTitle } = location.state || {};
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateNotes = async () => {
      setIsLoading(true);
      
      try {
        // Removed non-null assertion (!) from topicId
        const response = await apiService.getTopicNotes(topicId);
        setNotes(response.notes || '');
        
        // Removed non-null assertions (!) from courseId and topicId
        await apiService.logStudySession(courseId, topicId, 15);
      } catch (error) {
        console.error('Error loading notes:', error);
        // Fallback to mock notes
        const mockNotes = `
# ${topicTitle}

## Overview
This topic covers the essential concepts and practical applications of ${topicTitle}. You'll learn the fundamental principles, best practices, and real-world implementations.

## Key Concepts

### 1. Fundamental Principles
- **Core Concept 1**: Understanding the basic foundations and why they matter
- **Core Concept 2**: Building blocks that form the foundation of this topic
- **Core Concept 3**: Essential patterns and approaches used in practice

### 2. Practical Applications
- **Use Case 1**: Real-world scenario where this knowledge is applied
- **Use Case 2**: Common implementation patterns and techniques
- **Use Case 3**: Advanced applications and optimizations

### 3. Best Practices
- **Practice 1**: Industry-standard approaches that ensure quality
- **Practice 2**: Common pitfalls to avoid and how to prevent them
- **Practice 3**: Performance considerations and optimization techniques

## Implementation Examples

### Basic Example
\`\`\`
// Example code demonstrating basic implementation
function basicExample() {
  // This shows how to implement the core concept
  return "Basic implementation example";
}
\`\`\`

### Advanced Example
\`\`\`
// More complex example showing advanced usage
function advancedExample(parameters) {
  // Advanced implementation with error handling
  try {
    // Complex logic here
    return processAdvancedLogic(parameters);
  } catch (error) {
    console.error("Error in advanced example:", error);
  }
}
\`\`\`

## Key Takeaways
1. **Main Point 1**: The most important concept to remember
2. **Main Point 2**: Critical implementation detail
3. **Main Point 3**: Best practice that applies universally

## Next Steps
After mastering this topic, you'll be ready to:
- Apply these concepts in real projects
- Move on to more advanced topics
- Combine this knowledge with other skills

## Additional Resources
- Official documentation and guides
- Community tutorials and examples
- Practice exercises and challenges
      `;
        setNotes(mockNotes.trim());
      } finally {
        setIsLoading(false);
      }
    };

    generateNotes();
  }, [topicId, topicTitle, courseId]);

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([notes], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${topicTitle?.replace(/\s+/g, '_')}_notes.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 px-6 py-8">
        <Link to={`/course/${courseId}`} className="inline-flex items-center text-gray-300 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Course
        </Link>
        
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h2 className="text-2xl font-semibold text-white mb-2">Generating Notes</h2>
          <p className="text-gray-400 text-center max-w-md">
            AI is creating comprehensive notes for {topicTitle}...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link to={`/course/${courseId}`} className="inline-flex items-center text-gray-300 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Course
        </Link>
        
        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{topicTitle}</h1>
              <p className="text-gray-300">From {courseTitle}</p>
            </div>
            <button
              onClick={handleDownload}
              className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Notes
            </button>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 text-sm">
            <div className="flex items-center text-gray-300">
              <BookOpen className="w-4 h-4 mr-1" />
              AI-Generated Notes
            </div>
            <div className="flex items-center text-gray-300">
              <Clock className="w-4 h-4 mr-1" />
              ~15 min read
            </div>
          </div>
        </div>
      </div>

      {/* Notes Content */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 mb-8">
        <div className="prose prose-invert prose-purple max-w-none">
          <div className="whitespace-pre-wrap text-gray-300 leading-relaxed">
            {notes.split('\n').map((line, index) => {
            // Heading 1
            if (line.startsWith('# ')) {
              return (
                <h1 key={index} className="text-3xl font-bold text-white mb-6 mt-8 first:mt-0">
                  {line.substring(2)}
                </h1>
              );
            } 
            // Heading 2
            else if (line.startsWith('## ')) {
              return (
                <h2 key={index} className="text-2xl font-semibold text-purple-300 mb-4 mt-8">
                  {line.substring(3)}
                </h2>
              );
            } 
            // Heading 3
            else if (line.startsWith('### ')) {
              return (
                <h3 key={index} className="text-xl font-semibold text-blue-300 mb-3 mt-6">
                  {line.substring(4)}
                </h3>
              );
            } 
            // Bullet with bold key
            else if (line.startsWith('- **')) {
              const match = line.match(/- \*\*(.*?)\*\*: (.*)/);
              if (match) {
                return (
                  <div key={index} className="mb-2">
                    <span className="text-purple-400 font-semibold">• {match[1]}:</span>{' '}
                    <span className="text-gray-300">{match[2]}</span>
                  </div>
                );
              }
            } 
            // Code block
            else if (line.startsWith('```')) {
              return (
                <div
                  key={index}
                  className="bg-gray-900 p-4 rounded-lg my-4 font-mono text-sm text-green-300 border border-gray-600"
                >
                  {line}
                </div>
              );
            } 
            // Bold text anywhere in line (**something**)
            else {
              // Replace **bold** with <strong>
              const parts = line.split(/(\*\*.*?\*\*)/g);
              return (
                <p key={index} className="mb-3 text-gray-300 leading-relaxed">
                  {parts.map((part, i) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                      return (
                        <strong key={i} className="text-white font-semibold">
                          {part.slice(2, -2)}
                        </strong>
                      );
                    }
                    return part;
                  })}
                </p>
              );
            }
          })}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <Link
          to={`/course/${courseId}/quiz/${topicId}`}
          state={{ topicTitle, courseTitle }}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors text-center"
        >
          Take Quiz on This Topic
        </Link>
        <Link
          to={`/course/${courseId}`}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors text-center"
        >
          Back to Course
        </Link>
      </div>
    </div>
  );
}
