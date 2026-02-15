import React, { useState } from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FollowUpModalProps {
    isOpen: boolean;
    onClose: () => void;
    leadName: string;
}

export const FollowUpModal = ({ isOpen, onClose, leadName }: FollowUpModalProps) => {
    const [selectedOption, setSelectedOption] = useState('tomorrow');

    if (!isOpen) return null;

    const options = [
        { id: 'tomorrow', label: 'Tomorrow', icon: Clock },
        { id: '3days', label: '3 Days', icon: Calendar },
        { id: '7days', label: '7 Days', icon: Calendar },
        { id: 'custom', label: 'Custom Date', icon: Calendar },
        { id: 'none', label: 'No Follow-Up', icon: X },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-[#171717] border border-white/10 rounded-[12px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 text-white">
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold">Schedule Follow-Up</h2>
                        <p className="text-sm text-white/50 mt-1">For {leadName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/5 rounded-full transition-colors text-white/50"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-3">
                    {options.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => setSelectedOption(option.id)}
                            className={cn(
                                "w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 text-left group",
                                selectedOption === option.id
                                    ? "bg-white/10 border-white/20 text-white"
                                    : "bg-white/5 border-transparent text-white/60 hover:bg-white/10 hover:border-white/10"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "p-2 rounded-lg transition-colors",
                                    selectedOption === option.id ? "bg-white/10 text-white" : "bg-white/5 text-white/40 group-hover:bg-white/10"
                                )}>
                                    <option.icon size={18} />
                                </div>
                                <span className="font-medium">{option.label}</span>
                            </div>
                            <div className={cn(
                                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                                selectedOption === option.id ? "border-emerald-500 bg-emerald-500" : "border-white/10"
                            )}>
                                {selectedOption === option.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                        </button>
                    ))}
                </div>

                <div className="p-6 pt-0 flex gap-3 mt-2">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-4 rounded-xl border border-white/10 hover:bg-white/5 font-medium transition-colors text-white/70"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-4 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-colors"
                    >
                        Save Schedule
                    </button>
                </div>
            </div>
        </div>
    );
};
