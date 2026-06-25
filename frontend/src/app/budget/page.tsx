"use client";

import { useEffect } from "react";

export default function BudgetPage() {
  // Simple Donut animation on load
  useEffect(() => {
    const segments = document.querySelectorAll<SVGElement>(".donut-segment");
    segments.forEach((segment) => {
      // Need to cast to any or SVGGeometryElement to access getTotalLength
      const length = (segment as any).getTotalLength?.() || 100;
      segment.style.strokeDasharray = `${length}`;
      segment.style.strokeDashoffset = `${length}`;
      setTimeout(() => {
        segment.style.strokeDashoffset = "0";
      }, 100);
    });
  }, []);

  return (
    <div className="max-w-6xl mx-auto w-full space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-on-surface">New Delhi Getaway</h2>
          <p className="text-on-surface-variant text-sm mt-1">Oct 12 - Oct 15 • 3 Travelers</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-lg border border-outline-variant text-xs font-bold hover:bg-surface-container transition-colors">
            Export PDF
          </button>
          <button className="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold flex items-center gap-2 hover:opacity-90">
            <span className="material-symbols-outlined text-sm">download</span>
            Reports
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Budget Summary Card (Donut Chart) */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-surface-variant flex flex-col md:flex-row items-center gap-12">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              {/* Background Circle */}
              <circle className="stroke-surface-container-high" cx="18" cy="18" fill="none" r="16" strokeWidth="3"></circle>
              {/* Flights (Coral) - 40% */}
              <circle className="stroke-secondary-container donut-segment transition-all duration-1000 ease-out" cx="18" cy="18" fill="none" r="16" strokeDasharray="40 100" strokeDashoffset="0" strokeWidth="4"></circle>
              {/* Hotels (Teal) - 35% */}
              <circle className="stroke-primary-container donut-segment transition-all duration-1000 ease-out" cx="18" cy="18" fill="none" r="16" strokeDasharray="35 100" strokeDashoffset="-40" strokeWidth="4"></circle>
              {/* Food (Green) - 15% */}
              <circle stroke="#4ADE80" className="donut-segment transition-all duration-1000 ease-out" cx="18" cy="18" fill="none" r="16" strokeDasharray="15 100" strokeDashoffset="-75" strokeWidth="4"></circle>
              {/* Activities (Gold) - 10% */}
              <circle className="stroke-tertiary-container donut-segment transition-all duration-1000 ease-out" cx="18" cy="18" fill="none" r="16" strokeDasharray="10 100" strokeDashoffset="-90" strokeWidth="4"></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Total</span>
              <span className="text-2xl font-bold text-on-surface">₹42,500</span>
            </div>
          </div>
          
          <div className="flex-1 grid grid-cols-2 gap-4 w-full">
            <div className="p-4 rounded-lg bg-surface-container-low border border-surface-variant/50">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-secondary-container"></div>
                <span className="text-xs font-bold text-on-surface-variant">Flights</span>
              </div>
              <p className="text-xl font-bold text-on-surface">₹17,000</p>
            </div>
            <div className="p-4 rounded-lg bg-surface-container-low border border-surface-variant/50">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-primary-container"></div>
                <span className="text-xs font-bold text-on-surface-variant">Hotels</span>
              </div>
              <p className="text-xl font-bold text-on-surface">₹14,875</p>
            </div>
            <div className="p-4 rounded-lg bg-surface-container-low border border-surface-variant/50">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-[#4ADE80]"></div>
                <span className="text-xs font-bold text-on-surface-variant">Food</span>
              </div>
              <p className="text-xl font-bold text-on-surface">₹6,375</p>
            </div>
            <div className="p-4 rounded-lg bg-surface-container-low border border-surface-variant/50">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-tertiary-container"></div>
                <span className="text-xs font-bold text-on-surface-variant">Activities</span>
              </div>
              <p className="text-xl font-bold text-on-surface">₹4,250</p>
            </div>
          </div>
        </div>

        {/* Optimization Side Section */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-variant shadow-sm h-full">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-tertiary-container">auto_awesome</span>
              <h3 className="text-xl font-bold">AI Suggestions</h3>
            </div>
            <div className="space-y-4">
              {/* Suggestion 1 */}
              <div className="p-4 rounded-xl bg-tertiary-fixed/30 border border-tertiary-fixed flex flex-col gap-3 group hover:bg-tertiary-fixed/50 transition-colors">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-semibold text-on-tertiary-fixed-variant leading-tight">Swap Day 3 hotel (₹18k) → ₹8k boutique option</p>
                  <span className="text-tertiary font-bold text-xs shrink-0">+₹10,000</span>
                </div>
                <button className="mt-2 w-full py-2 bg-on-tertiary-fixed text-white rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition-all active:scale-95">
                  <span className="material-symbols-outlined text-sm">check</span>
                  Apply Optimization
                </button>
              </div>
              {/* Suggestion 2 */}
              <div className="p-4 rounded-xl bg-primary-fixed/20 border border-primary-fixed flex flex-col gap-3 group hover:bg-primary-fixed/40 transition-colors">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-semibold text-on-primary-fixed-variant leading-tight">Reduce average food tier per meal</p>
                  <span className="text-primary font-bold text-xs shrink-0">+₹1,500</span>
                </div>
                <button className="mt-2 w-full py-2 border border-primary text-primary rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition-all active:scale-95">
                  <span className="material-symbols-outlined text-sm">visibility</span>
                  Review Menu
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Cost Breakdown List */}
        <div className="col-span-12 bg-surface-container-lowest rounded-xl border border-surface-variant shadow-sm overflow-hidden mt-4">
          <div className="px-8 py-6 border-b border-surface-variant flex justify-between items-center bg-surface-container-low/50">
            <h3 className="text-xl font-bold">Detailed Breakdown</h3>
            <div className="flex gap-4">
              <select className="bg-transparent border-none text-xs font-bold focus:ring-0 cursor-pointer text-on-surface-variant">
                <option>Group by Category</option>
                <option>Group by Date</option>
                <option>Sort by Cost</option>
              </select>
            </div>
          </div>
          <div className="divide-y divide-surface-variant">
            {/* Category: Flights */}
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-secondary-container p-2 bg-secondary-fixed rounded-lg">flight</span>
                <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Flights</h4>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl hover:bg-surface-container transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded bg-surface-container-high flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-surface-variant">airplane_ticket</span>
                    </div>
                    <div>
                      <p className="text-base font-semibold">IndiGo 6E-2134</p>
                      <p className="text-xs text-on-surface-variant">New Delhi to Mumbai • Economy</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-on-surface">₹5,400</p>
                    <span className="text-[10px] uppercase font-bold text-primary px-2 py-0.5 rounded-full bg-primary-fixed/50">Confirmed</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Category: Hotels */}
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary-container p-2 bg-primary-fixed rounded-lg">hotel</span>
                <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Hotels</h4>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl hover:bg-surface-container transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded bg-surface-container-high flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-surface-variant">bed</span>
                    </div>
                    <div>
                      <p className="text-base font-semibold">The Leela Palace</p>
                      <p className="text-xs text-on-surface-variant">3 Nights • Royal Suite</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-on-surface">₹54,600</p>
                    <span className="text-[10px] uppercase font-bold text-secondary px-2 py-0.5 rounded-full bg-secondary-fixed/50">Overrun</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl hover:bg-surface-container transition-colors border-l-4 border-tertiary-container bg-tertiary-fixed/10">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded bg-surface-container-high flex items-center justify-center">
                      <span className="material-symbols-outlined text-tertiary-container">lightbulb</span>
                    </div>
                    <div>
                      <p className="text-base font-semibold">Alternative: Bloomrooms @ Link Road</p>
                      <p className="text-xs text-on-surface-variant">3 Nights • Suggested Savings</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-tertiary">₹12,500</p>
                    <span className="text-[10px] uppercase font-bold text-tertiary px-2 py-0.5 rounded-full bg-tertiary-fixed">Potential Save</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Category: Activities */}
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-tertiary-container p-2 bg-tertiary-fixed rounded-lg">local_activity</span>
                <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Activities</h4>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl hover:bg-surface-container transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded bg-surface-container-high flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-surface-variant">museum</span>
                    </div>
                    <div>
                      <p className="text-base font-semibold">Humayun's Tomb Entrance</p>
                      <p className="text-xs text-on-surface-variant">3 Tickets • Historical Site</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-on-surface">₹1,800</p>
                    <span className="text-[10px] uppercase font-bold text-primary px-2 py-0.5 rounded-full bg-primary-fixed/50">Confirmed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 flex flex-col items-end gap-3 z-50">
        <button className="flex items-center gap-3 bg-white border-2 border-primary text-primary px-6 py-3 rounded-full shadow-lg font-bold group transition-all hover:scale-105 active:scale-95">
          <span className="material-symbols-outlined">smart_toy</span>
          Ask AI to balance budget
        </button>
      </div>
    </div>
  );
}
