
import React, { useState, useCallback } from 'react';
import { SearchResponse, Subject, Teacher } from './types';
import { searchTeachersByCity } from './services/geminiService';
import { TeacherTable } from './components/TeacherTable';

const App: React.FC = () => {
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) return;

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const data = await searchTeachersByCity(city);
      setResults(data);
    } catch (err: any) {
      setError(err.message || 'אירעה שגיאה בחיפוש המידע.');
    } finally {
      setLoading(false);
    }
  }, [city]);

  const exportToCSV = () => {
    if (!results) return;
    
    const headers = ['מקצוע', 'שם', 'בית ספר', 'אימייל', 'טלפון', 'תפקיד', 'הערות'];
    const rows: string[][] = [];

    const addTeachers = (subject: string, teachers: Teacher[]) => {
      teachers.forEach(t => {
        rows.push([subject, t.name, t.school, t.email, t.phone, t.role, t.note.replace(/,/g, ';')]);
      });
    };

    addTeachers('פיזיקה', results.physics);
    addTeachers('כימיה', results.chemistry);
    addTeachers('ביולוגיה', results.biology);

    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `teachers_${city}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToDocs = () => {
    if (!results) return;

    let text = `דוח צוותי הוראה - ${city}\n`;
    text += `==============================\n\n`;

    const formatSubject = (title: string, teachers: Teacher[]) => {
      if (teachers.length === 0) return "";
      let s = `--- ${title} ---\n`;
      teachers.forEach(t => {
        s += `שם: ${t.name}\nבית ספר: ${t.school}\nאימייל: ${t.email}\nטלפון: ${t.phone}\nהערות: ${t.note}\n\n`;
      });
      return s + "\n";
    };

    text += formatSubject('פיזיקה', results.physics);
    text += formatSubject('כימיה', results.chemistry);
    text += formatSubject('ביולוגיה', results.biology);

    navigator.clipboard.writeText(text).then(() => {
      alert('הנתונים הועתקו ללוח! כעת ניתן להדביק אותם ישירות ב-Google Docs.');
    });
  };

  return (
    <div className="min-h-screen pb-20 px-4 sm:px-6 lg:px-8 bg-slate-50 text-gray-900">
      {/* Header Section */}
      <header className="max-w-4xl mx-auto pt-16 text-center">
        <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
          <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">מאתר רכזי מקצוע בתיכונים</h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          הזינו שם של יישוב כדי לקבל רשימת מורים ורכזים במקצועות המדעים: פיזיקה, כימיה וביולוגיה.
        </p>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="לדוגמה: ירושלים, תל אביב, חיפה..."
            className="w-full px-6 py-4 rounded-full border-2 border-transparent bg-white shadow-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none text-xl transition-all text-gray-800 placeholder-gray-400"
            dir="rtl"
          />
          <button
            type="submit"
            disabled={loading}
            className={`absolute left-2 top-2 bottom-2 px-8 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors flex items-center justify-center min-w-[120px] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'חפש עכשיו'
            )}
          </button>
        </form>
      </header>

      {/* Content Area */}
      <main className="max-w-6xl mx-auto mt-16">
        {error && (
          <div className="bg-red-50 border-r-4 border-red-500 p-4 mb-8 text-red-700 rounded shadow-sm">
            <p className="font-bold">שגיאה:</p>
            <p>{error}</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-20">
            <div className="inline-block relative w-20 h-20">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-100 rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="mt-6 text-gray-500 text-lg animate-pulse">סורק אתרי בתי ספר ב-"{city}"... זה עשוי לקחת רגע</p>
          </div>
        )}

        {results && (
          <div className="animate-fadeIn">
            {/* Export Buttons */}
            <div className="flex flex-wrap gap-4 mb-8 justify-center">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-md transition-all active:scale-95"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>
                </svg>
                ייצוא ל-Google Sheets (CSV)
              </button>
              <button
                onClick={exportToDocs}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md transition-all active:scale-95"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>
                </svg>
                ייצוא ל-Google Docs (העתקה)
              </button>
            </div>

            <TeacherTable
              title={Subject.PHYSICS}
              teachers={results.physics}
              colorClass="bg-indigo-600"
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/></svg>}
            />
            
            <TeacherTable
              title={Subject.CHEMISTRY}
              teachers={results.chemistry}
              colorClass="bg-teal-600"
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.829c-1.782 0-2.674-2.154-1.415-3.414l5-5A2 2 0 009 10.172V5L8 4z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/></svg>}
            />

            <TeacherTable
              title={Subject.BIOLOGY}
              teachers={results.biology}
              colorClass="bg-green-600"
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/></svg>}
            />

            {/* Sources section */}
            <div className="mt-12 p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">מקורות מידע (חיפוש Google):</h3>
              <ul className="flex flex-wrap gap-4">
                {results.sources.map((source, i) => (
                  <li key={i}>
                    <a
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:text-blue-700 hover:underline bg-gray-50 px-3 py-1 rounded-full border border-gray-200 transition-all inline-block"
                    >
                      {source.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
