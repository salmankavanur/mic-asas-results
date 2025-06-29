"use client";

import React from 'react';

interface ScoringComponent {
  key: string
  label: string
  max?: number
  computed?: boolean
}

interface Subject {
  name: string
  nameArabic: string
  scoringScheme: ScoringComponent[]
}

interface SubjectMark {
  subject: {
    name: string
    nameArabic: string
    scoringScheme: ScoringComponent[]
  }
  marks: Record<string, number> | { absent: true } // allow absent
}

interface ResultCardProps {
  examTitle: string
  className: string
  student: {
    regNumber: string
    name: string
    profilePhoto?: string // add profilePhoto to student prop
  }
  subjects: SubjectMark[]
  grandTotal: number
  rank: number
  percentage: number
}

export default function ResultCard({
  examTitle,
  className,
  student,
  subjects,
  grandTotal,
  rank,
  percentage,
}: ResultCardProps) {
  const getGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: "A+", color: "text-green-700" }
    if (percentage >= 80) return { grade: "A", color: "text-green-600" }
    if (percentage >= 70) return { grade: "B+", color: "text-blue-600" }
    if (percentage >= 60) return { grade: "B", color: "text-blue-500" }
    if (percentage >= 50) return { grade: "C+", color: "text-yellow-600" }
    if (percentage >= 40) return { grade: "C", color: "text-orange-500" }
    return { grade: "F", color: "text-red-600" }
  }

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100
    if (percentage >= 80) return "text-green-700 bg-green-50"
    if (percentage >= 60) return "text-blue-700 bg-blue-50"
    if (percentage >= 40) return "text-yellow-700 bg-yellow-50"
    return "text-red-700 bg-red-50"
  }

  const getRankSuffix = (rank: number) => {
    if (rank === 1) return "st"
    if (rank === 2) return "nd"
    if (rank === 3) return "rd"
    return "th"
  }

  const gradeInfo = getGrade(percentage)

  // Calculate failed subjects (less than 35% or absent)
  const failedSubjects = subjects.reduce((count, subjectMark) => {
    const { subject, marks } = subjectMark;
    const isAbsent = 'absent' in marks && marks.absent;
    const totalMax = subject.scoringScheme.reduce((acc, curr) => acc + (curr.max || 0), 0);
    const totalObtained = !isAbsent ? subject.scoringScheme.reduce((acc, curr) => {
      const val = (marks as any)[curr.key];
      return acc + (typeof val === 'number' ? val : 0);
    }, 0) : 0;
    const subjectPercentage = isAbsent ? 0 : (totalObtained / (totalMax || 1)) * 100;
    if (isAbsent || subjectPercentage < 35) return count + 1;
    return count;
  }, 0);

  // Calculate accurate maxTotal from subjects: only sum non-computed, numeric max values
  const maxTotal = subjects.reduce((sum, subjectMark) => {
    return sum + subjectMark.subject.scoringScheme.reduce((acc, curr) => {
      if (curr.computed) return acc;
      if (typeof curr.max !== 'number') return acc;
      return acc + curr.max;
    }, 0);
  }, 0);

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-2xl print:shadow-none print:max-w-none">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white p-8 print:bg-blue-800">
        <div className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <img src="/images/logo.webp" alt="Logo" className="w-10 h-10 object-contain" />
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold leading-tight">{examTitle}</h1>
          </div>
        </div>
      </div>

      {/* Student Info Section */}
      <div className="bg-gray-50 px-8 py-6 border-b-2 border-blue-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 flex items-center space-x-6">
            <div>
              <img
                src={student.profilePhoto || "/images/student-avatar.png"}
                alt="Profile Photo"
                className="w-20 h-20 object-cover rounded-full border"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/images/student-avatar.png";
                }}
              />
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600 uppercase tracking-wide">Student Name</label>
                <p className="text-2xl font-bold text-gray-900">{student.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 uppercase tracking-wide">Class</label>
                <p className="text-lg font-semibold text-gray-800">{className}</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600 uppercase tracking-wide">Registration No.</label>
              <p className="text-xl font-bold text-blue-600">{student.regNumber}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 uppercase tracking-wide">Examination</label>
              <p className="text-sm font-medium text-gray-700">Final Semester 2024-25</p>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <div className="w-1 h-6 bg-blue-600 mr-3"></div>
          Subject-wise Performance
        </h2>

        <div className="space-y-4 mb-8">
          {subjects.map((subjectMark, index) => {
            const { subject, marks } = subjectMark
            const isAbsent = 'absent' in marks && marks.absent
            const totalMax = subject.scoringScheme.reduce((acc, curr) => acc + (curr.max || 0), 0)
            const totalObtained = !isAbsent ? subject.scoringScheme.reduce((acc, curr) => {
              const val = (marks as any)[curr.key];
              return acc + (typeof val === 'number' ? val : 0);
            }, 0) : 0
            const subjectPercentage = isAbsent ? 0 : (totalObtained / (totalMax || 1)) * 100
            const isFailed = isAbsent || subjectPercentage < 35;
            return (
              <div key={index} className={`border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow ${isFailed ? 'bg-red-50' : ''}`}>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Subject Name */}
                  <div className="md:col-span-4">
                    <h3 className="font-semibold text-gray-900 text-lg">{subject.name}</h3>
                    <p
                      className="text-lg arabic-text text-blue-700 mt-1"
                      style={{ fontFamily: "Noto Sans Arabic, Arial, sans-serif" }}
                    >
                      {subject.nameArabic}
                    </p>
                    {isFailed && (
                      <span className="inline-block mt-2 px-2 py-1 text-xs font-bold text-white bg-red-500 rounded">Failed</span>
                    )}
                  </div>

                  {/* Marks Breakdown */}
                  <div className="md:col-span-6">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      {isAbsent ? (
                        <div className="col-span-3 text-red-600 font-bold text-lg">Absent</div>
                      ) : (
                        subject.scoringScheme.map((component, idx) => {
                          const markVal = (marks as any)[component.key];
                          const maxVal = component.max ?? '-';
                          const isComponentAbsent = typeof markVal === 'string' && markVal === 'A';
                          return (
                            <div key={idx}>
                              <label className="text-xs font-medium text-gray-500 uppercase">{component.label}</label>
                              <div
                                className={`text-lg font-bold px-2 py-1 rounded ${
                                  isComponentAbsent
                                    ? 'text-red-600 bg-red-50'
                                    : getScoreColor(typeof markVal === 'number' ? markVal : 0, typeof component.max === 'number' ? component.max : 0)
                                }`}
                              >
                                {isComponentAbsent ? 'A' : `${typeof markVal === 'number' ? markVal : 0}/${maxVal}`}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Performance Bar */}
                  <div className="md:col-span-2">
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-600 mb-1">{isAbsent ? '--' : subjectPercentage.toFixed(1) + '%'}</div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-300 ${
                            isAbsent
                              ? 'bg-gray-400'
                              : subjectPercentage >= 80
                                ? "bg-green-500"
                                : subjectPercentage >= 60
                                  ? "bg-blue-500"
                                  : subjectPercentage >= 40
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                          }`}
                          style={{ width: isAbsent ? '100%' : `${Math.min(subjectPercentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <div className="w-1 h-6 bg-blue-600 mr-3"></div>
            Overall Performance
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <label className="text-sm font-medium text-gray-600 uppercase tracking-wide block mb-2">
                  Total Marks
                </label>
                <div className="text-3xl font-bold text-blue-600">{grandTotal}</div>
                <div className="text-sm text-gray-500">out of {maxTotal}</div>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <label className="text-sm font-medium text-gray-600 uppercase tracking-wide block mb-2">
                  Percentage
                </label>
                <div className={`text-3xl font-bold ${gradeInfo.color}`}>{percentage}%</div>
                <div className="text-sm text-gray-500">Overall Score</div>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <label className="text-sm font-medium text-gray-600 uppercase tracking-wide block mb-2">Grade</label>
                <div className={`text-3xl font-bold ${gradeInfo.color}`}>{gradeInfo.grade}</div>
                <div className="text-sm text-gray-500">Letter Grade</div>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <label className="text-sm font-medium text-gray-600 uppercase tracking-wide block mb-2">
                  Class Rank
                </label>
                <div className="text-3xl font-bold text-purple-600">
                  {rank}
                  <span className="text-lg">{getRankSuffix(rank)}</span>
                </div>
                <div className="text-sm text-gray-500">Position</div>
              </div>
            </div>
          </div>

          {/* Performance Indicator */}
          <div className="mt-6">
            <label className="text-sm font-medium text-gray-600 uppercase tracking-wide block mb-3">
              Overall Performance
            </label>
            <div className="w-full bg-gray-200 rounded-full h-4 relative">
              <div
                className={`h-4 rounded-full transition-all duration-500 ${
                  percentage >= 80
                    ? "bg-gradient-to-r from-green-400 to-green-600"
                    : percentage >= 60
                      ? "bg-gradient-to-r from-blue-400 to-blue-600"
                      : percentage >= 40
                        ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                        : "bg-gradient-to-r from-red-400 to-red-600"
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-white drop-shadow">{percentage}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Remarks Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Performance Analysis</h3>
            <p className="text-sm text-gray-700">
              {failedSubjects >= 3 ? (
                <span className="text-red-600 font-bold">Failed in Exam (Failed in {failedSubjects} subjects)</span>
              ) : (
                percentage >= 80
                  ? "Excellent performance! Keep up the outstanding work."
                  : percentage >= 60
                    ? "Good performance with room for improvement in some subjects."
                    : percentage >= 40
                      ? "Satisfactory performance. Focus on weaker subjects for better results."
                      : "Needs significant improvement. Consider additional support and practice."
              )}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Date & Signature</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-700">Result Published: {new Date().toLocaleDateString()}</p>
              <div className="mt-4 pt-4 border-t border-gray-300">
                <img src="/images/faizy-sign.svg" alt="Principal's Signature" className="h-10 mx-auto mb-1" />
                <p className="text-xs text-gray-500 text-center">Principal's Signature</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-100 px-8 py-4 text-center border-t">
        <p className="text-sm text-gray-600">
          This is a computer-generated result. For any queries, please contact the examination department.
        </p>
      </div>
    </div>
  )
}