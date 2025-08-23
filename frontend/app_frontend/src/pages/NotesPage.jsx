import React, { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { ArrowLeft, Download, BookOpen, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { apiService } from "../services/api";

export default function NotesPage() {
  const { courseId, topicId } = useParams();
  const location = useLocation();
  const { topicTitle, courseTitle } = location.state || {};
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateNotes = async () => {
      setIsLoading(true);
      try {
        const response = await apiService.getTopicNotes(topicId);
        setNotes(response.notes || "");
        await apiService.logStudySession(courseId, topicId, 15);
      } catch (error) {
        console.error("Error loading notes:", error);
        setNotes(`# ${topicTitle}\n\n_Fallback sample notes..._`);
      } finally {
        setIsLoading(false);
      }
    };

    generateNotes();
  }, [topicId, topicTitle, courseId]);

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([notes], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${topicTitle?.replace(/\s+/g, "_")}_notes.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Markdown-ish rendering with code block handling
  const renderNotes = () => {
    const lines = notes.split("\n");
    const content = [];
    let codeBlock = null;

    lines.forEach((line, index) => {
      if (line.startsWith("```")) {
        if (codeBlock) {
          // close block
          content.push(
            <pre
              key={index}
              className="bg-gray-900 p-4 rounded-lg my-4 font-mono text-sm text-green-300 border border-gray-600 overflow-x-auto"
            >
              <code>{codeBlock.join("\n")}</code>
            </pre>
          );
          codeBlock = null;
        } else {
          codeBlock = [];
        }
      } else if (codeBlock) {
        codeBlock.push(line);
      } else if (line.startsWith("# ")) {
        content.push(
          <h1
            key={index}
            className="text-3xl font-bold text-white mb-6 mt-8 first:mt-0"
          >
            {line.substring(2)}
          </h1>
        );
      } else if (line.startsWith("## ")) {
        content.push(
          <h2
            key={index}
            className="text-2xl font-semibold text-purple-300 mb-4 mt-8"
          >
            {line.substring(3)}
          </h2>
        );
      } else if (line.startsWith("### ")) {
        content.push(
          <h3
            key={index}
            className="text-xl font-semibold text-blue-300 mb-3 mt-6"
          >
            {line.substring(4)}
          </h3>
        );
      } else if (line.startsWith("- **")) {
        const match = line.match(/- \*\*(.*?)\*\*: (.*)/);
        if (match) {
          content.push(
            <div key={index} className="mb-2">
              <span className="text-purple-400 font-semibold">
                • {match[1]}:
              </span>{" "}
              <span className="text-gray-300">{match[2]}</span>
            </div>
          );
        }
      } else {
        const parts = line.split(/(\*\*.*?\*\*)/g);
        content.push(
          <p key={index} className="mb-3 text-gray-300 leading-relaxed">
            {parts.map((part, i) =>
              part.startsWith("**") && part.endsWith("**") ? (
                <strong key={i} className="text-white font-semibold">
                  {part.slice(2, -2)}
                </strong>
              ) : (
                part
              )
            )}
          </p>
        );
      }
    });

    return content;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 px-6 py-8 flex flex-col items-center justify-center">
        <motion.div
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mb-6"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
        <h2 className="text-2xl font-semibold text-white mb-2">
          Generating Notes
        </h2>
        <p className="text-gray-400 text-center max-w-md">
          AI is creating comprehensive notes for {topicTitle}...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 px-4 sm:px-6 lg:px-12 py-8">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Link
          to={`/course/${courseId}`}
          className="inline-flex items-center text-gray-300 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Course
        </Link>

        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {topicTitle}
              </h1>
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
      </motion.div>

      {/* Notes Content */}
      <motion.div
        className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {renderNotes()}
      </motion.div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
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
