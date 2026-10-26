"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Play, Edit, Trash2, ArrowLeft, ArrowRight, X, RotateCcw } from "lucide-react";
import { getAdminComponents } from "@/lib/admin/components/queries";
import { deleteComponent, updateComponentsOrder, resetComponentsToDefaultOrder } from "@/lib/admin/components/mutations";
import { componentRegistry } from "@/lib/registry/components";
import { ComponentCard } from "@/components/ui/ComponentCard";
import { LivePreviewIframe } from "@/components/admin/preview/LivePreviewIframe";

export default function AdminComponentsPage() {
  const [components, setComponents] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState("");
  const [componentToDelete, setComponentToDelete] = useState<any>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [orderNotice, setOrderNotice] = useState("");

  useEffect(() => {
    async function loadComponents() {
      try {
        const data = await getAdminComponents();
        setComponents(data || []);
      } catch (err: any) {
        setError(err.message || "Failed to load components");
      } finally {
        setIsLoaded(true);
      }
    }
    loadComponents();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!componentToDelete) return;
    try {
      await deleteComponent(componentToDelete.id);
      const data = await getAdminComponents();
      setComponents(data || []);
      setComponentToDelete(null);
    } catch (err: any) {
      alert("Failed to delete component: " + err.message);
    }
  };

  const moveComponent = async (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= components.length) return;

    const newComponents = [...components];
    const temp = newComponents[index];
    newComponents[index] = newComponents[newIndex];
    newComponents[newIndex] = temp;
    setComponents(newComponents);

    const updates = newComponents.map((c, i) => ({ id: c.id, order: i }));
    try {
      await updateComponentsOrder(updates);
      setOrderNotice(`Moved "${temp.title}" to #${newIndex + 1}`);
      setTimeout(() => setOrderNotice(""), 2500);
    } catch (err: any) {
      alert("Failed to update order: " + err.message);
      const data = await getAdminComponents();
      setComponents(data || []);
    }
  };

  const handleResetToDefault = async () => {
    if (isReordering) return;
    setIsReordering(true);
    setOrderNotice("");

    // Sort Newest to Oldest by created_at DESC
    const sorted = [...components].sort((a, b) => {
      const timeA = new Date(a.created_at || 0).getTime();
      const timeB = new Date(b.created_at || 0).getTime();
      return timeB - timeA;
    });

    setComponents(sorted);

    try {
      await resetComponentsToDefaultOrder();
      setOrderNotice("Order reset: Newest to Oldest");
      setTimeout(() => setOrderNotice(""), 3500);
    } catch (err: any) {
      alert("Failed to reset order: " + err.message);
      const data = await getAdminComponents();
      setComponents(data || []);
    } finally {
      setIsReordering(false);
    }
  };

  if (!isLoaded) return <div className="flex-1 bg-[#F7F9FB]" />;

  return (
    <div className="flex flex-col h-full bg-[#F7F9FB] relative">
      <header className="h-[63px] bg-[#FBFCFD] border-b border-[#DEE1E4] px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-[#454545]">Components</h1>
          {orderNotice && (
            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full animate-in fade-in duration-200">
              {orderNotice}
            </span>
          )}
        </div>
        {components.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleResetToDefault}
              disabled={isReordering}
              className="bg-[#FBFCFD] border border-[#DEE1E4] hover:bg-[#EEF1F4] text-[#454545] px-4 py-2 rounded-[44px] text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              title="Reset order to default (Newest to Oldest)"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-[#7D7F82] ${isReordering ? "animate-spin" : ""}`} />
              <span>Default (Newest)</span>
            </button>
            <Link
              href="/admin/components/create"
              className="bg-[#1F2123] text-white px-5 py-2.5 rounded-[44px] text-sm font-medium transition-opacity hover:opacity-90"
            >
              Create component
            </Link>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8 flex flex-col">
        {error && (
          <div className="mb-4 p-4 text-red-500 bg-red-50 rounded-lg">
            {error}
          </div>
        )}
        
        {components.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <h2 className="font-title font-bold text-[32px] sm:text-[44px] text-[#454545] tracking-[-0.02em] mb-8 text-center max-w-[600px]">
              Start your component creation journey
            </h2>
            <Link
              href="/admin/components/create"
              className="bg-[#1F2123] text-white px-8 py-4 rounded-[44px] font-medium text-base transition-opacity hover:opacity-90"
            >
              Create component
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
            {components.map((comp, index) => {
              const isPublish = comp.status === "published";
              const registryEntry = componentRegistry[comp.registry_id];
              const RegisteredComponent = registryEntry?.component;
              
              return (
                <div key={comp.id} className="bg-[#FBFCFD] border border-[#DEE1E4] flex flex-col gap-px items-start relative rounded-[12px] w-full overflow-hidden">
                  
                  {/* Card Header (Status + Actions) */}
                  <div className="flex items-center justify-between p-[8px] relative w-full shrink-0">
                    <div className="flex items-center gap-2">
                      <div className={`flex items-center px-[8px] py-[4px] rounded-[4px] shrink-0 ${isPublish ? "bg-[#00963d]" : comp.status === "archived" ? "bg-red-500 text-white" : "bg-[#FBFCFD] border border-[#DEE1E4]"}`}>
                        <p className={`font-work font-normal leading-[1.2] text-[13px] whitespace-nowrap ${isPublish || comp.status === "archived" ? "text-white" : "text-[#7D7F82]"}`}>
                          {comp.status.charAt(0).toUpperCase() + comp.status.slice(1)}
                        </p>
                      </div>
                      
                      {/* Order Controls with Position Badge */}
                      <div className="flex items-center gap-1.5 ml-1.5">
                        <span className="text-[11px] font-mono font-semibold text-[#454545] bg-[#EEF1F4] px-1.5 py-0.5 rounded-[4px] border border-[#DEE1E4]" title={`Live position #${index + 1}`}>
                          #{index + 1}
                        </span>
                        <div className="flex bg-[#F7F9FB] rounded-[6px] border border-[#DEE1E4] overflow-hidden">
                          <button 
                            onClick={() => moveComponent(index, -1)}
                            disabled={index === 0}
                            className="p-1 hover:bg-[#EEF1F4] disabled:opacity-30 disabled:hover:bg-transparent transition-colors border-r border-[#DEE1E4] cursor-pointer"
                            title="Move Earlier"
                          >
                            <ArrowLeft className="w-4 h-4 text-[#454545]" />
                          </button>
                          <button 
                            onClick={() => moveComponent(index, 1)}
                            disabled={index === components.length - 1}
                            className="p-1 hover:bg-[#EEF1F4] disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                            title="Move Later"
                          >
                            <ArrowRight className="w-4 h-4 text-[#454545]" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-[6px] items-center relative shrink-0 text-[#454545]">
                      <Link href={`/admin/components/${comp.id}/edit`} className="flex items-center justify-center w-[34px] h-[34px] rounded-full hover:bg-black/5 transition-colors">
                        <Edit className="w-[18px] h-[18px]" />
                      </Link>
                      <button 
                        onClick={() => setComponentToDelete(comp)}
                        className="flex items-center justify-center w-[34px] h-[34px] rounded-full hover:bg-red-50 text-[#454545] hover:text-red-500 transition-colors"
                        title="Delete Permanently"
                      >
                        <Trash2 className="w-[18px] h-[18px]" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Preview Area */}
                  <div className="h-[151px] w-full bg-[#F7F9FB] relative flex items-center justify-center shrink-0 border-y border-[#DEE1E4] overflow-hidden">
                    {RegisteredComponent ? (
                      <ComponentCard id={comp.id} title={comp.title} tags={comp.tags?.map((t: string) => ({label: t}))}>
                        <RegisteredComponent />
                      </ComponentCard>
                    ) : (
                      <div className="w-full h-full pointer-events-none">
                        <LivePreviewIframe 
                          sourceType={comp.source_type} 
                          snippets={comp.snippets || {}} 
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Card Footer */}
                  <div className="flex items-center justify-between px-[20px] py-[12px] relative w-full shrink-0 bg-[#FBFCFD]">
                    <p className="font-sans font-medium leading-[1.2] text-[20px] text-[#454545] whitespace-nowrap truncate">
                      {comp.title}
                    </p>
                    <div className="flex gap-[4px] h-[24px] items-center shrink-0 overflow-hidden">
                      {(comp.tags || []).slice(0, 3).map((tag: string, i: number) => (
                        <div key={i} className="bg-[#FBFCFD] border border-[#eef1f4] flex items-center px-[6px] py-[4px] rounded-[4px]">
                          <p className="font-work font-normal leading-[1.2] text-[#7D7F82] text-[12px] whitespace-nowrap">{tag}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {componentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] shadow-xl w-full max-w-[400px] p-6 flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setComponentToDelete(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 text-[#7D7F82] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            
            <h3 className="font-title font-bold text-[22px] text-[#1F2123] mb-2 leading-tight">
              Delete component permanently?
            </h3>
            <p className="font-sans text-[15px] text-[#7D7F82] leading-relaxed mb-8">
              Are you sure you want to delete <strong className="text-[#1F2123] font-semibold">{componentToDelete.title}</strong>? This action cannot be undone and it will be permanently removed from your library.
            </p>
            
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setComponentToDelete(null)}
                className="flex-1 px-4 py-3 rounded-[32px] font-sans font-medium text-[15px] bg-[#EEF1F4] text-[#454545] hover:bg-[#DEE1E4] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-3 rounded-[32px] font-sans font-medium text-[15px] bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
