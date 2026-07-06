"use client";

import { useTripData } from "@/context/TripContext";
import { useState } from "react";
import toast from "react-hot-toast";
import { 
  ArrowDownToLine, 
  ArrowUpToLine, 
  BarChart3, 
  Search, 
  ChevronDown, 
  Plus, 
  Utensils, 
  Check,
  Edit2,
  Trash2,
  ArrowRight
} from "lucide-react";

export default function BudgetPage() {
  const { tripData } = useTripData();
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="max-w-[1200px] mx-auto w-full space-y-8 animate-fade-in pt-[104px] px-8 pb-12 font-sans">
      
      {/* Top Header Section */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex gap-3">
          <div className="px-4 py-1.5 rounded-full border border-gray-200 bg-white text-sm font-semibold text-gray-800 shadow-sm flex items-center">
            Jun 23 – Jun 30 <span className="mx-2 text-gray-300">•</span> 8 days
          </div>
          <div className="px-4 py-1.5 rounded-full border border-gray-200 bg-white text-sm font-semibold text-gray-800 shadow-sm flex items-center gap-2">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] font-bold border border-white">A</div>
              <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold border border-white">Y</div>
            </div>
            2 travelers
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => toast("Settle up flow coming soon!", { icon: "💸" })}
            className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-900 shadow-sm hover:bg-gray-50 flex items-center gap-2 transition-all active:scale-95"
          >
            <Check size={16} />
            Settle up
          </button>
          <button 
            onClick={() => toast.success("Opening new expense modal...")}
            className="px-4 py-2 rounded-xl bg-[#111827] text-white text-sm font-bold shadow-sm hover:bg-black flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus size={16} />
            Add expense
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* You Owe Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between h-[180px]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
              <ArrowDownToLine size={18} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-tight">You owe</p>
              <p className="text-xs text-gray-500">You should pay others</p>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black text-red-600 tracking-tight">0</span>
              <span className="text-3xl font-bold text-gray-400">,00 €</span>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-2">You're all settled up</p>
          </div>
        </div>

        {/* You're Owed Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between h-[180px]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-50 text-emerald-500 flex items-center justify-center">
              <ArrowUpToLine size={18} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-tight">You're owed</p>
              <p className="text-xs text-gray-500">Others should pay you</p>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black text-emerald-500 tracking-tight">150</span>
              <span className="text-3xl font-bold text-gray-400">,17 €</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-500 font-medium">From</span>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200">
                <div className="w-3.5 h-3.5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[8px] font-bold">A</div>
                <span className="text-[10px] font-bold text-gray-900">admin</span>
              </div>
            </div>
          </div>
        </div>

        {/* Total Spend Card */}
        <div className="bg-[#181D29] p-6 rounded-2xl shadow-md flex flex-col justify-between h-[180px] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center backdrop-blur-sm">
              <BarChart3 size={18} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">Total trip spend</p>
              <p className="text-xs text-gray-400">Across all travelers</p>
            </div>
          </div>
          <div className="relative z-10">
            <div className="flex items-baseline gap-1 text-white">
              <span className="text-5xl font-black tracking-tight">4.103</span>
              <span className="text-3xl font-bold text-gray-400">,62 €</span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs font-medium">
              <span className="text-gray-400">Your share <span className="text-white ml-0.5 font-bold">1.663 €</span></span>
              <span className="text-gray-400">You paid <span className="text-white ml-0.5 font-bold">1.513 €</span></span>
            </div>
          </div>
        </div>

      </div>

      {/* Main Content Area */}
      <div className="flex gap-8 items-start mt-10">
        
        {/* Left Column: Expenses List */}
        <div className="flex-1 space-y-6">
          {/* Header & Filters */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-gray-900">Expenses</h2>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search expenses..." 
                  className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium w-48 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm placeholder:font-normal"
                />
              </div>
              
              <button className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50">
                All categories <ChevronDown size={14} className="text-gray-400" />
              </button>
              
              <button className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50">
                All days <ChevronDown size={14} className="text-gray-400" />
              </button>

              <div className="flex bg-gray-100 p-0.5 rounded-xl border border-gray-200 ml-2">
                <button 
                  onClick={() => setActiveTab("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'all' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  All
                </button>
                <button 
                  onClick={() => setActiveTab("paid")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'paid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Paid by me
                </button>
                <button 
                  onClick={() => setActiveTab("owed")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'owed' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  I'm owed
                </button>
              </div>
            </div>
          </div>

          {/* List Separator */}
          <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider mt-8 mb-4">
            <span>Tue, Jun 23</span>
            <span>4.103,62 € spent</span>
          </div>

          {/* Expense Item 1 */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-500 flex items-center justify-center shrink-0">
                <Utensils size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-[15px] leading-tight mb-1">Shibuya Market</h4>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded-md border border-gray-100">
                    <div className="w-3 h-3 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[7px] font-bold">A</div>
                    <span className="text-[10px] font-bold text-gray-900">299,67 €</span>
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 font-medium mt-1">Food & drink • $343.00 → 299,67 €</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-3">
                <span className="font-black text-gray-900 text-lg">299,67 €</span>
                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); toast('Edit expense'); }} className="w-6 h-6 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-gray-100 text-gray-600"><Edit2 size={12} /></button>
                  <button onClick={(e) => { e.stopPropagation(); toast('Delete expense'); }} className="w-6 h-6 rounded-full bg-red-50 border border-red-100 flex items-center justify-center hover:bg-red-100 text-red-500"><Trash2 size={12} /></button>
                </div>
              </div>
              <span className="text-xs font-bold text-red-500 mr-9">you borrowed 149,83 €</span>
            </div>
          </div>

          {/* Expense Item 2 */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-500 flex items-center justify-center shrink-0">
                <Utensils size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-[15px] leading-tight mb-1">Food</h4>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded-md border border-gray-100">
                    <div className="w-3 h-3 rounded-full bg-rose-500 text-white flex items-center justify-center text-[7px] font-bold">Y</div>
                    <span className="text-[10px] font-bold text-gray-900">436,83 €</span>
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 font-medium mt-1">Food & drink • $500.00 → 436,83 €</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-3">
                <span className="font-black text-gray-900 text-lg">436,83 €</span>
                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); toast('Edit expense'); }} className="w-6 h-6 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-gray-100 text-gray-600"><Edit2 size={12} /></button>
                  <button onClick={(e) => { e.stopPropagation(); toast('Delete expense'); }} className="w-6 h-6 rounded-full bg-red-50 border border-red-100 flex items-center justify-center hover:bg-red-100 text-red-500"><Trash2 size={12} /></button>
                </div>
              </div>
            </div>
          </div>

          {/* Expense Item 3 */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-500 flex items-center justify-center shrink-0">
                <Utensils size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-[15px] leading-tight mb-1">Food</h4>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded-md border border-gray-100">
                    <div className="w-3 h-3 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[7px] font-bold">A</div>
                    <span className="text-[10px] font-bold text-gray-900">262,10 €</span>
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 font-medium mt-1">Food & drink • $300.00 → 262,10 €</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-3">
                <span className="font-black text-gray-900 text-lg">262,10 €</span>
                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); toast('Edit expense'); }} className="w-6 h-6 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-gray-100 text-gray-600"><Edit2 size={12} /></button>
                  <button onClick={(e) => { e.stopPropagation(); toast('Delete expense'); }} className="w-6 h-6 rounded-full bg-red-50 border border-red-100 flex items-center justify-center hover:bg-red-100 text-red-500"><Trash2 size={12} /></button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sidebars */}
        <div className="w-[340px] shrink-0 space-y-6">
          
          {/* Settle Up Widget */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Settle Up • 1</h3>
              <button 
                onClick={() => toast("Add payment coming soon")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
              >
                <Plus size={12} /> Add payment
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">A</div>
                <ArrowRight size={14} className="text-gray-300" />
                <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">Y</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-black text-gray-900 text-[15px]">150,17 €</span>
                <button 
                  onClick={() => toast.success("Settled up!")}
                  className="bg-[#111827] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-black transition-all active:scale-95"
                >
                  Settle
                </button>
              </div>
            </div>
          </div>

          {/* Balances Widget */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-6">Balances</h3>
            
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] font-bold">A</div>
                    <span className="text-sm font-bold text-gray-900">admin</span>
                  </div>
                  <span className="text-sm font-bold text-red-500">-150,17 €</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 w-[45%] rounded-full"></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold">Y</div>
                    <span className="text-sm font-bold text-gray-900">You</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-500">+150,17 €</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden flex justify-end">
                  <div className="h-full bg-emerald-500 w-[45%] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* By Category Widget */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-6">By Category</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <span className="text-sm font-semibold text-gray-900">Accommodation</span>
                </div>
                <span className="text-sm font-bold text-gray-900">2.029 €</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-400"></div>
                  <span className="text-sm font-semibold text-gray-900">Food & drink</span>
                </div>
                <span className="text-sm font-bold text-gray-900">1.402 €</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-semibold text-gray-900">Transportation</span>
                </div>
                <span className="text-sm font-bold text-gray-900">672 €</span>
              </div>
            </div>
          </div>

          {/* AI Budget Widget */}
          {tripData?.budgetResult && (
            <div className="bg-[#181D29] rounded-2xl shadow-md p-6 relative overflow-hidden text-white">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#E67E22]/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
              <div className="flex flex-col h-full relative z-10">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-[#E67E22]" style={{ fontVariationSettings: "'FILL' 1" }}>magic_button</span>
                  AI Budget Estimate
                </h3>
                
                <div className="mb-4">
                  <span className="text-3xl font-black">₹{tripData.budgetResult.total_cost?.toLocaleString()}</span>
                  <div className={`text-xs font-bold mt-1 ${tripData.budgetResult.feasible ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {tripData.budgetResult.feasible 
                      ? `₹${tripData.budgetResult.remaining_budget?.toLocaleString()} under budget`
                      : `₹${Math.abs(tripData.budgetResult.remaining_budget)?.toLocaleString()} over budget`}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Flights</span>
                    <span className="font-bold">₹{tripData.budgetResult.breakdown?.flights?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Hotels</span>
                    <span className="font-bold">₹{tripData.budgetResult.breakdown?.hotels?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Daily Exp.</span>
                    <span className="font-bold">₹{tripData.budgetResult.breakdown?.daily_expenses?.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="p-3 bg-white/10 rounded-xl border border-white/5 backdrop-blur-md">
                  <p className="text-[11px] text-gray-300 leading-relaxed font-medium">
                    {tripData.budgetResult.suggestion}
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
