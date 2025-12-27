
import React from 'react';
import { Teacher, Subject } from '../types';

interface TeacherTableProps {
  title: Subject;
  teachers: Teacher[];
  icon: React.ReactNode;
  colorClass: string;
}

export const TeacherTable: React.FC<TeacherTableProps> = ({ title, teachers, icon, colorClass }) => {
  if (teachers.length === 0) return null;

  return (
    <div className="mb-12 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className={`p-4 flex items-center gap-3 text-white ${colorClass}`}>
        {icon}
        <h2 className="text-xl font-bold">מורי ורכזי {title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 border-b border-gray-100">
              <th className="px-6 py-4 font-semibold">שם מלא</th>
              <th className="px-6 py-4 font-semibold">בית ספר</th>
              <th className="px-6 py-4 font-semibold">אימייל</th>
              <th className="px-6 py-4 font-semibold">טלפון</th>
              <th className="px-6 py-4 font-semibold">הערות</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((teacher, idx) => (
              <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{teacher.name}</td>
                <td className="px-6 py-4 text-gray-700">{teacher.school}</td>
                <td className="px-6 py-4 text-blue-600">
                  {teacher.email !== "לא נמצא" ? (
                    <a href={`mailto:${teacher.email}`} className="hover:underline">{teacher.email}</a>
                  ) : "לא נמצא"}
                </td>
                <td className="px-6 py-4 text-gray-700 font-mono">{teacher.phone}</td>
                <td className="px-6 py-4 text-gray-500 italic text-sm">{teacher.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
