"use client";

import { useTripData } from "@/context/TripContext";
import { useState } from "react";

export default function ListsPage() {
  const { tripData } = useTripData();
  const packing = tripData?.packing;
  
  // Calculate stats
  const totalItems = packing?.categories?.reduce((acc: number, cat: any) => acc + (cat.items?.length || 0), 0) || 0;

  if (!packing || !packing.categories) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-104px)] text-center text-gray-500">
        <span className="material-symbols-outlined text-6xl mb-4 opacity-50">luggage</span>
        <h2 className="text-xl font-bold text-gray-700">No Packing List Yet</h2>
        <p className="text-sm mt-2">Generate a trip first to get your AI-powered smart packing list.</p>
      </div>
    );
  }

  const categoryColors = ["#3B82F6", "#8B5CF6", "#F59E0B", "#10B981", "#EF4444", "#6366F1"];

  return (
    <div className="max-w-6xl mx-auto w-full space-y-6 animate-fade-in pb-12 pt-[136px] px-8 text-[#111827]">
      
      {/* Header Section */}
      <div className="bg-[#F8F9FA] rounded-[20px] p-4 flex items-center justify-between border border-gray-100">
        <div className="flex items-center gap-6">
          <h2 className="text-2xl font-black tracking-tight">Lists</h2>
          
          <div className="flex gap-2 bg-white rounded-full p-1 border border-gray-200">
            <button className="flex items-center gap-2 bg-white text-gray-900 px-4 py-1.5 rounded-full text-sm font-bold shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
              <span className="material-symbols-outlined text-[18px]">inventory_2</span>
              Packing List <span className="bg-gray-100 text-gray-500 px-1.5 rounded-full text-[10px]">3</span>
            </button>
            <button className="flex items-center gap-2 text-gray-500 px-4 py-1.5 rounded-full text-sm font-bold hover:bg-gray-50 transition-colors">
              <span className="material-symbols-outlined text-[18px]">checklist</span>
              To-Do <span className="bg-gray-100 px-1.5 rounded-full text-[10px]">0</span>
            </button>
          </div>
        </div>

        <button className="bg-[#E67E22] hover:bg-[#d6711c] text-white px-5 py-2 rounded-xl font-bold text-sm shadow-sm flex items-center gap-2 transition-colors">
          <span className="material-symbols-outlined text-[18px]">publish</span>
          Import
        </button>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-4 py-2">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black">0</span>
          <span className="text-gray-400 font-bold">/{totalItems}</span>
        </div>
        <div className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-md">0%</div>
        <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#E67E22] w-0 rounded-full"></div>
        </div>
      </div>

      {/* Add Category Placeholder */}
      <button className="w-full border-2 border-dashed border-gray-200 rounded-xl p-4 text-gray-400 font-bold flex items-center gap-2 hover:bg-gray-50 hover:border-gray-300 transition-all text-sm">
        <span className="material-symbols-outlined text-[18px]">create_new_folder</span>
        Add category
      </button>

      {/* Filters */}
      <div className="flex items-center gap-6 py-2">
        <div className="flex gap-2">
          <button className="bg-[#1C1C1E] text-white px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">group</span>
            Shared <span className="bg-white text-black px-1.5 rounded-full text-[10px]">3</span>
          </button>
          <button className="bg-white border border-gray-200 text-gray-600 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-gray-50">
            <span className="material-symbols-outlined text-[16px]">person</span>
            My list <span className="bg-gray-100 px-1.5 rounded-full text-[10px]">0</span>
          </button>
        </div>

        <div className="flex gap-4">
          <button className="bg-[#1C1C1E] text-white px-4 py-1.5 rounded-full text-sm font-bold">All</button>
          <button className="text-gray-500 font-bold text-sm px-2 hover:text-gray-900 transition-colors">Open</button>
          <button className="text-gray-500 font-bold text-sm px-2 hover:text-gray-900 transition-colors">Done</button>
        </div>
      </div>
      
      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {packing.categories.map((cat: any, idx: number) => {
          const formattedName = cat.name || "CATEGORY";
          const color = categoryColors[idx % categoryColors.length];
          const itemsCount = cat.items?.length || 0;
          
          return (
            <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col">
              {/* Category Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-gray-400 text-[18px] cursor-pointer">expand_more</span>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></div>
                  <h3 className="text-sm font-black text-gray-900 tracking-wider uppercase ml-1">{formattedName}</h3>
                  <div className="w-6 h-6 rounded-full border border-dashed border-gray-300 flex items-center justify-center ml-2">
                    <span className="material-symbols-outlined text-[12px] text-gray-400">person</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md">0/{itemsCount}</span>
                  <span className="material-symbols-outlined text-gray-400 text-[18px] cursor-pointer">more_horiz</span>
                </div>
              </div>
              
              {/* Items List */}
              <div className="flex flex-col gap-1">
                {Array.isArray(cat.items) ? cat.items.map((item: any, itemIdx: number) => {
                  const itemName = typeof item === 'string' ? item : (item.name || item.item);
                  const itemQuantity = typeof item === 'object' && item.quantity ? item.quantity : "1";

                  return (
                    <div key={itemIdx} className="flex items-center justify-between group hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors cursor-pointer">
                      
                      {/* Left: Checkbox & Name */}
                      <div className="flex items-center gap-3">
                        <div className="w-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="material-symbols-outlined text-gray-300 text-[16px] cursor-grab">drag_indicator</span>
                        </div>
                        
                        <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
                          <input 
                            type="checkbox" 
                            className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-[4px] bg-white checked:bg-gray-900 checked:border-gray-900 transition-colors cursor-pointer"
                          />
                          <span className="material-symbols-outlined absolute text-white text-[14px] opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity font-bold">check</span>
                        </div>
                        
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-black transition-colors peer-checked:line-through peer-checked:text-gray-400">
                          {itemName}
                        </p>
                      </div>

                      {/* Right: Actions & Quantity */}
                      <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[11px] font-bold text-gray-600 border border-gray-200 px-2 py-0.5 rounded-md bg-white">
                          {itemQuantity}x
                        </span>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }}></div>
                        <span className="material-symbols-outlined text-[14px] text-gray-400 hover:text-gray-900">share</span>
                        <span className="material-symbols-outlined text-[14px] text-gray-400 hover:text-gray-900">edit</span>
                        <span className="material-symbols-outlined text-[14px] text-gray-400 hover:text-red-500">delete</span>
                      </div>

                    </div>
                  );
                }) : null}
              </div>
              
              {/* Add Item */}
              <button className="flex items-center gap-2 mt-4 text-gray-400 font-semibold text-sm hover:text-gray-900 transition-colors">
                <span className="material-symbols-outlined text-[18px]">add</span>
                Add item
              </button>

            </div>
          );
        })}
      </div>
    </div>
  );
}
