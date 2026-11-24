import React from 'react';
import { STUDENT_CREDITS } from '@/lib/constants';
import { GraduationCap, Award } from 'lucide-react';

export default function ProjectCredits() {
  return (
    <footer className="mt-auto border-t border-cream-border bg-white/90 py-4 px-4 sm:px-6 shadow-cherry-sm">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        
        {/* Left Section: Student Profile */}
        <div className="flex items-center gap-2 text-darkText">
          <div className="w-6 h-6 rounded-md bg-blush-light border border-blush flex items-center justify-center text-cherry">
            <GraduationCap className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-darkText-muted">Developed by: </span>
            <strong className="text-cherry font-bold tracking-wide">
              {STUDENT_CREDITS.developerName}
            </strong>
            <span className="text-rose mx-1.5">•</span>
            <span className="text-darkText-muted">Student ID: </span>
            <span className="font-mono text-darkText font-semibold">{STUDENT_CREDITS.studentId}</span>
          </div>
        </div>

        {/* Right Section: Course & Institute */}
        <div className="flex items-center gap-2 text-darkText-muted">
          <Award className="w-3.5 h-3.5 text-cherry" />
          <span>Course: <strong className="text-darkText">{STUDENT_CREDITS.course}</strong></span>
          <span className="text-cream-border">•</span>
          <span>Institute: <strong className="text-darkText">{STUDENT_CREDITS.institute}</strong></span>
        </div>

      </div>
    </footer>
  );
}
