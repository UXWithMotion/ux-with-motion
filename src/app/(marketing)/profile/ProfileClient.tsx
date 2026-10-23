"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { Camera, Trash2, Check, Bookmark } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";
import { ComponentModalPublic, ComponentItem } from "@/components/ui/ComponentModalPublic";
import { componentRegistry } from "@/lib/registry/components";
import { LivePreviewIframe } from "@/components/admin/preview/LivePreviewIframe";
import { useCustomization } from "@/components/providers/CustomizationProvider";
import { getPublishedComponents } from "@/lib/admin/components/queries";

export function ProfileClient({ 
  user, 
  isPremium, 
  subscription,
  initialComponents = [],
}: { 
  user: any; 
  isPremium?: boolean; 
  subscription?: any;
  initialComponents?: ComponentItem[];
}) {
  const supabase = createClient();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { getOverrides } = useCustomization();

  const [components, setComponents] = useState<ComponentItem[]>(initialComponents);
  const [activeModalComponent, setActiveModalComponent] = useState<ComponentItem | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("saved_components") || "[]");
    setSavedIds(saved);
    
    const handleStorageChange = () => {
      const updated = JSON.parse(localStorage.getItem("saved_components") || "[]");
      setSavedIds(updated);
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("saved_components_changed", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("saved_components_changed", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const published = await getPublishedComponents();
        if (published) setComponents(published);
      } catch (e) {
        console.error(e);
      }
    };
    if (!initialComponents || initialComponents.length === 0) {
      load();
    }
  }, [initialComponents]);

  const savedComponents = useMemo(() => {
    const matched: ComponentItem[] = [];
    const matchedIds = new Set<string>();

    // 1. Match from published database components (by comp.id or comp.registry_id)
    components.forEach((comp) => {
      if (savedIds.includes(comp.id) || savedIds.includes(comp.registry_id)) {
        matched.push(comp);
        matchedIds.add(comp.id);
        matchedIds.add(comp.registry_id);
      }
    });

    // 2. Fallback: match from componentRegistry if not already matched
    savedIds.forEach((id) => {
      if (!matchedIds.has(id) && componentRegistry[id]) {
        const entry = componentRegistry[id];
        matched.push({
          id: id,
          title: entry.name,
          registry_id: entry.registryId,
          status: "published",
          tags: [entry.category],
          snippets: entry.snippets,
          source_type: "react",
          schema_definition: entry.schema_definition,
        });
        matchedIds.add(id);
      }
    });

    return matched;
  }, [components, savedIds]);

  const toggleSave = (e: React.MouseEvent, comp: ComponentItem) => {
    e.stopPropagation();
    const newSaved = savedIds.filter((id) => id !== comp.id && id !== comp.registry_id);
    localStorage.setItem("saved_components", JSON.stringify(newSaved));
    setSavedIds(newSaved);
    window.dispatchEvent(new Event("saved_components_changed"));
  };

  const fullName = user.user_metadata?.full_name || user.user_metadata?.name || "User";
  const [initialFirstName, ...initialLastNames] = fullName.split(" ");
  const initialLastName = initialLastNames.join(" ");

  const email = user.email || "";
  
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [avatarUrl, setAvatarUrl] = useState(user.user_metadata?.avatar_url || "/icons/user-placeholder.png");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  const handleCancelSubscription = async () => {
    if (!subscription?.id) return;
    if (!confirm("Are you sure you want to cancel your premium subscription?\n\nYour Premium access will remain active until the end of your current billing period. You won't be charged again.")) return;
    
    setIsCanceling(true);
    try {
      const res = await fetch("/api/subscriptions/cancel", { method: "POST" });
      const data = await res.json();

      if (res.ok) {
        alert("Cancellation scheduled. Premium remains active until the end of your billing cycle.");
        router.refresh();
      } else {
        alert(data.error || "Failed to cancel subscription.");
      }
    } catch (e) {
      console.error(e);
      alert("Error canceling subscription.");
    } finally {
      setIsCanceling(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const newFullName = `${firstName} ${lastName}`.trim();
    
    const { error } = await supabase.auth.updateUser({
      data: { full_name: newFullName }
    });
    
    if (!error) {
      router.refresh();
    }
    setIsSaving(false);
  };

  const handleCancel = () => {
    setFirstName(initialFirstName);
    setLastName(initialLastName);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const rawData = event.target?.result as string;
        if (!rawData) {
          setIsUploading(false);
          return;
        }

        const img = new window.Image();
        img.onload = async () => {
          try {
            const canvas = document.createElement("canvas");
            const size = 200;
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              const minDim = Math.min(img.width, img.height);
              const sx = (img.width - minDim) / 2;
              const sy = (img.height - minDim) / 2;
              ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);

              const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
              setAvatarUrl(compressedDataUrl);

              await supabase.auth.updateUser({
                data: { avatar_url: compressedDataUrl },
              });
              router.refresh();
            }
          } catch (err) {
            console.error("Error saving avatar:", err);
          } finally {
            setIsUploading(false);
          }
        };
        img.onerror = () => {
          setIsUploading(false);
        };
        img.src = rawData;
      };
      reader.onerror = () => {
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setAvatarUrl("/icons/user-placeholder.png");
    await supabase.auth.updateUser({ data: { avatar_url: null } });
    router.refresh();
  };

  return (
    <div className="w-full bg-[#FBFCFD] min-h-screen">
      <div className="w-full px-6 lg:px-[70px] pt-[48px] pb-[80px]">
        <div className="flex flex-col lg:flex-row gap-[40px] items-start">
          
          {/* Left Column: User Identity Card */}
          <div className="w-full lg:w-[340px] shrink-0 bg-[#FBFCFD] border border-[#DEE1E4] rounded-[24px] p-[32px] flex flex-col items-center">
            {/* Avatar with Hover Edit */}
            <div className="relative size-[80px] rounded-full overflow-hidden mb-[24px] group cursor-pointer border border-[#DEE1E4]" onClick={() => fileInputRef.current?.click()}>
              {avatarUrl && avatarUrl !== "/icons/user-placeholder.png" ? (
                <img src={avatarUrl} alt={firstName} className="size-full object-cover" />
              ) : (
                <div className="size-full bg-[#EEF1F4] flex items-center justify-center">
                  <span className="font-sans font-medium text-[24px] text-[#7D7F82]">{firstName.charAt(0)}</span>
                </div>
              )}
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                <Camera size={16} className="text-white" />
                <span className="font-sans font-medium text-[10px] text-white tracking-widest">EDIT</span>
              </div>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleUpload} accept="image/*" className="hidden" />
            
            {/* User Info */}
            <h2 className="font-sans font-bold text-[24px] text-[#454545] leading-[1.2] mb-1 text-center">{firstName} {lastName}</h2>
            <p className="font-inter text-[14px] text-[#7D7F82] mb-[32px] text-center">{email}</p>
            
            {/* Quick Actions */}
            <div className="flex items-center gap-[16px]">
              <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="font-sans font-medium text-[14px] text-[#454545] hover:opacity-70 transition-opacity disabled:opacity-50">
                {isUploading ? "Uploading..." : "Upload New"}
              </button>
              <div className="w-[1px] h-[16px] bg-[#D7DADC]" />
              <button onClick={handleRemoveAvatar} className="flex items-center gap-2 font-sans font-medium text-[14px] text-[#F36666] hover:opacity-70 transition-opacity">
                <Trash2 size={16} />
                Remove
              </button>
            </div>
          </div>

          {/* Right Column: Main Stream */}
          <div className="flex-1 flex flex-col w-full gap-[40px]">
            
            {/* Profile Form Section */}
            <div className="bg-[#FBFCFD] border border-[#DEE1E4] rounded-[32px] p-[32px] flex flex-col gap-[32px]">
              <div>
                <h3 className="font-sans font-bold text-[24px] text-[#454545] mb-2">Profile Settings</h3>
                <p className="font-inter text-[14px] text-[#7D7F82]">Update your personal details here.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
                <div className="flex flex-col gap-[8px]">
                  <label className="font-sans font-semibold text-[14px] text-[#454545]">First Name</label>
                  <input 
                    type="text" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={`w-full h-[48px] px-[16px] py-[12px] rounded-[24px] border border-[#DEE1E4] focus:outline-none focus:ring-2 focus:ring-[#1F2123]/10 font-inter text-[14px] text-[#454545] transition-colors ${firstName ? 'bg-[#F1F4F6]' : 'bg-[#EEF1F4]'}`} 
                  />
                </div>
                <div className="flex flex-col gap-[8px]">
                  <label className="font-sans font-semibold text-[14px] text-[#454545]">Last Name</label>
                  <input 
                    type="text" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={`w-full h-[48px] px-[16px] py-[12px] rounded-[24px] border border-[#DEE1E4] focus:outline-none focus:ring-2 focus:ring-[#1F2123]/10 font-inter text-[14px] text-[#454545] transition-colors ${lastName ? 'bg-[#F1F4F6]' : 'bg-[#EEF1F4]'}`} 
                  />
                </div>
                <div className="flex flex-col gap-[8px] md:col-span-2">
                  <label className="font-sans font-semibold text-[14px] text-[#454545]">Email ID</label>
                  <input 
                    type="email" 
                    defaultValue={email}
                    readOnly
                    className={`w-full h-[48px] px-[16px] py-[12px] rounded-[24px] border border-[#DEE1E4] focus:outline-none focus:ring-2 focus:ring-[#1F2123]/10 font-inter text-[14px] text-[#7D7F82] transition-colors opacity-80 cursor-not-allowed ${email ? 'bg-[#F1F4F6]' : 'bg-[#EEF1F4]'}`} 
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-[16px] pt-2">
                <button onClick={handleCancel} className="font-sans font-medium text-[16px] text-[#7D7F82] hover:text-black transition-colors px-[24px] py-[12px]">
                  Cancel Changes
                </button>
                <button onClick={handleSave} disabled={isSaving || (firstName === initialFirstName && lastName === initialLastName)} className="font-sans font-medium text-[16px] text-white bg-[#1F2123] rounded-[40px] px-[32px] py-[14px] hover:bg-black transition-colors disabled:opacity-50">
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            {/* Plan Comparison Section (Hidden temporarily as all components are currently free) */}
            {false && (
              <div className="bg-[#FBFCFD] border border-[#DEE1E4] rounded-[32px] p-[32px] flex flex-col gap-[32px]">
                <div>
                  <h3 className="font-sans font-bold text-[24px] text-[#454545] mb-2">Current Subscription</h3>
                  <p className="font-inter text-[14px] text-[#7D7F82]">Manage your billing and plan details.</p>
                </div>
                
                <div className="flex flex-col md:flex-row gap-[24px]">
                  {/* Free Plan Card */}
                  <div className="flex-1 border border-[#DEE1E4] rounded-[24px] p-[24px] flex flex-col items-start relative overflow-hidden bg-[#FBFCFD]">
                    <h4 className="font-sans font-bold text-[20px] text-[#454545] mb-2">Free Plan</h4>
                    <div className="font-sans font-bold text-[32px] text-[#454545] mb-[24px]">
                      ₹0<span className="text-[16px] text-[#7D7F82] font-medium">/month</span>
                    </div>
                    
                    {isPremium ? (
                      <button className="w-full h-[48px] border border-[#DEE1E4] rounded-[40px] font-sans font-medium text-[16px] text-[#898B8E] mb-[32px] cursor-default bg-[#F7F9FB]">
                        Included
                      </button>
                    ) : (
                      <button className="w-full h-[48px] border border-[#DEE1E4] rounded-[40px] font-sans font-medium text-[16px] text-[#898B8E] mb-[32px] cursor-default">
                        Current Plan
                      </button>
                    )}
                    
                    <div className="flex flex-col gap-[16px] w-full">
                      <div className="flex items-center gap-[12px]">
                        <div className="size-[24px] rounded-full bg-[#DB7100]/10 flex items-center justify-center shrink-0">
                          <Check size={14} className="text-[#DB7100]" strokeWidth={3} />
                        </div>
                        <span className="font-inter text-[14px] text-[#454545]">Access to free components</span>
                      </div>
                      <div className="flex items-center gap-[12px]">
                        <div className="size-[24px] rounded-full bg-[#DB7100]/10 flex items-center justify-center shrink-0">
                          <Check size={14} className="text-[#DB7100]" strokeWidth={3} />
                        </div>
                        <span className="font-inter text-[14px] text-[#454545]">Basic customization</span>
                      </div>
                    </div>
                  </div>

                  {/* Premium Plan Card */}
                  <div className="flex-1 border border-[#1F2123] rounded-[24px] p-[24px] flex flex-col items-start relative overflow-hidden bg-[#FBFCFD]">
                    <div className="absolute top-[24px] right-[24px] bg-[#1F2123] text-white font-sans font-medium text-[10px] uppercase tracking-wider px-[12px] py-[6px] rounded-[100px]">
                      RECOMMENDED
                    </div>
                    <h4 className="font-sans font-bold text-[20px] text-[#454545] mb-2">Premium Plan {subscription?.plan_key === 'yearly' ? '(Yearly)' : '(Monthly)'}</h4>
                    <div className="font-sans font-bold text-[32px] text-[#454545] mb-[24px]">
                      {subscription?.plan_key === 'yearly' ? '₹2,999' : '₹399'}<span className="text-[16px] text-[#7D7F82] font-medium">/{subscription?.plan_key === 'yearly' ? 'year' : 'month'}</span>
                    </div>
                    
                    {isPremium ? (
                      subscription?.cancel_at_period_end ? (
                        <div className="w-full h-[48px] border border-[#DEE1E4] rounded-[40px] flex items-center justify-center font-sans font-medium text-[16px] text-[#7D7F82] mb-[32px] bg-[#F7F9FB]">
                          Cancellation Scheduled
                        </div>
                      ) : (
                        <button
                          onClick={handleCancelSubscription}
                          disabled={isCanceling}
                          className="w-full h-[48px] border border-[#FF3B30] text-[#FF3B30] rounded-[40px] font-sans font-medium text-[16px] mb-[32px] hover:bg-[#FF3B30]/10 transition-colors"
                        >
                          {isCanceling ? 'Canceling...' : 'Cancel Subscription'}
                        </button>
                      )
                    ) : (
                      null /* Upgrade button temporarily disabled */
                    )}
                    
                    <div className="flex flex-col gap-[16px] w-full">
                      <div className="flex items-center gap-[12px]">
                        <div className="size-[24px] rounded-full bg-[#DB7100]/10 flex items-center justify-center shrink-0">
                          <Check size={14} className="text-[#DB7100]" strokeWidth={3} />
                        </div>
                        <span className="font-inter text-[14px] text-[#454545]">Everything in free</span>
                      </div>
                      <div className="flex items-center gap-[12px]">
                        <div className="size-[24px] rounded-full bg-[#DB7100]/10 flex items-center justify-center shrink-0">
                          <Check size={14} className="text-[#DB7100]" strokeWidth={3} />
                        </div>
                        <span className="font-inter text-[14px] text-[#454545]">Premium motion components</span>
                      </div>
                      <div className="flex items-center gap-[12px]">
                        <div className="size-[24px] rounded-full bg-[#DB7100]/10 flex items-center justify-center shrink-0">
                          <Check size={14} className="text-[#DB7100]" strokeWidth={3} />
                        </div>
                        <span className="font-inter text-[14px] text-[#454545]">Advanced customizations</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="font-inter text-[14px] text-[#7D7F82] mt-[-8px]">
                  {isPremium ? (
                    subscription?.cancel_at_period_end
                      ? `Premium remains active until ${subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'the end of your billing cycle'}.`
                      : "Your premium plan will automatically renew."
                  ) : (
                    "Your free plan is active."
                  )}
                </p>
              </div>
            )}

            {/* Saved Components Section */}
            {savedIds.length > 0 && (
              <div className="bg-[#FBFCFD] border border-[#DEE1E4] rounded-[32px] p-[32px] flex flex-col gap-[32px]">
                <div className="flex items-center justify-between">
                  <h3 className="font-sans font-bold text-[24px] text-[#454545]">
                    Saved Components{" "}
                    <span className="font-medium text-[#7D7F82] text-[18px]">
                      ({savedComponents.length} {savedComponents.length === 1 ? "item" : "items"} collected)
                    </span>
                  </h3>
                </div>

                {savedComponents.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center">
                    <p className="font-sans text-[16px] text-[#7D7F82] mb-3">No saved components found.</p>
                    <a
                      href="/components"
                      className="font-sans font-medium text-[14px] text-white bg-[#1F2123] rounded-full px-6 py-2.5 hover:bg-black transition-colors"
                    >
                      Explore Components
                    </a>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
                    {savedComponents.map((comp) => {
                      const overrides = getOverrides(comp.id);
                      const activeOverrides: Record<string, string> = {};
                      const schemaDefToUse =
                        comp.schema_definition && comp.schema_definition.length > 0
                          ? comp.schema_definition
                          : componentRegistry[comp.registry_id]?.schema_definition || [];

                      schemaDefToUse.forEach((config: any) => {
                        const val = overrides[config.variable] !== undefined ? overrides[config.variable] : config.defaultValue;
                        if (config.variable) {
                          activeOverrides[config.variable] = val;
                        }
                      });

                      const RegistryComponent = componentRegistry[comp.registry_id]?.component;

                      return (
                        <div
                          key={comp.id}
                          onClick={() => setActiveModalComponent(comp)}
                          className="bg-[#F7F9FB] border border-[#DEE1E4] flex flex-col gap-px items-start relative rounded-[32px] w-full overflow-clip group cursor-pointer min-h-[251px]"
                        >
                          {/* Top action bar */}
                          <div className="flex items-center justify-between p-[8px] w-full shrink-0 relative z-10 bg-transparent min-h-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <div className="flex items-center">
                              {(comp as any).access_tier === "premium" && (
                                <div
                                  className="flex items-center justify-center bg-[#FDF8F0] border border-[#F3E2C6] rounded-full px-2 py-0.5 shrink-0 ml-1"
                                  title="Premium Component"
                                >
                                  <span className="text-[#C18824] text-[10px] font-bold uppercase tracking-wider">Premium</span>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-[6px] items-center">
                              <button
                                onClick={(e) => toggleSave(e, comp)}
                                className="flex items-center justify-center size-[34px] transition-colors text-[#454545] hover:text-[#CC0615]"
                                aria-label="Remove from saved"
                                title="Remove from saved"
                              >
                                <Bookmark size={20} className="fill-current stroke-current" />
                              </button>
                            </div>
                          </div>

                          {/* Component Display Area */}
                          <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden bg-transparent pointer-events-auto z-0 p-4">
                            <div className="w-full h-full transform flex items-center justify-center scale-[0.9]">
                              {RegistryComponent ? (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  style={activeOverrides as React.CSSProperties}
                                  className="w-full h-full flex items-center justify-center"
                                >
                                  <RegistryComponent />
                                </div>
                              ) : comp.snippets?.html || comp.snippets?.css ? (
                                <div className="w-[150%] h-[150%]">
                                  <LivePreviewIframe
                                    sourceType={(comp.source_type as "react" | "html_css" | "both") || "html_css"}
                                    snippets={comp.snippets || {}}
                                    schemaDefinition={comp.schema_definition}
                                    overrides={activeOverrides}
                                    className="w-full h-full border-none scale-[0.9] origin-center"
                                  />
                                </div>
                              ) : (
                                <div className="text-[#7D7F82] font-medium text-sm flex flex-col items-center gap-1">
                                  <span>Preview Unavailable</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Footer Area */}
                          <div className="flex items-center justify-between px-[20px] py-[12px] w-full shrink-0 relative z-10 bg-transparent h-[48px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-auto border-t border-[#EEF1F4]/60">
                            <div className="flex items-center gap-2 max-w-[100%]">
                              <h3 className="font-sans font-medium text-[18px] leading-[1.2] text-[#454545] whitespace-nowrap truncate">
                                {comp.title}
                              </h3>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {activeModalComponent && (
        <ComponentModalPublic
          component={activeModalComponent}
          isOpen={!!activeModalComponent}
          onClose={() => setActiveModalComponent(null)}
        />
      )}
    </div>
  );
}

