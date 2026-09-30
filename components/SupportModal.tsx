"use client";

import { useState } from "react";

export default function SupportModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* More Tab List Card */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 transition active:scale-[0.99]"
      >
        <div className="flex items-center gap-3">
          {/* Headset / Support SVG Icon */}
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <svg
              className="w-5 h-5 stroke-current"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
            </svg>
          </div>

          <div className="text-left">
            <h4 className="font-semibold text-slate-800 text-sm">
              Help & Support / Report Issue
            </h4>
            <p className="text-xs text-slate-500">
              Koi dikkat ho ya suggestion ho toh batayein
            </p>
          </div>
        </div>

        {/* Chevron Right SVG Icon */}
        <div className="text-slate-400">
          <svg
            className="w-5 h-5 stroke-current"
            fill="none"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </button>

      {/* Popup Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-blue-600 stroke-current"
                  fill="none"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                  <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                </svg>
                <span className="font-bold text-slate-800 text-sm">
                  HisabPro Support
                </span>
              </div>

              {/* Close 'X' SVG Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition"
              >
                <svg
                  className="w-4 h-4 stroke-current"
                  fill="none"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Embedded Google Form */}
            <div className="flex-1 overflow-y-auto">
              <iframe
                src="https://docs.google.com/forms/d/e/1FAIpQLSeEfgh1laeARcWSzZExLZijSHb4n1nrRCvy9PIWRJCla4-idg/viewform?embedded=true"
                width="100%"
                height="650"
                frameBorder="0"
                marginHeight={0}
                marginWidth={0}
                className="w-full border-0"
              >
                Loading…
              </iframe>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
