// @ts-nocheck
import React, { useMemo, useState, useEffect, useRef } from "react";
import { Camera, MessageSquare, Trash2, ChevronDown, Check, CheckCircle2, AlertTriangle, FilePenLine, X, Info, ArrowLeft, Copy, Settings } from 'lucide-react';
import SdsDocument from "./SdsDocument";

// --- Helper Components (defined at top level) ---

const Checkbox = ({ checked, onCheckedChange, className, ...props }) => (
  <button type="button" role="checkbox" aria-checked={checked} onClick={(e) => { e.stopPropagation(); onCheckedChange(!checked); }} className={`w-4 h-4 rounded-md border-2 ${checked ? 'bg-sky-500 border-sky-600' : 'bg-slate-300 border-slate-300'} flex items-center justify-center transition-colors duration-200 ${className}`} {...props}>
    {checked && <Check className="w-3 h-3 text-white" />}
  </button>
);

const YesNo = ({ value, onYes, onNo }) => (
    <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
      <button className={`px-3 py-1 rounded-full border ${value === true ? "bg-sky-500 text-white" : "bg-white text-slate-800 hover:bg-slate-100"}`} onClick={onYes}>Yes</button>
      <button className={`px-3 py-1 rounded-full border ${value === false ? "bg-red-600 text-white" : "bg-white text-slate-800 hover:bg-slate-100"}`} onClick={onNo}>No</button>
    </div>
);

const StatusSection = ({ title, open, onToggle, right, children, isComplete }) => (
    <div className={`border rounded-xl transition-all duration-300 ${isComplete && !open ? 'border-green-500 border-2' : 'border-slate-300'}`}>
      <div className="w-full px-3 py-2 flex items-center cursor-pointer" onClick={onToggle}>
        <div className="flex-1 flex items-center gap-2">
            <span className="text-sm font-semibold select-none">{title}</span>
        </div>
        <div className="ml-2" onClick={(e) => e.stopPropagation()}>{right}</div>
        <span className={`ml-2 opacity-60 transition-transform ${open ? "rotate-180" : ""}`}><ChevronDown size={20}/></span>
      </div>
      {open && (
        <div className="p-2">
            {children}
            <button onClick={onToggle} className="w-full mt-2 bg-slate-200 text-slate-800 font-semibold py-2 rounded-lg hover:bg-slate-300 text-sm">
                Done
            </button>
        </div>
      )}
    </div>
);


const TaskRow = ({ roomId, task, onSetStatus, onSetReason, onDelete, mode, onChangeNote, onSetQuantity }) => (
    <div>
        <div className={`group flex items-center gap-2 py-1 px-2 rounded-xl border  hover:bg-slate-100 ${(task.status === 'done' || task.status === 'changed') ? 'bg-slate-100' : 'bg-white'}`}>
            <div className="flex-1 flex items-center gap-2">
                {mode !== 'pack-out' ? (
                    <input
                        type="number"
                        value={task.quantity || 1}
                        onChange={(e) => onSetQuantity(roomId, task.id, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-12 text-center border rounded-md px-1 py-0.5 text-sm"
                        min="1"
                    />
                ) : null}
                <div className={`text-sm ${(task.status === 'done' || task.status === 'changed') ? "line-through opacity-60" : ""}`}>{task.label}{task.quantity > 1 ? ` (${task.quantity})` : ''}</div>
                 {task.reason && <div className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded-full flex-shrink-0">{task.reason}</div>}
            </div>
            
            <div className="flex items-center gap-2">
                {mode === 'pack-out' ? (
                    <div className="flex gap-2 text-center">
                        <button onClick={() => onSetStatus(roomId, task.id, task.status === 'done' ? 'pending' : 'done')} className={`flex flex-col items-center p-1 rounded-md w-12 ${task.status === 'done' ? 'bg-slate-200' : 'hover:bg-slate-200'}`}>
                            <Check size={18} className={`${task.status === 'done' ? 'text-slate-500' : ''}`} />
                            <span className={`text-[9px] font-bold ${task.status === 'done' ? 'text-slate-500' : ''}`}>Done</span>
                        </button>
                        <button onClick={() => onChangeNote(roomId, task.id)} className={`flex flex-col items-center p-1 rounded-md w-12 ${task.status === 'changed' ? 'bg-red-100 text-red-600' : 'hover:bg-slate-200'}`}>
                            <AlertTriangle size={18} />
                            <span className="text-[9px] font-bold">Change</span>
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-1">
                        <button onClick={() => alert(`Camera for task: ${task.label}`)} className="p-1 hover:bg-slate-200 rounded-full"><Camera size={18} /></button>
                        <button onClick={() => onSetReason(roomId, task.id)} className="p-1 hover:bg-slate-200 rounded-full"><MessageSquare size={18} /></button>
                        <button onClick={() => onDelete(roomId, task.id)} className="p-1 hover:bg-red-100 text-red-600 rounded-full"><Trash2 size={18} /></button>
                    </div>
                )}
            </div>
        </div>
        {task.changeNote && (
            <div className="pl-8 pt-1 text-xs text-orange-700">
                <span className="font-semibold">Change Note:</span> {task.changeNote}
            </div>
        )}
    </div>
);

const NotesInput = ({ onAdd, type }) => {
    const [val, setVal] = useState("");
    return <form onSubmit={e => { e.preventDefault(); if(val.trim()) { onAdd(val, type); setVal(""); } }} className="flex gap-2"><input type="text" placeholder="Type task and press Enter" value={val} onChange={e => setVal(e.target.value)} className="w-full border rounded-xl px-3 py-1.5 text-sm" /></form>;
};

const ServiceSelector = ({ open, onToggle, selectedServices, setSelectedServices, textileFilters, setTextileFilters, isComplete }) => (
    <div className={`border rounded-2xl shadow-sm bg-white transition-all duration-300 ${isComplete && !open ? 'border-green-500 border-2' : 'border-slate-200'}`}>
        <button className="w-full flex items-center justify-between px-3 py-2" onClick={() => onToggle(v => !v)}>
            <div className="font-bold text-lg">2. Service Offerings</div>
            <span className={`opacity-60 transition-transform ${open ? "rotate-180" : ""}`}><ChevronDown/></span>
        </button>
        {!open && isComplete && selectedServices.length > 0 && (
            <div className="px-3 pb-3 pt-1 border-t border-slate-200">
                <div className="flex flex-wrap gap-1">
                    {selectedServices.map(service => (
                        <span key={service} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full">
                            {service}
                        </span>
                    ))}
                </div>
            </div>
        )}
        {open && (
            <div className="p-3 border-t">
                <div className="flex flex-wrap gap-2">
                    {Object.keys(SERVICE_OFFERINGS).map(s => <button key={s} onClick={() => setSelectedServices(p => p.includes(s) ? p.filter(i => i !== s) : [...p, s])} className={`px-3 py-1 text-sm rounded-full border font-semibold ${selectedServices.includes(s) ? 'bg-sky-500 text-white' : 'bg-white'}`}>{s}</button>)}
                </div>
                {selectedServices.includes('Textiles') && <div className="mt-4 pt-3 border-t">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-sm">Textile Departments</h4>
                        <button onClick={() => setTextileFilters(textileFilters.length === SERVICE_OFFERINGS.Textiles.length ? [] : SERVICE_OFFERINGS.Textiles)} className="text-xs font-semibold px-2 py-1 rounded-md bg-slate-200">{textileFilters.length === SERVICE_OFFERINGS.Textiles.length ? 'Deselect All' : 'Select All'}</button>
                    </div>
                    <div className="flex flex-wrap gap-1">{SERVICE_OFFERINGS.Textiles.map(t => <button key={t} onClick={() => setTextileFilters(p => p.includes(t) ? p.filter(i => i !== t) : [...p, t])} className={`px-2 py-0.5 text-xs rounded-full border ${textileFilters.includes(t) ? 'bg-sky-500 text-white' : 'bg-white'}`}>{t}</button>)}</div>
                </div>}
                <button onClick={() => onToggle(false)} className="w-full mt-4 bg-slate-200 text-slate-800 font-semibold py-2 rounded-lg hover:bg-slate-300 text-sm">Done</button>
            </div>
        )}
    </div>
);
  
const AnticipatedGroups = ({ open, onToggle, anticipatedGroups, setAnticipatedGroups, isComplete }) => {
    const selectedGroups = Object.entries(anticipatedGroups).filter(([, {selected}]) => selected);

    return (
        <div className={`border rounded-2xl shadow-sm bg-white transition-all duration-300 ${isComplete && !open ? 'border-green-500 border-2' : 'border-slate-200'}`}>
            <button className="w-full flex items-center justify-between px-3 py-2" onClick={() => onToggle(v => !v)}>
                <div className="font-bold text-lg">3. Suggested Groups</div>
                <span className={`opacity-60 transition-transform ${open ? "rotate-180" : ""}`}><ChevronDown/></span>
            </button>
            {!open && isComplete && selectedGroups.length > 0 && (
                <div className="px-3 pb-3 pt-1 border-t border-slate-200">
                    <div className="flex flex-wrap gap-1">
                        {selectedGroups.map(([group]) => (
                            <span key={group} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full">
                                {group}
                            </span>
                        ))}
                    </div>
                </div>
            )}
            {open && (
                <div className="p-3 border-t space-y-3">
                    <div>
                        <h4 className="font-semibold text-sm mb-1">Select Groups:</h4>
                        <p className="text-xs text-slate-500 mb-2">Select all groups that will be part of this project.</p>
                        <div className="flex flex-wrap gap-2">
                            {ANTICIPATED_GROUPS.map(group => (
                                <button 
                                    key={group} 
                                    onClick={() => setAnticipatedGroups(prev => ({...prev, [group]: {...prev[group], selected: !prev[group].selected} }))} 
                                    className={`px-3 py-1 text-sm rounded-full border font-semibold ${anticipatedGroups[group].selected ? 'bg-sky-500 text-white' : 'bg-white'}`}
                                >
                                    {group}
                                </button>
                            ))}
                        </div>
                    </div>

                    {selectedGroups.length > 0 && (
                        <div className="pt-3 border-t space-y-2">
                             <h4 className="font-semibold text-sm mb-1">Add Notes for Selected Groups:</h4>
                            {selectedGroups.map(([group, { note }]) => (
                                <div key={`${group}-note`} className="flex items-center gap-2">
                                    <label className="font-semibold text-sm w-16 text-right">{group}:</label>
                                    <input 
                                        type="text" 
                                        value={note} 
                                        onChange={e => setAnticipatedGroups(prev => ({...prev, [group]: {...prev[group], note: e.target.value}}))} 
                                        placeholder={`Notes for ${group}...`} 
                                        className="flex-1 w-full border rounded-lg px-3 py-1.5 text-sm" 
                                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); }}}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                     <button onClick={() => onToggle(false)} className="w-full mt-2 bg-slate-200 text-slate-800 font-semibold py-2 rounded-lg hover:bg-slate-300 text-sm">Done</button>
                </div>
            )}
        </div>
    );
};

const InstructionsList = ({ rooms, selectedServices, anticipatedGroups, showOnlyRoomsWithTasks, onShowOnlyRoomsWithTasksChange, onToggleView, onHideDoneButtonChange, hideDoneButton, viewAsList, initialInstructions, instructionAgreement, disagreementNote, eventInstructions }) => {
    const [copyButtonText, setCopyButtonText] = useState("Copy List");
    const [showSettings, setShowSettings] = useState(false);
    
    const settingsRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (settingsRef.current && !settingsRef.current.contains(event.target)) {
                setShowSettings(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [settingsRef]);

    const generatePackoutText = () => {
        let text = "SCHEDULE INSTRUCTIONS:\n";
        text += (eventInstructions && eventInstructions.trim()) ? eventInstructions.trim() : 'None';
        text += "\n\nINITIAL INSTRUCTIONS:\n";
        text += `Status: ${instructionAgreement === 'agree' ? 'Agreed' : instructionAgreement === 'disagree' ? 'Disagreed' : 'Not Reviewed'}\n`;
        if (instructionAgreement === 'disagree' && disagreementNote) {
            text += `Disagreement Note: ${disagreementNote}\n`;
        }
        text += "\n";

        if (initialInstructions.some(inst => inst.person || inst.instruction)) {
            initialInstructions.forEach(inst => {
                if(inst.person || inst.instruction) {
                    text += `- From: ${inst.person || 'N/A'} (${inst.role || 'N/A'})\n`;
                    text += `  Instruction: ${inst.instruction}\n\n`;
                }
            });
        } else {
            text += 'None\n\n';
        }

        text += "SERVICE OFFERINGS:\n";
        text += selectedServices.join(', ') || 'None';
        text += "\n\n";
    
        text += "SUGGESTED GROUPS & NOTES:\n";
        const selectedGroupsWithNotes = Object.entries(anticipatedGroups).filter(([,{selected}]) => selected);
        if (selectedGroupsWithNotes.length > 0) {
            selectedGroupsWithNotes.forEach(([group, {note}]) => {
                text += `- ${group}: ${note || 'No note'}\n`;
            });
        } else {
            text += 'None\n';
        }
        text += "\n";
    
        text += "PACK-OUT INSTRUCTIONS:\n";
        
        const instructionsByFloor = rooms.reduce((acc, room) => {
            const floor = room.floorLabel || 'Floor - Unassigned';
            if (!acc[floor]) acc[floor] = [];
            if (room.tasks && room.tasks.length > 0) {
                 acc[floor].push(room);
            }
            return acc;
        }, {});
    
        Object.keys(instructionsByFloor).sort((a,b) => {
            if (a === 'Basement') return -1;
            if (b === 'Basement') return 1;
            if (a === 'Attic') return 1;
            if (b === 'Attic') return -1;
            return a.localeCompare(b, undefined, {numeric: true});
        }).forEach(floor => {
            text += `\n--- ${floor} ---\n`;
            instructionsByFloor[floor].sort((a,b) => a.name.localeCompare(b.name)).forEach(room => {
                text += `\n${room.name}:\n`;
                const packOutTasks = room.tasks.filter(t => t.type === 'take');
                if (packOutTasks.length > 0) {
                    text += "  - Pack-out:\n";
                    packOutTasks.forEach(task => {
                        text += `    • ${task.label}${task.quantity > 1 ? ` (${task.quantity})` : ''}`;
                        if (task.changeNote) {
                            text += ` (Note: ${task.changeNote})`;
                        }
                        text += "\n";
                    });
                }
                const leaveTasks = room.tasks.filter(t => t.type === 'leave');
                 if (leaveTasks.length > 0) {
                    text += "  - Leave On-site:\n";
                    leaveTasks.forEach(task => {
                        text += `    • ${task.label}${task.quantity > 1 ? ` (${task.quantity})` : ''}`;
                         if (task.changeNote) {
                            text += ` (Note: ${task.changeNote})`;
                        }
                        text += "\n";
                    });
                }
            });
        });
    
        return text;
      };

    const handleCopy = () => {
        const textToCopy = generatePackoutText();
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);

        setCopyButtonText("Copied!");
        setTimeout(() => setCopyButtonText("Copy List"), 2000);
    };

    const instructionsByFloor = useMemo(() => {
        const floorSorter = (a, b) => {
            if (a === 'Basement') return -1;
            if (b === 'Basement') return 1;
            if (a === 'Attic') return 1;
            if (b === 'Attic') return -1;
            return a.localeCompare(b, undefined, {numeric: true});
        };

        const grouped = rooms.reduce((acc, room) => {
            const floor = room.floorLabel || 'Floor - Unassigned';
            if (!acc[floor]) acc[floor] = [];
            if (room.tasks && room.tasks.length > 0) {
                 acc[floor].push(room);
            }
            return acc;
        }, {});

        Object.values(grouped).forEach(roomList => {
            roomList.sort((a, b) => a.name.localeCompare(b.name));
        });
        
        const sortedFloorNames = Object.keys(grouped).sort(floorSorter);

        return sortedFloorNames.map(floor => ({
            floor,
            rooms: grouped[floor]
        }));

    }, [rooms]);

    const selectedGroupsList = Object.entries(anticipatedGroups).filter(([, {selected}]) => selected);

    return (
        <div className="p-4 border rounded-2xl shadow-sm bg-white space-y-4">
             <div className="flex justify-between items-start border-b pb-3 mb-3">
                <div>
                    <h2 className="text-xl font-bold">Pack-out Summary</h2>
                    <label className="flex items-center gap-2 text-sm font-semibold mt-2">
                        <Checkbox checked={showOnlyRoomsWithTasks} onCheckedChange={onShowOnlyRoomsWithTasksChange} />
                        Hide completed
                    </label>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleCopy} className="p-2 text-sm font-semibold bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300">
                        <Copy size={18}/>
                    </button>
                    <div className="relative" ref={settingsRef}>
                        <button onClick={() => setShowSettings(v => !v)} className="p-2 text-sm font-semibold bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300">
                            <Settings size={18}/>
                        </button>
                        {showSettings && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border p-2 space-y-2">
                                <button onClick={() => { onToggleView(); setShowSettings(false); }} className="w-full text-left p-2 text-sm hover:bg-slate-100 rounded-md">{viewAsList ? 'Show Card View' : 'Show List View'}</button>
                                <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer p-2 hover:bg-slate-100 rounded-md">
                                    <Checkbox checked={!hideDoneButton} onCheckedChange={(checked) => onHideDoneButtonChange(!checked)} />
                                    Show 'Done' button
                                </label>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="space-y-3">
                <div>
                    <h3 className="text-sm font-semibold text-slate-500 mb-1">Schedule Instructions</h3>
                    {eventInstructions && eventInstructions.trim() ? (
                        <div className="text-xs whitespace-pre-line text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2">
                            {eventInstructions.trim()}
                        </div>
                    ) : (
                        <p className="text-xs text-slate-500">None</p>
                    )}
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-slate-500 mb-1">Initial Instructions</h3>
                    {initialInstructions.some(inst => inst.person || inst.instruction) ? (
                        initialInstructions.map(inst => (
                            (inst.person || inst.instruction) && (
                                <div key={inst.id} className="text-xs text-slate-700 mb-2 pb-2 border-b last:border-b-0">
                                    <p><span className="font-semibold">From:</span> {inst.person} ({inst.role})</p>
                                    <p><span className="font-semibold">Instruction:</span> {inst.instruction}</p>
                                </div>
                            )
                        ))
                    ) : <p className="text-xs text-slate-500">No initial instructions were provided.</p>}
                    
                    <div className="mt-2 pt-2 border-t">
                        {instructionAgreement === 'agree' && <p className="text-xs text-green-700 font-semibold">Status: Instructions Agreed Upon.</p>}
                        {instructionAgreement === 'disagree' && <p className="text-xs text-red-700 font-semibold">Status: Instructions Disagreed Upon.</p>}
                        {instructionAgreement === null && <p className="text-xs text-yellow-600 font-semibold">Status: Not yet reviewed.</p>}
                        {instructionAgreement === 'disagree' && disagreementNote && <p className="text-xs text-red-700 mt-1">Note: {disagreementNote}</p>}
                    </div>
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-slate-500 mb-1">Service Offerings</h3>
                    <div className="flex flex-wrap gap-1">
                        {selectedServices.length > 0 ? selectedServices.map(service => (
                            <span key={service} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full">
                                {service}
                            </span>
                        )) : <span className="text-xs text-slate-500">None</span>}
                    </div>
                </div>
                <div className="pt-2 border-t">
                    <h3 className="text-sm font-semibold text-slate-500 mb-1">Suggested Groups & Notes</h3>
                     <div className="space-y-1">
                        {selectedGroupsList.length > 0 ? selectedGroupsList.map(([group, {note}]) => (
                            <div key={group} className="flex items-baseline text-xs">
                                <span className="font-semibold w-16 text-right mr-2">{group}:</span>
                                <span className="text-slate-700">{note || 'No note'}</span>
                            </div>
                        )) : <span className="text-xs text-slate-500">None</span>}
                    </div>
                </div>
            </div>

            {instructionsByFloor.map(({ floor, rooms }) => (
                <div key={floor} className="pt-3 border-t">
                    <h3 className="text-lg font-semibold mb-2">{floor}</h3>
                    {rooms.map(room => (
                        <div key={room.id} className="mb-3 pl-2">
                            <h4 className="font-bold">{room.name}</h4>
                            <ul className="list-disc pl-5 text-sm space-y-0.5 mt-1">
                                {room.tasks.filter(t => t.type === 'take').length > 0 && 
                                    <li><strong>Pack-out:</strong>
                                        <ul className="list-disc pl-5">
                                            {room.tasks.filter(t => t.type === 'take').map(task => 
                                                <li key={task.id}>
                                                    {task.label}{task.quantity > 1 ? ` (${task.quantity})` : ''}
                                                    {task.changeNote && <em className="text-orange-700 ml-2">Note: {task.changeNote}</em>}
                                                </li>
                                            )}
                                        </ul>
                                    </li>
                                }
                                {room.tasks.filter(t => t.type === 'leave').length > 0 && 
                                    <li><strong>Leave On-site:</strong>
                                        <ul className="list-disc pl-5">
                                            {room.tasks.filter(t => t.type === 'leave').map(task => 
                                                <li key={task.id}>
                                                    {task.label}{task.quantity > 1 ? ` (${task.quantity})` : ''}
                                                    {task.changeNote && <em className="text-orange-700 ml-2">Note: {task.changeNote}</em>}
                                                </li>
                                            )}
                                        </ul>
                                    </li>
                                }
                            </ul>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

const TourTooltip = ({ tourStep, prevStep, nextStep, endTour, refs }) => {
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });

    const tourSteps = [
        { id: 1, ref: refs.modeToggleRef, text: 'Start in Scope Mode to add detailed room-by-room instructions for the pack-out team.' },
        { id: 2, ref: refs.initialInstructionsRef, text: 'Use this section to record any initial instructions from contacts like adjusters or homeowners.' },
        { id: 3, ref: refs.servicesRef, text: 'Add the service offering categories we will be performing on this order. Any that are not selected will be excluded in the pack-out options.' },
        { id: 4, ref: refs.anticipatedGroupsRef, text: 'Add Delivery Groups and notes that you anticipate needing.' },
        { id: 5, ref: refs.floorsRef, text: 'Next, define the floors for the property.' },
        { id: 6, ref: refs.roomsRef, text: 'Now, add rooms using quick lists or by typing a custom name.' },
        { id: 7, ref: refs.selectRef, text: 'Use these buttons to select multiple rooms for bulk editing.' },
        { id: 8, ref: refs.firstRoomRef, text: 'Click on a room card to expand it and add details.' },
        { id: 9, ref: refs.affectedRef, text: 'Specify if the room was affected by the loss and select the damage types.' },
        { id: 10, ref: refs.packoutLeaveRef, text: 'Answer "Yes" here to start adding pack-out or leave instructions.' },
        { id: 11, ref: refs.instructionsRef, text: 'Finally, add specific items and quantities in the Instructions section.' }
    ];

    const currentStep = tourSteps.find(s => s.id === tourStep);

    useEffect(() => {
        if (currentStep && currentStep.ref && currentStep.ref.current) {
            currentStep.ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            const timer = setTimeout(() => {
                if (!currentStep.ref.current) return;
                const rect = currentStep.ref.current.getBoundingClientRect();
                setPosition({
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height,
                });
            }, 600); // Increased timeout for smoother scrolling
            return () => clearTimeout(timer);
        }
    }, [tourStep, currentStep]);
    
    if (!currentStep || !position.width) return null;

    const tooltipTop = position.top > window.innerHeight / 2 
        ? position.top - 16
        : position.top + position.height + 16;
    
    const tooltipTransform = position.top > window.innerHeight / 2
        ? 'translateY(-100%)'
        : 'translateY(0)';

    return (
        <div className="fixed inset-0 z-[100]">
            <div
                className="absolute transition-all duration-300 rounded-lg"
                style={{
                    top: `${position.top - 4}px`,
                    left: `${position.left - 4}px`,
                    width: `${position.width + 8}px`,
                    height: `${position.height + 8}px`,
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 0 3px rgba(59, 130, 246, 1)',
                }}
            ></div>
            <div
                className="absolute z-[101] bg-slate-800 text-white p-4 rounded-lg shadow-2xl max-w-xs transition-all duration-300"
                style={{
                    top: `${tooltipTop}px`,
                    left: `${position.left}px`,
                    transform: tooltipTransform,
                }}
            >
                <p className="text-sm">{currentStep.text}</p>
                <div className="mt-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                         <button onClick={prevStep} disabled={tourStep === 1} className="p-1.5 text-xs text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed border border-gray-600 rounded-md"><ArrowLeft size={16}/></button>
                        <button onClick={endTour} className="text-xs text-slate-400 hover:text-white">Skip Tour</button>
                    </div>
                    <button onClick={tourStep === tourSteps.length ? endTour : nextStep} className="px-3 py-1 bg-sky-500 text-white font-semibold rounded-md text-sm hover:bg-sky-600">
                        {tourStep === tourSteps.length ? 'Finish' : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Data & Constants ---
const uid = () => Math.random().toString(36).slice(2, 10);
const ROOMS_BY_FLOOR_DEFAULTS = { "Floor 1": ["Kitchen", "Living", "Bathroom", "Entrance", "Dining", "Coat", "Family"], "Floor 2": ["Master", "Bedroom 2", "Bedroom 3", "M-Bath"], "Floor 3": [], "Basement": ["Basement"], "Attic": ["Attic"] };
const ROOM_MASTER_DEFAULTS = ["Kitchen", "Living", "Master", "Bathroom", "Bedroom 2", "Bedroom 3", "Basement", "Attic", "Dining", "Coat", "Family"];
const APARTMENT_ROOMS_DEFAULTS = ["Kitchen", "Living", "Master", "Bathroom", "Entrance", "Dining", "Coat", "M-Bath"];
const SERVICE_OFFERINGS = {
  'Appliance': [],
  'Art': [],
  'Consulting': [],
  'Contents': [],
  'Electronics': [],
  'Expert Stain Removal': [],
  'Furniture': [],
  'Hand Clean': [],
  'Pack-out': [],
  'Rugs': [],
  'Storage Only': [],
  'TLI': [],
  'Textiles': ['Blind', 'Board', 'Bulk', 'Dry Clean', 'Decorator', 'Drapes', 'Fold', 'Fur', 'Gown Box', 'Hand Clean', 'Leather', 'Press', 'Shirts', 'Taxidermy'],
};
const ANTICIPATED_GROUPS = ['RD', 'RFD', 'STD', 'STFD', 'LTD', 'LTFD', 'Inhome', 'TLI', 'Test', 'Dispose', 'Storage Only'];
const SEVERITY_OPTIONS = ["Heat", "Soot", "Odor", "Extinguisher Dust", "Construction dust", "Firemen/traffic", "Water", "Humidity", "Musty Smell", "Mold", "Spores"];
const LOCATION_OPTIONS = ["All", "Exposed", "Closets", "Drawers"];
const TASK_REASONS = [ 'Customer Preference', 'PA Instructions', 'Adjuster Instructions', 'Total Loss – must write up', 'Rejected', 'Not Worth Cleaning', 'Customer Cleaning', 'Customer Purging', 'Cash Out – must enter'];
const CHANGE_REASONS = [ 'Customer changed mind', 'Adjuster changed mind', 'PA changed mind', 'Referrer Changed mind'];
const ORDER_CONTACTS = [
  { id: '1', name: 'John Doe', role: 'Adjuster' },
  { id: '2', name: 'Jane Smith', role: 'Homeowner' },
  { id: '3', name: 'Bob Johnson', role: 'Property Manager' },
  { id: '4', name: 'Sally Fields', role: 'Tenant' },
];

const newRoom = (name, floor = "") => ({ id: uid(), name, floorLabel: /basement|attic/i.test(name) ? name : floor, photos: [], severitySelections: [], tasks: [], affected: null, hasCleaning: null, packOut: null, leaveOnsite: null, details: { packOut: { locations: { include: [], exclude: [] }, items: { include: [], exclude: [] } }, leaveOnsite: { locations: { include: [], exclude: [] }, items: { include: [], exclude: [] } } }, ui: { openRoom: false, openStatus: false, openNotes: true, openTasks: true, openCleanQ: false, openPackQ: false, openLeaveQ: false }, completedSections: {} });
const buildAllProxy = () => ({ ...newRoom("Apply to Selected Room(s)"), id: "ALL", ui: { openRoom: true, openStatus: false, openNotes: false, openTasks: false, openCleanQ: false, openPackQ: false, openLeaveQ: false } });

// --- Room Card Component ---

const RoomCard = ({ room, rooms, isSelectionMode, isSelected, onSelect, onToggleSection, onSetField, onToggleSeverity, onToggleInline, mode, dynamicItemOptions, onSetTaskStatus, onSetTaskReason, onDeleteTask, onAddTask, onApplyChanges, bulkDirty, onDeleteRequest, selectedIds, onChangeNote, newlyAddedRoomId, onSetTaskQuantity, tourRefs }) => {
    const cardRef = useRef(null);

    useEffect(() => {
        if (newlyAddedRoomId === room.id && cardRef.current) {
            cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            cardRef.current.classList.add('flash');
            setTimeout(() => {
                cardRef.current?.classList.remove('flash');
            }, 2000);
        }
    }, [newlyAddedRoomId, room.id]);

    const { total, done, hasTLI, hasCashOut, packOutTasks, leaveTasks, hasChangedTasks } = useMemo(() => {
        const tasks = room.tasks || [];
        return { 
            total: tasks.length, 
            done: tasks.filter(t => t.status === 'done' || t.status === 'changed').length, 
            hasTLI: tasks.some(t => t.reason === 'Total Loss – must write up'), 
            hasCashOut: tasks.some(t => t.reason === 'Cash Out – must enter'),
            hasChangedTasks: tasks.some(t => t.status === 'changed'),
            packOutTasks: tasks.filter(t => t.type === 'take'),
            leaveTasks: tasks.filter(t => t.type === 'leave'),
        };
    }, [room.tasks]);
    
    const isComplete = total > 0 && done === total;
    const hasAnyInstructions = room.tasks.length > 0 || room.severitySelections.length > 0;

    const instructionsHighlightClass = (room.packOut === true || room.leaveOnsite === true)
        ? 'border-sky-500 border-2 shadow-lg shadow-blue-500/20'
        : 'border-slate-300';

    let wrapperClass = "rounded-2xl transition-all duration-300";
    let contentBgClass = "bg-white";
    
    if (room.id === 'ALL' && isSelectionMode) {
      wrapperClass += " border-4 animate-flash-green shadow-lg";
    } else if (isSelectionMode && isSelected) { 
      wrapperClass += " border-2 border-orange-500 shadow-md"; 
    } 
    else if (isComplete) { 
      wrapperClass += " border-2 border-slate-400 shadow-md"; contentBgClass = "bg-slate-100"; 
    } 
    else if (hasAnyInstructions) { 
      wrapperClass += " p-[2px] bg-gradient-to-r from-blue-400 to-red-500 shadow-md"; 
    } 
    else { 
      wrapperClass += " border-2 border-slate-200"; 
    }
    
    const showPackOutChip = room.details.packOut.locations.include.length > 0 || room.details.packOut.items.include.length > 0;
    
    return (
      <div ref={cardRef} className={wrapperClass}>
        <div className={`${contentBgClass} w-full h-full rounded-[14px]`}>
          <div className="w-full text-left p-2 flex items-center justify-between cursor-pointer" onClick={() => (isSelectionMode && room.id !== 'ALL') ? onSelect() : onToggleSection(room.id, "openRoom")}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
                {isSelectionMode && room.id !== 'ALL' && <Checkbox checked={isSelected} onCheckedChange={onSelect} />}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-lg flex items-center flex-wrap gap-2">
                    <span className="truncate">{room.name}</span>
                     {room.id !== 'ALL' && room.affected === true && <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800 flex-shrink-0">Affected</span>}
                     {room.id !== 'ALL' && room.affected === false && <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 flex-shrink-0">Not Affected</span>}
                     {room.id !== 'ALL' && showPackOutChip && <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 flex-shrink-0">Pack-out</span>}
                     {hasTLI && <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 flex-shrink-0">TLI</span>}
                     {hasCashOut && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 flex-shrink-0">Cash Out</span>}
                     {hasChangedTasks && <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800 flex-shrink-0">Changed</span>}
                  </div>
                  <div className="text-sm opacity-70">{room.floorLabel || ""}</div>
                </div>
            </div>
            { room.id !== 'ALL' &&
            <div className="text-base font-medium flex items-center gap-4 flex-shrink-0">
             <div className="flex flex-col items-center"><span className="text-xs font-bold -mb-1">{room.photos.length}</span><button onClick={(e) => { e.stopPropagation(); alert(`Camera for room: ${room.name}`); }} className="p-1 hover:bg-slate-200 rounded-full"><Camera size={22} /></button></div>
              {mode !== 'pack-out' && <button onClick={(e) => { e.stopPropagation(); onDeleteRequest(room.id); }} className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-full"><Trash2 size={22}/></button>}
              {total > 0 ? (<span>{done}/{total}</span>) : (<span className="text-sm opacity-70">no tasks</span>) }
              {!isSelectionMode && <span className={`opacity-60 transition-transform ${room.ui?.openRoom ? "rotate-180" : ""}`}><ChevronDown size={27}/></span>}
            </div>}
          </div>
          {room.ui?.openRoom && (
            <div className="p-2 space-y-2">
              {(mode === 'scope' || room.id === 'ALL') && (
                <>
                  {room.id === 'ALL' && (
                      <div className="flex gap-2 items-center">
                          <select onChange={e => onSetField(room.id, 'floorLabel', e.target.value, true)} className="flex-grow border rounded-lg px-3 py-1.5 text-sm">
                              <option value="">Set Floor Label for Selected</option>
                              {selectedIds.map(id => rooms.find(r => r.id === id)?.floorLabel).filter((v, i, a) => a.indexOf(v) === i && v).map(f => <option key={f} value={f}>{f}</option>)}
                          </select>
                      </div>
                  )}
                  <div ref={tourRefs?.affectedRef}>
                    <StatusSection title="Affected by loss?" open={room.ui?.openStatus} onToggle={() => onToggleSection(room.id, "openStatus", 'affected')} right={<YesNo value={room.affected} onYes={() => onSetField(room.id, "affected", true)} onNo={() => onSetField(room.id, "affected", false)} />} isComplete={room.completedSections?.affected} >
                        {<div className="flex flex-wrap gap-1">{SEVERITY_OPTIONS.map(s => <button key={s} onClick={() => onToggleSeverity(room.id, s)} className={`px-2 py-0.5 text-xs rounded-full border ${room.severitySelections.includes(s) ? "bg-sky-500 text-white" : "bg-white"}`}>{s}</button>)}</div>}
                    </StatusSection>
                  </div>
                  {(room.affected === false || room.id === 'ALL') && <StatusSection title="Any tasks for us?" open={room.ui?.openCleanQ} onToggle={() => onToggleSection(room.id, "openCleanQ", 'hasCleaning')} right={<YesNo value={room.hasCleaning} onYes={() => onSetField(room.id, "hasCleaning", true)} onNo={() => onSetField(room.id, "hasCleaning", false)} />} isComplete={room.completedSections?.hasCleaning} />}
                  <div ref={tourRefs?.packoutLeaveRef} className="space-y-2">
                    <StatusSection title="Anything to Pack-out?" open={room.ui?.openPackQ} onToggle={() => onToggleSection(room.id, "openPackQ", 'packOut')} right={<YesNo value={room.packOut} onYes={() => onSetField(room.id, "packOut", true)} onNo={() => onSetField(room.id, "packOut", false)} />} isComplete={room.completedSections?.packOut} >
                        {room.packOut && (dynamicItemOptions.length > 0 ? <div className="space-y-2"><div className="text-xs opacity-70">Locations</div><div className="flex flex-wrap gap-1">{LOCATION_OPTIONS.map(o => <button key={o} onClick={() => onToggleInline(room.id, "packOut", "locations", o)} className={`px-2 py-0.5 text-xs rounded-full border ${room.details?.packOut?.locations?.include?.includes(o) ? "bg-sky-500 text-white" : "bg-white"}`}>{o}</button>)}</div><div className="text-xs opacity-70">Items</div><div className="flex flex-wrap gap-1">{dynamicItemOptions.map(o => <button key={o} onClick={() => onToggleInline(room.id, "packOut", "items", o)} className={`px-2 py-0.5 text-xs rounded-full border ${room.details?.packOut?.items?.include?.includes(o) ? "bg-sky-500 text-white" : "bg-white"}`}>{o}</button>)}</div></div> : <div className="text-xs text-slate-500 p-2 text-center">Select service offerings to display items.</div>)}
                    </StatusSection>
                    <StatusSection title="Anything to leave?" open={room.ui?.openLeaveQ} onToggle={() => onToggleSection(room.id, "openLeaveQ", 'leaveOnsite')} right={<YesNo value={room.leaveOnsite} onYes={() => onSetField(room.id, "leaveOnsite", true)} onNo={() => onSetField(room.id, "leaveOnsite", false)} />} isComplete={room.completedSections?.leaveOnsite}>
                        {room.leaveOnsite && (dynamicItemOptions.length > 0 ? <div className="space-y-2"><div className="text-xs opacity-70">Locations</div><div className="flex flex-wrap gap-1">{LOCATION_OPTIONS.map(o => <button key={o} onClick={() => onToggleInline(room.id, "leaveOnsite", "locations", o)} className={`px-2 py-0.5 text-xs rounded-full border ${room.details?.leaveOnsite?.locations?.include?.includes(o) ? "bg-sky-500 text-white" : "bg-white"}`}>{o}</button>)}</div><div className="text-xs opacity-70">Items</div><div className="flex flex-wrap gap-1">{dynamicItemOptions.map(o => <button key={o} onClick={() => onToggleInline(room.id, "leaveOnsite", "items", o)} className={`px-2 py-0.5 text-xs rounded-full border ${room.details?.leaveOnsite?.items?.include?.includes(o) ? "bg-sky-500 text-white" : "bg-white"}`}>{o}</button>)}</div></div> : <div className="text-xs text-slate-500 p-2 text-center">Select service offerings to display items.</div>)}
                    </StatusSection>
                  </div>
                </>
              )}
               <div ref={tourRefs?.instructionsRef} className={`border rounded-xl transition-all duration-300 ${instructionsHighlightClass}`}>
                  <div className="w-full px-3 py-2 flex items-center justify-between cursor-pointer" onClick={() => onToggleSection(room.id, "openTasks", 'instructions')}>
                    <div className="flex items-center gap-2">
                        {room.completedSections?.instructions && !room.ui?.openTasks && <CheckCircle2 className="text-green-500 flex-shrink-0" size={16} />}
                        <span className="text-sm font-semibold">Instructions</span>
                    </div>
                    <span className={`opacity-60 transition-transform ${room.ui?.openTasks ? "rotate-180" : ""}`}><ChevronDown size={20}/></span>
                  </div>
                  {room.ui?.openTasks && (
                  <div className="p-3 pb-2 space-y-2">
                    {(packOutTasks.length > 0 || mode !== 'pack-out') && (
                      <div>
                        {mode === 'scope' && packOutTasks.length > 0 && <div className="font-semibold text-sm mb-1">Pack-out:</div>}
                        <div className="space-y-1">
                          {packOutTasks.map(t => <TaskRow key={t.id} roomId={room.id} task={t} onSetStatus={onSetTaskStatus} onSetReason={onSetTaskReason} onDelete={onDeleteTask} mode={mode} onChangeNote={onChangeNote} onSetQuantity={onSetTaskQuantity} />)}
                          {mode !== 'pack-out' && <NotesInput onAdd={(text, type) => onAddTask(room.id, text, type)} type="take"/>}
                        </div>
                      </div>
                    )}
                    {(leaveTasks.length > 0 || mode === 'scope') && (
                      <div>
                        <div className="font-semibold text-sm mt-2 mb-1">Leave Instructions:</div>
                        <div className="space-y-1">
                          {leaveTasks.map(t => <TaskRow key={t.id} roomId={room.id} task={t} onSetStatus={onSetTaskStatus} onSetReason={onSetTaskReason} onDelete={onDeleteTask} mode={mode} onChangeNote={onChangeNote} onSetQuantity={onSetTaskQuantity} />)}
                          {mode !== 'pack-out' && <NotesInput onAdd={(text, type) => onAddTask(room.id, text, type)} type="leave"/>}
                        </div>
                      </div>
                    )}
                  </div>
                  )}
                </div>
                 {room.id === 'ALL' && <div className="mt-2"><button onClick={onApplyChanges} disabled={!bulkDirty || selectedIds.length === 0} className="w-full px-4 py-2 text-sm font-semibold bg-sky-500 text-white rounded-lg disabled:bg-gray-400">Apply to {selectedIds.length} Room(s)</button></div>}
                 {room.id !== 'ALL' && <button onClick={() => onToggleSection(room.id, "openRoom")} className="w-full mt-2 bg-slate-200 text-slate-800 font-semibold py-2 rounded-lg hover:bg-slate-300 text-sm">Done</button>}
            </div>
          )}
        </div>
      </div>
    );
};

// --- Main App Component ---
export default function SameDayScope({ onExit, eventInstructions, onEventInstructionsChange, serviceOfferings, onServiceOfferingsChange, suggestedGroups, onSuggestedGroupsChange, lossSeverity, onLossSeverityChange, orderTypes = [], severityCodes = [], claimNumber = "", addressLabel = "", customers = [], familyMedicalIssues = "", soapFragAllergies = "", sdsConsiderations = [], sdsObservations = [], sdsServices = [] }) {
  const [rooms, setRooms] = useState([]);
  const [mode, setMode] = useState("scope");
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [allModel, setAllModel] = useState(buildAllProxy());
  const [bulkDirty, setBulkDirty] = useState(false);
  const [openAddRooms, setOpenAddRooms] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [showConfirmation, setShowConfirmation] = useState({ open: false, type: null, selection: [] });
  const [showFromListSelection, setShowFromListSelection] = useState({open: false, floor: 'Floor 1'});
  const [selectedFromList, setSelectedFromList] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [changingTask, setChangingTask] = useState(null);
  const [changeNote, setChangeNote] = useState("");
  const [selectedServices, setSelectedServices] = useState(serviceOfferings || []);
  const [eventInstructionDraft, setEventInstructionDraft] = useState(eventInstructions || "");
  const [openServiceOfferings, setOpenServiceOfferings] = useState(false);
  const [anticipatedGroups, setAnticipatedGroups] = useState(ANTICIPATED_GROUPS.reduce((acc, group) => ({...acc, [group]: {selected: false, note: ''}}), {}));
  const [openAnticipatedGroups, setOpenAnticipatedGroups] = useState(false);
  const [textileFilters, setTextileFilters] = useState(SERVICE_OFFERINGS['Textiles']);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [deletingRoomId, setDeletingRoomId] = useState(null);
  const [projectFloors, setProjectFloors] = useState([]);
  const [openFloors, setOpenFloors] = useState(false);
  const [newFloorNumber, setNewFloorNumber] = useState("");
  const [showOnlyRoomsWithTasks, setShowOnlyRoomsWithTasks] = useState(false);
  const [showDoneConfirm, setShowDoneConfirm] = useState(false);
  const [newlyAddedRoomId, setNewlyAddedRoomId] = useState(null);
  const [bedroomNames, setBedroomNames] = useState([]);
  const [numBedrooms, setNumBedrooms] = useState("");
  const [masterRoomList, setMasterRoomList] = useState(ROOM_MASTER_DEFAULTS);
  const [apartmentRoomList, setApartmentRoomList] = useState(APARTMENT_ROOMS_DEFAULTS);
  const [roomsByFloor, setRoomsByFloor] = useState(ROOMS_BY_FLOOR_DEFAULTS);
  const [viewAsList, setViewAsList] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showSdsDoc, setShowSdsDoc] = useState(false);
  const [showSdsSetup, setShowSdsSetup] = useState(false);
  const [sdsSelectedServices, setSdsSelectedServices] = useState([]);
  const [tourStep, setTourStep] = useState(0);
  const [isTourStarting, setIsTourStarting] = useState(false);
  const [initialInstructions, setInitialInstructions] = useState([{ id: uid(), person: '', role: '', instruction: '' }]);
  const [openInitialInstructions, setOpenInitialInstructions] = useState(false);
  const [instructionAgreement, setInstructionAgreement] = useState(null);
  const [disagreementNote, setDisagreementNote] = useState('');
  const [hideDoneButton, setHideDoneButton] = useState(false);
  const [showPackoutSettings, setShowPackoutSettings] = useState(false);
  const settingsRef = useRef(null);
  const bulkEditCardRef = useRef(null);
  const roomListContainerRef = useRef(null);

  const setServicesAndSync = (updater) => {
    setSelectedServices(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      onServiceOfferingsChange?.(next);
      return next;
    });
  };

  const SDS_SERVICE_OPTIONS = [
    { id: "Unpacking", icon: "/Gemini_Unpacking.png" },
    { id: "Photo Inventory", icon: "/Gemini_Photo_Inventory.png" },
    { id: "Fiber Protection", icon: "/Gemini_Fiber_Protection.png" },
    { id: "Premium Brands", icon: "/Gemini_Premium_Brands.png" },
    { id: "Anti-Microbial", icon: "/Gemini_Anti_Microbial.png" },
    { id: "Fold ASAP", icon: "/Gemini_Fold_AMAP.png" }
  ];

  const setGroupsAndSync = (updater) => {
    setAnticipatedGroups(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      const selected = Object.entries(next)
        .filter(([, v]) => v?.selected)
        .map(([k]) => k);
      onSuggestedGroupsChange?.(selected);
      return next;
    });
  };

  // Refs for tour
  const tourRefs = {
      modeToggleRef: useRef(null),
      servicesRef: useRef(null),
      anticipatedGroupsRef: useRef(null),
      floorsRef: useRef(null),
      roomsRef: useRef(null),
      initialInstructionsRef: useRef(null),
      selectRef: useRef(null),
      firstRoomRef: useRef(null),
      affectedRef: useRef(null),
      packoutLeaveRef: useRef(null),
      instructionsRef: useRef(null),
  };

  useEffect(() => {
    if (Array.isArray(serviceOfferings)) {
      setSelectedServices(serviceOfferings);
    }
  }, [serviceOfferings]);

  useEffect(() => {
    if (!Array.isArray(suggestedGroups)) return;
    setAnticipatedGroups(prev => {
      const next = { ...prev };
      ANTICIPATED_GROUPS.forEach(group => {
        const existing = prev[group] || { selected: false, note: '' };
        next[group] = { ...existing, selected: suggestedGroups.includes(group) };
      });
      return next;
    });
  }, [suggestedGroups]);

  useEffect(() => {
    const next = eventInstructions || "";
    setEventInstructionDraft(next);
  }, [eventInstructions]);

  const handleEventInstructionChange = (value) => {
    setEventInstructionDraft(value);
    onEventInstructionsChange?.(value);
  };

  const isSectionUpdated = (room, key) => {
    switch (key) {
      case 'affected':
        return room.affected !== null; // Yes/No answered
      case 'hasCleaning':
        return room.hasCleaning !== null; // Yes/No answered
      case 'packOut':
        return room.packOut !== null; // Yes/No answered (true or false)
      case 'leaveOnsite':
        return room.leaveOnsite !== null; // Yes/No answered
      case 'instructions':
        return (room.tasks?.length || 0) > 0; // has at least one task
      default:
        return false;
    }
  };

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    if (hasSeenTour !== 'true') {
        const hideHelp = localStorage.getItem('hideHelpModal');
         if (hideHelp !== 'true') {
            setShowHelp(true);
         }
    }
  }, []);

  const startTour = () => {
    setShowHelp(false);
    setOpenServiceOfferings(true);
    setOpenAnticipatedGroups(true);
    setOpenFloors(true);
    setOpenAddRooms(true);
    setOpenInitialInstructions(true);
    setIsTourStarting(true);
  };
  
  const prevTourStep = () => setTourStep(prev => (prev > 1 ? prev - 1 : 1));
  const nextTourStep = () => setTourStep(prev => prev + 1);
  const endTour = () => {
    setTourStep(0);
    localStorage.setItem('hasSeenTour', 'true');
    setOpenServiceOfferings(false);
    setOpenAnticipatedGroups(false);
    setOpenFloors(false);
    setOpenAddRooms(false);
    setOpenInitialInstructions(false);
  };

  useEffect(() => {
    if (isTourStarting) {
        if (rooms.length === 0) {
            addSingleRoom("Example Room", "Floor 1", true);
        } else {
            const allRoomsOpen = rooms.every(r => r.ui.openRoom);
            if (!allRoomsOpen) {
                setRooms(prev => prev.map(r => ({...r, ui: {...r.ui, openRoom: true}})));
            }
            // Add a slight delay to ensure the DOM is updated before starting the tour.
            setTimeout(() => {
                setTourStep(1);
                setIsTourStarting(false);
            }, 200);
        }
    }
  }, [isTourStarting]);

  useEffect(() => {
      if (isTourStarting && rooms.length > 0 && rooms.every(r => r.ui.openRoom)) {
          setTimeout(() => {
              setTourStep(1);
              setIsTourStarting(false);
          }, 200);
      }
  }, [rooms, isTourStarting]);


  useEffect(() => {
    setRooms(prev => prev.map(room => ({ ...room, ui: { ...room.ui, openTasks: mode === 'pack-out', openStatus: false, openCleanQ: false, openPackQ: false, openLeaveQ: false, openNotes: mode === 'scope' } })));
    if (mode === 'pack-out') {
        setViewAsList(true);
    }
  }, [mode]);
  
  const dynamicItemOptions = useMemo(() => {
    const items = new Set();
    selectedServices.forEach(service => {
      if (service === 'Textiles') { textileFilters.forEach(sub => items.add(sub)); } 
      else if (SERVICE_OFFERINGS[service]?.length > 0) { SERVICE_OFFERINGS[service].forEach(sub => items.add(sub)); } 
      else { items.add(service); }
    });
    return Array.from(items);
  }, [selectedServices, textileFilters]);
  
  const totalTasks = useMemo(() => rooms.flatMap(r => r.tasks).length, [rooms]);
  const undoneTasks = useMemo(() => {
    return rooms.flatMap(room => 
        room.tasks.filter(task => task.status === 'pending')
                  .map(task => ({ ...task, roomName: room.name }))
    );
  }, [rooms]);
  
  const visibleRooms = useMemo(() => {
    if (mode === 'pack-out' && showOnlyRoomsWithTasks) {
      return rooms.filter(room => {
        if (room.tasks.length === 0) return false;
        const doneCount = room.tasks.filter(t => t.status === 'done' || t.status === 'changed').length;
        return doneCount < room.tasks.length;
      });
    }
    return rooms;
  }, [rooms, mode, showOnlyRoomsWithTasks]);

  const addSingleRoom = (name, floor, shouldOpen = false) => {
      const trimmedName = name.trim();
      if (!trimmedName) return;
      const newR = newRoom(trimmedName, floor);
      newR.ui.openRoom = shouldOpen;
      setRooms(prev => {
        if (prev.some(r => r.name === trimmedName)) {
            // If room exists but we need to ensure it's open for the tour
            if (shouldOpen) {
                return prev.map(r => r.name === trimmedName ? {...r, ui: {...r.ui, openRoom: true}} : r);
            }
            return prev;
        }
        const newRooms = [...prev, newR];
        if(shouldOpen){
            setNewlyAddedRoomId(newR.id);
            setTimeout(() => setNewlyAddedRoomId(null), 2100);
        }
        return newRooms;
      });
  };
  
  const addMultipleRooms = (names, floor) => {
      const roomsToAdd = names.filter(name => name.trim() && !rooms.some(r => r.name === name.trim()));
      if (roomsToAdd.length === 0) return;

      const newRooms = roomsToAdd.map(name => newRoom(name.trim(), floor));
      setRooms(prev => [...prev, ...newRooms]);
      const lastRoomId = newRooms[newRooms.length - 1].id;
      setNewlyAddedRoomId(lastRoomId);
      setTimeout(() => setNewlyAddedRoomId(null), 2100);
  };
  
  const handleQuickAdd = (type) => setShowConfirmation({ open: true, type, selection: [...(type === "Home" ? masterRoomList : apartmentRoomList)] });
  const handleQuickAddConfirm = () => { addMultipleRooms(showConfirmation.selection); setShowConfirmation({ open: false, type: null, selection: [] }); };
  const toggleQuickAddRoom = (roomName) => setShowConfirmation(prev => ({ ...prev, selection: prev.selection.includes(roomName) ? prev.selection.filter(r => r !== roomName) : [...prev.selection, roomName] }));
  
  const addFromListRooms = () => { 
    const floor = showFromListSelection.floor;
    addMultipleRooms(selectedFromList, floor); 
    setShowFromListSelection({open: false, floor: 'Floor 1'}); 
    setSelectedFromList([]); 
  };
  
  const handleClearAll = () => {
    setRooms([]);
    setIsSelectionMode(false);
    setSelectedIds([]);
    setAllModel(buildAllProxy());
    setSelectedServices([]);
    setTextileFilters(SERVICE_OFFERINGS['Textiles']);
    setShowClearConfirm(false);
    setMode('scope');
    setProjectFloors([]);
  };

  const handleDeleteRoom = (roomId) => {
    setRooms(prev => prev.filter(r => r.id !== roomId));
    setDeletingRoomId(null);
  }

  const toggleFloor = (floor) => {
    const apartmentTypes = ['Studio', 'Duplex', 'Triplex'];

    setProjectFloors(prev => {
        let next = [...prev];
        const isAdding = !next.includes(floor);
        const isApartmentType = apartmentTypes.includes(floor);

        if (isAdding) {
            if (isApartmentType) {
                // Remove other apartment types before adding the new one
                next = next.filter(f => !apartmentTypes.includes(f));
            }
            let floorsToAdd = [floor];
            if (floor === 'Duplex') floorsToAdd.push('Floor 1', 'Floor 2');
            if (floor === 'Triplex') floorsToAdd.push('Floor 1', 'Floor 2', 'Floor 3');
            next = [...new Set([...next, ...floorsToAdd])];
        } else {
            let floorsToRemove = [floor];
             if (floor === 'Duplex') floorsToRemove.push('Floor 1', 'Floor 2');
             if (floor === 'Triplex') floorsToRemove.push('Floor 1', 'Floor 2', 'Floor 3');
            next = next.filter(f => !floorsToRemove.includes(f));
        }

        return next.sort((a,b) => {
            if (a === 'Basement') return -1;
            if (b === 'Basement') return 1;
            if (a === 'Attic') return 1;
            if (b === 'Attic') return -1;
            return a.localeCompare(b, undefined, {numeric: true});
        });
    });
};

  const addNumericFloor = () => {
      const num = parseInt(newFloorNumber);
      if (!num || isNaN(num) || num < 1) {
          setNewFloorNumber("");
          return;
      }
      
      const floorsToAdd = [];
      for (let i = 1; i <= num; i++) {
          floorsToAdd.push(`Floor ${i}`);
      }
      
      setProjectFloors(prev => {
          const newFloors = [...new Set([...prev, ...floorsToAdd])];
           return newFloors.sort((a,b) => {
            if (a === 'Basement') return -1;
            if (b === 'Basement') return 1;
            if (a === 'Attic') return 1;
            if (b === 'Attic') return -1;
            return a.localeCompare(b, undefined, {numeric: true});
        });
      });

      setNewFloorNumber("");
  };

  const toggleRoomSection = (roomId, sectionKey, completedKey) => {
    if (tourStep === 7 && sectionKey === "openRoom") {
      nextTourStep();
    }
    setRooms(prev =>
      prev.map(r => {
        if (r.id === roomId) {
          const isOpening = !r.ui[sectionKey];
          const wasOpen = r.ui[sectionKey];
          const updatedUi = { ...r.ui, [sectionKey]: isOpening };

          let updatedCompleted = { ...r.completedSections };
          if (wasOpen && completedKey && isSectionUpdated(r, completedKey)) {
            updatedCompleted[completedKey] = true;
          }

          return { ...r, ui: updatedUi, completedSections: updatedCompleted };
        }
        return r;
      })
    );
  };
  
  const setRoomField = (roomId, key, value, isBulk = false) => {
    if (isSelectionMode || roomId === 'ALL') {
      setBulkDirty(true);
      setAllModel(m => {
        let next = { ...m, [key]: value };
        if (key === 'packOut') next.ui.openPackQ = !!value;
        if (key === 'leaveOnsite') next.ui.openLeaveQ = !!value;

        if (['packOut', 'leaveOnsite'].includes(key)) {
          const justClosed =
            (key === 'packOut' && !next.ui.openPackQ) ||
            (key === 'leaveOnsite' && !next.ui.openLeaveQ);
          if (justClosed && isSectionUpdated(next, key)) {
            next.completedSections = { ...(next.completedSections || {}), [key]: true };
          }
        }

        return next;
      });
    } else {
      setRooms(prev => prev.map(r => {
        if (r.id !== roomId) return r;
        let next = { ...r, [key]: value };

        if (key === 'affected') {
          next.ui = { ...r.ui, openStatus: !!value, openCleanQ: !value };
          if (!value && isSectionUpdated(next, 'affected')) {
            next.completedSections = { ...(next.completedSections || {}), affected: true };
          }
        }

        if (key === 'hasCleaning') {
          if (value === false && next.affected === false) {
            next.ui.openRoom = false;
          }
        }

        if (key === 'packOut') {
          next.ui = { ...r.ui, openPackQ: !!value };
          if (!value && isSectionUpdated(next, 'packOut')) {
              next.completedSections = { ...(next.completedSections || {}), packOut: true };
          }
        }

        if (key === 'leaveOnsite') {
          next.ui = { ...r.ui, openLeaveQ: !!value };
           if (!value && isSectionUpdated(next, 'leaveOnsite')) {
              next.completedSections = { ...(next.completedSections || {}), leaveOnsite: true };
          }
        }

        return next;
      }));
    }
  };


  const addTask = (roomId, text, type) => { if (!text?.trim()) return; setRooms(prev => prev.map(r => r.id === roomId ? { ...r, tasks: [...r.tasks, { id: uid(), type, label: text.trim(), status: 'pending', photos: [], reason: '', changeNote: '', isFreeform: true, quantity: 1 }] } : r)); };
  
  const setTaskStatus = (roomId, taskId, status) => setRooms(prev => prev.map(r => r.id === roomId ? { ...r, tasks: r.tasks.map(t => t.id === taskId ? { ...t, status } : t) } : r));
  const deleteTask = (roomId, taskId) => setRooms(prev => prev.map(r => r.id === roomId ? { ...r, tasks: r.tasks.filter(t => t.id !== taskId) } : r));
  const setTaskReason = (roomId, taskId) => setEditingTask({roomId, taskId});
  const openChangeNoteModal = (roomId, taskId) => {
      const room = rooms.find(r => r.id === roomId);
      if(room) {
          const task = room.tasks.find(t => t.id === taskId);
          if(task) {
              setChangeNote(task.changeNote || "");
          }
      }
      setChangingTask({roomId, taskId});
  };
  
  const handleSetChangeNote = (note) => {
      if (!changingTask) return;
      const {roomId, taskId} = changingTask;
      setRooms(prev => prev.map(r => r.id === roomId ? { ...r, tasks: r.tasks.map(t => t.id === taskId ? { ...t, changeNote: note, status: 'changed' } : t) } : r));
      setChangingTask(null);
      setChangeNote("");
  }

  const setTaskQuantity = (roomId, taskId, quantity) => {
    const numQuantity = parseInt(quantity, 10);
    setRooms(prev => 
        prev.map(r => 
            r.id === roomId ? 
            { ...r, tasks: r.tasks.map(t => t.id === taskId ? { ...t, quantity: isNaN(numQuantity) || numQuantity < 1 ? 1 : numQuantity } : t) } 
            : r
        )
    );
  };


  const toggleSeverity = (roomId, sev) => {
    const updater = r => { const has = r.severitySelections.includes(sev); setBulkDirty(true); return { ...r, severitySelections: has ? r.severitySelections.filter(s => s !== sev) : [...r.severitySelections, sev], affected: true }; };
    if (isSelectionMode) { setAllModel(updater); } else { setRooms(prev => prev.map(r => r.id === roomId ? updater(r) : r)); }
  };
  
  const toggleInline = (roomId, key, group, value) => {
    const updater = r => { 
        const computeTasksFromDetails = (details) => {
            const t = [];
            details.packOut.locations.include.forEach(loc => t.push({ type: "take", label: loc }));
            details.packOut.items.include.forEach(it => t.push({ type: "take", label: it }));
            details.leaveOnsite.locations.include.forEach(loc => t.push({ type: "leave", label: loc }));
            details.leaveOnsite.items.include.forEach(it => t.push({ type: "leave", label: it }));
            return t;
        };
        const rebuildTasks = (room) => {
            const preserved = room.tasks.filter(t => t.isFreeform);
            const generated = computeTasksFromDetails(room.details).map(t => ({ id: uid(), status: 'pending', photos: [], reason: '', ...t, isFreeform: false, quantity: 1 }));
            return [...preserved, ...generated];
        };
        const setInc = new Set(r.details[key][group].include); 
        if (setInc.has(value)) setInc.delete(value); else setInc.add(value); 
        const upd = { ...r, details: { ...r.details, [key]: { ...r.details[key], [group]: { ...r.details[key][group], include: Array.from(setInc) } } } }; 
        setBulkDirty(true);
        return { ...upd, tasks: rebuildTasks(upd) }; 
    };
    if (isSelectionMode) { setAllModel(updater); } else { setRooms(prev => prev.map(r => r.id === roomId ? updater(r) : r)); }
  };

  const applyBulkChanges = () => {
    const computeTasksFromDetails = (details) => {
        const t = [];
        details.packOut.locations.include.forEach(loc => t.push({ type: "take", label: loc }));
        details.packOut.items.include.forEach(it => t.push({ type: "take", label: it }));
        details.leaveOnsite.locations.include.forEach(loc => t.push({ type: "leave", label: loc }));
        details.leaveOnsite.items.include.forEach(it => t.push({ type: "leave", label: it }));
        return t;
    };
    const rebuildTasks = (room) => {
        const preserved = room.tasks.filter(t => t.isFreeform);
        const generated = computeTasksFromDetails(room.details).map(t => ({ id: uid(), status: 'pending', photos: [], reason: '', ...t, isFreeform: false, quantity: 1 }));
        return [...preserved, ...generated];
    };
    const union = (a, b) => Array.from(new Set([...(a || []), ...(b || [])]));

    setRooms(prev => prev.map(r => {
      if (!selectedIds.includes(r.id)) return r;
      let next = { ...r, details: JSON.parse(JSON.stringify(r.details)) };
      if (allModel.floorLabel && !/basement|attic/i.test(next.name)) next.floorLabel = allModel.floorLabel;
      if (allModel.affected !== null) next.affected = allModel.affected;
      next.severitySelections = union(r.severitySelections, allModel.severitySelections);
      next.details.packOut.locations.include = union(r.details.packOut.locations.include, allModel.details.packOut.locations.include);
      next.details.packOut.items.include = union(r.details.packOut.items.include, allModel.details.packOut.items.include);
      next.tasks = rebuildTasks(next);
      return next;
    }));
    setIsSelectionMode(false); setSelectedIds([]); setAllModel(buildAllProxy()); setBulkDirty(false);
  };

  const handleSelectRooms = () => { 
    setIsSelectionMode(prev => { 
      if (prev) { 
        setSelectedIds([]); 
        setAllModel(buildAllProxy()); 
        setBulkDirty(false); 
      } else { 
        setRooms(r => r.map(rm => ({ ...rm, ui: { ...rm.ui, openRoom: false } })));
        setTimeout(() => {
          roomListContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } 
      return !prev; 
    }); 
  };
  
  const handleSelectAll = () => { 
    setIsSelectionMode(true); 
    setRooms(r => r.map(rm => ({ ...rm, ui: { ...rm.ui, openRoom: false } }))); 
    setSelectedIds(rooms.map(r => r.id));
    setTimeout(() => {
      bulkEditCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };
  
  const handleNumBedroomsChange = (e) => {
      const count = parseInt(e.target.value, 10);
      setNumBedrooms(e.target.value);

      if (count > 0) {
          const names = ['Master'];
          for (let i = 2; i <= count; i++) {
              names.push(`Bedroom ${i}`);
          }
          setBedroomNames(names);
      } else {
          setBedroomNames([]);
      }
  };

  const handleBedroomNameChange = (index, newName) => {
      const updatedNames = [...bedroomNames];
      updatedNames[index] = newName;
      setBedroomNames(updatedNames);
  };

  const handleAddBedrooms = () => {
    const newMasterList = [...new Set([...masterRoomList, ...bedroomNames])];
    setMasterRoomList(newMasterList);
    setApartmentRoomList(prev => [...new Set([...prev, ...bedroomNames])]);

    const newRoomsByFloor = {...roomsByFloor};
    Object.keys(newRoomsByFloor).forEach(floor => {
        newRoomsByFloor[floor] = [...new Set([...newRoomsByFloor[floor], ...bedroomNames])]
    });
    setRoomsByFloor(newRoomsByFloor);

    setNumBedrooms("");
    setBedroomNames([]);
  };

  const handleInstructionChange = (id, field, value) => {
    setInitialInstructions(prev => {
        const next = prev.map(inst => {
            if (inst.id === id) {
                if (field === 'contact') {
                    const selectedContact = ORDER_CONTACTS.find(c => c.id === value);
                    return {
                        ...inst,
                        person: selectedContact ? selectedContact.name : '',
                        role: selectedContact ? selectedContact.role : '',
                    };
                }
                return { ...inst, [field]: value };
            }
            return inst;
        });
        return next;
    });
};

  const addInstruction = () => {
    setInitialInstructions(prev => [...prev, { id: uid(), person: '', role: '', instruction: '' }]);
  };

  const removeInstruction = (id) => {
    setInitialInstructions(prev => prev.filter(inst => inst.id !== id));
  };


  const servicesComplete = selectedServices.length > 0;
  const groupsComplete = useMemo(() => Object.values(anticipatedGroups).some(g => g.selected), [anticipatedGroups]);
  const floorsComplete = projectFloors.length > 0;
  const roomsComplete = rooms.length > 0;
  const initialInstructionsComplete = initialInstructions.some(inst => inst.person.trim() !== '' && inst.instruction.trim() !== '') && instructionAgreement === 'agree';
  const initialInstructionsBorderClass = !openInitialInstructions ? (instructionAgreement === 'agree' ? 'border-green-500 border-2' : 'border-red-500 border-2') : 'border-slate-200';

  const availableRoomsFromMaster = useMemo(() => {
    const usedRoomNames = new Set(rooms.map(r => r.name));
    const currentList = roomsByFloor[showFromListSelection.floor] || masterRoomList;
    return currentList.filter(roomName => !usedRoomNames.has(roomName));
  }, [rooms, masterRoomList, roomsByFloor, showFromListSelection.floor]);
  
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => onExit?.()}
            className="flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <div className="text-lg font-bold text-slate-800">Same Day Scope</div>
          <button
            type="button"
            onClick={() => {
              setSdsSelectedServices(selectedServices || []);
              setShowSdsSetup(true);
            }}
            className="ml-auto rounded-full border border-slate-300 px-3 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            Preview SDS
          </button>
        </div>
      </div>
      <div className="max-w-2xl mx-auto p-4 space-y-4 font-sans">
      <style>{`
        .flash {
          animation: flash-animation 2s ease-out;
        }
        @keyframes flash-animation {
          0% { box-shadow: 0 0 20px 5px rgba(255, 255, 0, 0.7); }
          100% { box-shadow: none; }
        }
        .animate-flash-green {
          animation: flash-green 1.5s infinite;
        }
        @keyframes flash-green {
          0%, 100% { border-color: #10B981; } /* emerald-500 */
          50% { border-color: #A7F3D0; } /* emerald-200 */
        }
      `}</style>
      
      {showHelp && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100]">
            <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm text-center">
                <Info className="text-sky-500 mx-auto" size={40}/>
                <h3 className="text-xl font-bold mt-4">Welcome!</h3>
                <p className="text-sm text-slate-600 my-4">Would you like a quick tour to learn how to use the app?</p>
                <div className="flex justify-center gap-3">
                    <button onClick={() => { localStorage.setItem('hasSeenTour', 'true'); setShowHelp(false); }} className="px-4 py-2 bg-slate-200 rounded-lg">No, I'm good</button>
                    <button onClick={startTour} className="px-4 py-2 bg-sky-500 text-white rounded-lg">Yes, show me!</button>
                </div>
            </div>
        </div>
      )}

      {tourStep > 0 && <TourTooltip tourStep={tourStep} prevStep={prevTourStep} nextStep={nextTourStep} endTour={endTour} refs={tourRefs} />}

      <div ref={tourRefs.modeToggleRef} className="flex items-center sticky top-2 z-10 bg-slate-50 py-1">
        <div className="flex-1 flex items-center bg-slate-200 rounded-full p-1">
            <button onClick={() => setMode("scope")} className={`w-1/2 rounded-full py-2 text-sm font-semibold transition-all ${mode === "scope" ? "bg-white shadow" : ""}`}>Scope</button>
            <button onClick={() => setMode("pack-out")} className={`w-1/2 rounded-full py-2 text-sm font-semibold transition-all ${mode === "pack-out" ? "bg-white shadow" : ""}`}>Pack-out</button>
        </div>
        <button onClick={() => setShowSdsDoc(true)} className="ml-2 p-2 text-slate-500 bg-white border border-slate-200 rounded-full font-semibold hover:bg-slate-100" title="Generate SDS Document">
          <FilePenLine size={20}/>
        </button>
        <button onClick={() => setShowHelp(true)} className="ml-2 p-2 text-slate-500 bg-white border border-slate-200 rounded-full font-semibold hover:bg-slate-100"><Info size={20}/></button>
        <button onClick={() => setShowClearConfirm(true)} className="ml-2 p-2 bg-rose-500 text-white rounded-full font-semibold hover:bg-rose-600"><Trash2 size={20} /></button>
      </div>
      
      {mode === 'scope' && (
        <>
            <div ref={tourRefs.initialInstructionsRef} className={`border rounded-2xl overflow-hidden shadow-sm bg-white transition-all duration-300 ${initialInstructionsBorderClass}`}>
                <button className="w-full flex items-center justify-between px-3 py-2" onClick={() => setOpenInitialInstructions(v => !v)}>
                    <div className="font-bold text-lg">1. Initial Instructions</div>
                    <span className={`opacity-60 transition-transform ${openInitialInstructions ? "rotate-180" : ""}`}><ChevronDown/></span>
                </button>
                {openInitialInstructions && (
                    <div className="p-3 border-t space-y-4">
                        <div className="space-y-2 p-2 border rounded-lg">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-slate-600">Instructions (synced with Schedule)</label>
                                <span className="text-[10px] text-slate-400">Auto-linked</span>
                            </div>
                            <textarea
                                value={eventInstructionDraft}
                                onChange={(e) => handleEventInstructionChange(e.target.value)}
                                placeholder="Enter instructions here..."
                                className="w-full min-h-[80px] border rounded-lg p-2 text-sm bg-white"
                            />
                            <div className="text-[10px] text-slate-400">Edits here update the Schedule Event Instructions.</div>
                        </div>
                        {initialInstructions.map((inst, index) => (
                            <div key={inst.id} className="space-y-2 p-2 border rounded-lg relative">
                                {initialInstructions.length > 1 && (
                                    <button 
                                        onClick={() => removeInstruction(inst.id)} 
                                        className="absolute top-1 right-1 p-1 text-slate-400 hover:text-red-600 rounded-full"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                                <div className="flex items-center gap-2">
                                    <label className="w-32 text-sm font-semibold">Contact:</label>
                                     <select
                                        value={ORDER_CONTACTS.find(c => c.name === inst.person)?.id || ''}
                                        onChange={(e) => handleInstructionChange(inst.id, 'contact', e.target.value)}
                                        className="flex-1 border rounded-lg px-2 py-1 text-sm bg-white"
                                    >
                                        <option value="">Select a Contact</option>
                                        {ORDER_CONTACTS.map(contact => (
                                            <option key={contact.id} value={contact.id}>
                                                {contact.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="w-32 text-sm font-semibold">Role:</label>
                                    <input 
                                        type="text" 
                                        value={inst.role} 
                                        readOnly
                                        className="flex-1 border rounded-lg px-2 py-1 text-sm bg-slate-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Instructions:</label>
                                    <textarea
                                        value={inst.instruction}
                                        onChange={(e) => handleInstructionChange(inst.id, 'instruction', e.target.value)}
                                        placeholder="Enter instructions here..."
                                        className="w-full h-20 border rounded-lg p-2 text-sm"
                                    />
                                </div>
                            </div>
                        ))}
                        <button onClick={addInstruction} className="w-full text-sm font-semibold text-sky-600 py-2 rounded-lg hover:bg-blue-50">
                            + Add Instruction
                        </button>
                        {instructionAgreement !== 'disagree' ? (
                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <button 
                                    onClick={() => setInstructionAgreement('disagree')}
                                    className="px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700"
                                >
                                    Disagree
                                </button>
                                <button 
                                    onClick={() => {
                                        setInstructionAgreement('agree');
                                        setOpenInitialInstructions(false);
                                    }}
                                    className="px-4 py-2 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    Agree
                                </button>
                            </div>
                        ) : (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-center gap-2 text-red-700">
                                    <AlertTriangle size={20} />
                                    <h4 className="font-semibold">Please explain your concerns</h4>
                                </div>
                                <p className="text-xs text-red-600 mt-1 mb-2">Please alert sales rep to address your concerns before proceeding.</p>
                                <textarea
                                    value={disagreementNote}
                                    onChange={(e) => setDisagreementNote(e.target.value)}
                                    placeholder="Describe the issue..."
                                    className="w-full h-20 border rounded-lg p-2 text-sm border-red-300 focus:ring-red-500 focus:border-red-500"
                                />
                                <button 
                                    onClick={() => {
                                        setOpenInitialInstructions(false);
                                    }}
                                    className="w-full mt-2 bg-slate-200 text-slate-800 font-semibold py-2 rounded-lg hover:bg-slate-300 text-sm"
                                >
                                    Done
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div ref={tourRefs.servicesRef}>
                <ServiceSelector 
                    open={openServiceOfferings}
                    onToggle={setOpenServiceOfferings}
                    selectedServices={selectedServices}
                    setSelectedServices={setServicesAndSync}
                    textileFilters={textileFilters}
                    setTextileFilters={setTextileFilters}
                    isComplete={servicesComplete}
                />
            </div>
            <div ref={tourRefs.anticipatedGroupsRef}>
                <AnticipatedGroups
                    open={openAnticipatedGroups}
                    onToggle={setOpenAnticipatedGroups}
                    anticipatedGroups={anticipatedGroups}
                    setAnticipatedGroups={setGroupsAndSync}
                    isComplete={groupsComplete}
                />
            </div>
            <div ref={tourRefs.floorsRef} className={`border rounded-2xl overflow-hidden shadow-sm bg-white transition-all duration-300 ${floorsComplete && !openFloors ? 'border-green-500 border-2' : 'border-slate-200'}`}>
                <button className="w-full flex items-center justify-between px-3 py-2" onClick={() => setOpenFloors(v => !v)}>
                    <div className="font-bold text-lg">4. Floors</div>
                    <span className={`opacity-60 transition-transform ${openFloors ? "rotate-180" : ""}`}><ChevronDown/></span>
                </button>
                {!openFloors && floorsComplete && projectFloors.length > 0 && (
                    <div className="px-3 pb-3 pt-1 border-t border-slate-200">
                        <div className="flex flex-wrap gap-1">
                            {projectFloors.map(floor => (
                                <span key={floor} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full">
                                    {floor}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
                {openFloors && (
                    <div className="p-3 border-t space-y-4">
                        <div>
                            <h4 className="font-semibold text-sm mb-2 text-slate-600">Standard Floors</h4>
                            <div className="flex flex-wrap gap-2">
                                {['Basement', 'Floor 1', 'Floor 2', 'Floor 3', 'Attic'].map(f => <button key={f} onClick={() => toggleFloor(f)} className={`px-3 py-1 text-sm rounded-full border font-semibold ${projectFloors.includes(f) ? 'bg-sky-500 text-white' : 'bg-white'}`}>{f}</button>)}
                            </div>
                        </div>
                        <div>
                             <h4 className="font-semibold text-sm mb-2 text-slate-600">Apartment:</h4>
                             <div className="flex flex-wrap gap-2">
                                {['Studio', 'Duplex', 'Triplex'].map(f => <button key={f} onClick={() => toggleFloor(f)} className={`px-3 py-1 text-sm rounded-full border font-semibold ${projectFloors.includes(f) ? 'bg-sky-500 text-white' : 'bg-white'}`}>{f}</button>)}
                            </div>
                        </div>
                        <div>
                             <h4 className="font-semibold text-sm mb-2 text-slate-600">Pre-bagged</h4>
                             <div className="flex flex-wrap gap-2">
                                {['Pre-Bagged Offsite', 'Pre-Bagged Inhome'].map(f => <button key={f} onClick={() => toggleFloor(f)} className={`px-3 py-1 text-sm rounded-full border font-semibold ${projectFloors.includes(f) ? 'bg-sky-500 text-white' : 'bg-white'}`}>{f}</button>)}
                            </div>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); addNumericFloor();}} className="flex gap-2 items-center pt-3 border-t">
                            <input type="number" value={newFloorNumber} onChange={e => setNewFloorNumber(e.target.value)} placeholder="Add # of floors" className="flex-grow border rounded-lg px-3 py-2 text-sm w-24" />
                            <button type="submit" className="bg-sky-500 text-white font-semibold px-4 py-2 rounded-lg text-sm">Add</button>
                        </form>
                         <button onClick={() => setOpenFloors(false)} className="w-full mt-2 bg-slate-200 text-slate-800 font-semibold py-2 rounded-lg hover:bg-slate-300 text-sm">Done</button>
                    </div>
                )}
            </div>
            <div ref={tourRefs.roomsRef} className={`border rounded-2xl overflow-hidden shadow-sm bg-white transition-all duration-300 ${roomsComplete && !openAddRooms ? 'border-green-500 border-2' : 'border-slate-200'}`}>
                <div className="w-full flex items-center justify-between px-3 py-2">
                    <button className="font-bold text-lg flex-1 text-left" onClick={() => setOpenAddRooms(v => !v)}>5. Rooms</button>
                     {rooms.length > 0 && <div ref={tourRefs.selectRef} className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <button onClick={handleSelectRooms} className={`px-3 py-1 text-sm rounded-full border font-semibold ${isSelectionMode ? 'bg-red-600 text-white' : 'bg-white'}`}>{isSelectionMode ? 'Cancel' : 'Select Room(s)'}</button>
                        <button onClick={handleSelectAll} className={`px-3 py-1 text-sm rounded-full border font-semibold ${isSelectionMode && selectedIds.length === rooms.length && rooms.length > 0 ? 'bg-orange-500 text-white' : 'bg-white'}`}>Select All</button>
                    </div>}
                    <button className="pl-2" onClick={() => setOpenAddRooms(v => !v)}><span className={`opacity-60 transition-transform ${openAddRooms ? "rotate-180" : ""}`}><ChevronDown/></span></button>
                </div>
                {openAddRooms && (
                    <div className="p-3 border-t space-y-3">
                        <div className="space-y-2 border-b pb-4 mb-4">
                            <h4 className="font-semibold text-sm">Bulk Add Bedrooms</h4>
                            <div className="flex gap-2 items-center">
                                <input type="number" value={numBedrooms} onChange={handleNumBedroomsChange} placeholder="# Bedrooms" className="border rounded-lg px-3 py-2 text-sm w-32" />
                                <button onClick={handleAddBedrooms} disabled={bedroomNames.length === 0} className="bg-sky-500 text-white font-semibold px-4 py-2 rounded-lg text-sm disabled:bg-gray-400">
                                    Add Bedrooms to Lists
                                </button>
                            </div>
                            {bedroomNames.length > 0 && (
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {bedroomNames.map((name, index) => (
                                        <input key={index} type="text" value={name} onChange={(e) => handleBedroomNameChange(index, e.target.value)} className="border rounded-lg px-3 py-2 text-sm" />
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 flex-wrap"><button onClick={() => setShowFromListSelection({open: true, floor: projectFloors.find(f => f.startsWith('Floor')) || 'Floor 1'})} className="rounded-full border-2 border-green-500 bg-white px-3 py-1 text-sm">From List</button><button onClick={() => handleQuickAdd("Home")} className="rounded-full border bg-white px-3 py-1 text-sm">Home</button></div>
                            <form onSubmit={e => { e.preventDefault(); addSingleRoom(newRoomName, undefined, true); setNewRoomName(""); }} className="flex gap-2"><input type="text" value={newRoomName} onChange={e => setNewRoomName(e.target.value)} placeholder="Add custom room" className="flex-grow border rounded-lg px-3 py-2 text-sm" /><button type="submit" disabled={!newRoomName.trim()} className="bg-sky-500 text-white font-semibold px-4 py-2 rounded-lg text-sm disabled:bg-gray-400">Add</button></form>
                        </div>
                        <button onClick={() => setOpenAddRooms(false)} className="w-full mt-2 bg-slate-200 text-slate-800 font-semibold py-2 rounded-lg hover:bg-slate-300 text-sm">Done</button>
                    </div>
                )}
            </div>
        </>
      )}
      
      {mode === 'pack-out' && (
        <>
            {viewAsList ? (
                <InstructionsList 
                    rooms={visibleRooms} 
                    selectedServices={selectedServices}
                    anticipatedGroups={anticipatedGroups}
                    showOnlyRoomsWithTasks={showOnlyRoomsWithTasks}
                    onShowOnlyRoomsWithTasksChange={setShowOnlyRoomsWithTasks}
                    onToggleView={() => setViewAsList(v => !v)}
                    onHideDoneButtonChange={setHideDoneButton}
                    hideDoneButton={hideDoneButton}
                    viewAsList={viewAsList}
                    initialInstructions={initialInstructions}
                    instructionAgreement={instructionAgreement}
                    disagreementNote={disagreementNote}
                    eventInstructions={eventInstructionDraft}
                />
            ) : (
                <>
                <div className="flex justify-between items-center p-3 border rounded-2xl shadow-sm flex-wrap gap-2 bg-white">
                    <div className="relative">
                        <button onClick={() => setShowPackoutSettings(v => !v)} className="p-2 text-sm font-semibold bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300">
                            <Settings size={18}/>
                        </button>
                        {showPackoutSettings && (
                             <div ref={settingsRef} className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border p-2 space-y-2">
                                 <button onClick={() => { setViewAsList(v => !v); setShowPackoutSettings(false); }} className="w-full text-left p-2 text-sm hover:bg-slate-100 rounded-md">{viewAsList ? 'Show Card View' : 'Show List View'}</button>
                                 <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer p-2 hover:bg-slate-100 rounded-md">
                                    <Checkbox checked={!hideDoneButton} onCheckedChange={(checked) => setHideDoneButton(!checked)} />
                                    Show 'Done' button
                                </label>
                            </div>
                        )}
                    </div>
                    {!hideDoneButton && <button onClick={() => setShowDoneConfirm(true)} className="px-4 py-2 text-sm font-semibold bg-sky-500 text-white rounded-lg hover:bg-sky-600">Done with Pack-out</button>}
                </div>
                <div className="space-y-3">{visibleRooms.map((room, index) => <div ref={index === 0 ? tourRefs.firstRoomRef : null} key={room.id}><RoomCard room={room} isSelectionMode={isSelectionMode} isSelected={selectedIds.includes(room.id)} onSelect={() => setSelectedIds(p => p.includes(room.id) ? p.filter(id => id !== room.id) : [...p, room.id])} onToggleSection={toggleRoomSection} onSetField={setRoomField} onToggleSeverity={toggleSeverity} onToggleInline={toggleInline} mode={mode} dynamicItemOptions={dynamicItemOptions} onSetTaskStatus={setTaskStatus} onSetTaskReason={setTaskReason} onDeleteTask={deleteTask} onAddTask={addTask} onDeleteRequest={setDeletingRoomId} selectedIds={selectedIds} onChangeNote={openChangeNoteModal} newlyAddedRoomId={newlyAddedRoomId} onSetTaskQuantity={setTaskQuantity} tourRefs={tourRefs} rooms={rooms}/></div>)}</div>
                </>
            )}
        </>
      )}


      {isSelectionMode && <div ref={bulkEditCardRef}><RoomCard room={allModel} rooms={rooms} projectFloors={projectFloors} selectedIds={selectedIds} onSetField={setRoomField} onToggleSection={toggleRoomSection} onToggleSeverity={toggleSeverity} onToggleInline={toggleInline} isSelectionMode={true} onApplyChanges={applyBulkChanges} bulkDirty={bulkDirty} onSetTaskReason={setTaskReason} onAddTask={addTask} onDeleteTask={deleteTask} onChangeNote={openChangeNoteModal} onSetTaskQuantity={setTaskQuantity} dynamicItemOptions={dynamicItemOptions}/></div>}

      {mode === 'scope' && <div ref={roomListContainerRef} className="space-y-3">{visibleRooms.map((room, index) => <div ref={index === 0 ? tourRefs.firstRoomRef : null} key={room.id}><RoomCard room={room} rooms={rooms} isSelectionMode={isSelectionMode} isSelected={selectedIds.includes(room.id)} onSelect={() => setSelectedIds(p => p.includes(room.id) ? p.filter(id => id !== room.id) : [...p, room.id])} onToggleSection={toggleRoomSection} onSetField={setRoomField} onToggleSeverity={toggleSeverity} onToggleInline={toggleInline} mode={mode} dynamicItemOptions={dynamicItemOptions} onSetTaskStatus={setTaskStatus} onSetTaskReason={setTaskReason} onDeleteTask={deleteTask} onAddTask={addTask} onDeleteRequest={setDeletingRoomId} selectedIds={selectedIds} onChangeNote={openChangeNoteModal} newlyAddedRoomId={newlyAddedRoomId} onSetTaskQuantity={setTaskQuantity} tourRefs={tourRefs} /></div>)}</div>}

      {deletingRoomId && <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100]"><div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm"><div className="flex items-center gap-3"><AlertTriangle className="text-red-500" size={32}/><h3 className="text-lg font-bold">Delete Room?</h3></div><p className="text-sm text-slate-600 my-4">Are you sure you want to delete this room? This action cannot be undone.</p><div className="flex justify-end gap-2"><button onClick={() => setDeletingRoomId(null)} className="px-4 py-2 bg-slate-200 rounded-lg">Cancel</button><button onClick={() => handleDeleteRoom(deletingRoomId)} className="px-4 py-2 bg-red-600 text-white rounded-lg">Confirm Delete</button></div></div></div>}
      {showClearConfirm && <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100]"><div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm"><div className="flex items-center gap-3"><AlertTriangle className="text-red-500" size={32}/><h3 className="text-lg font-bold">Clear All Data?</h3></div><p className="text-sm text-slate-600 my-4">This will remove all rooms and reset the form. This action cannot be undone.</p><div className="flex justify-end gap-2"><button onClick={() => setShowClearConfirm(false)} className="px-4 py-2 bg-slate-200 rounded-lg">Cancel</button><button onClick={handleClearAll} className="px-4 py-2 bg-red-600 text-white rounded-lg">Confirm Clear</button></div></div></div>}
      {showConfirmation.open && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]"><div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm"><h3 className="text-lg font-bold mb-4">Add {showConfirmation.type} Rooms</h3><div className="grid grid-cols-2 gap-2 mb-6">{(showConfirmation.type === 'Home' ? masterRoomList : apartmentRoomList).map(r => <button key={r} onClick={() => toggleQuickAddRoom(r)} className={`px-2 py-1 text-sm rounded-lg border ${showConfirmation.selection.includes(r) ? 'bg-sky-500 text-white' : 'bg-slate-100'}`}>{r}</button>)}</div><div className="flex justify-end gap-2"><button onClick={() => setShowConfirmation({ open: false, type: null, selection: [] })} className="px-4 py-2 bg-slate-200 rounded-lg">Cancel</button><button onClick={handleQuickAddConfirm} className="px-4 py-2 bg-sky-500 text-white rounded-lg">Add</button></div></div></div>}
      {showFromListSelection.open && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]"><div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm"><h3 className="text-lg font-bold mb-4">Add Rooms to a Floor</h3><div className="flex justify-center gap-1 mb-4 bg-slate-200 p-1 rounded-full">{projectFloors.length > 0 ? projectFloors.filter(f => f !== 'Duplex' && f !== 'Triplex').map(f => <button key={f} onClick={() => setShowFromListSelection(p => ({...p, floor: f}))} className={`px-3 py-1 text-xs font-semibold rounded-full ${showFromListSelection.floor === f ? 'bg-white shadow' : ''}`}>{f}</button>) : <button onClick={() => {setShowFromListSelection({open: false, floor: 'Floor 1'}); setOpenFloors(true);}} className="text-sm bg-sky-100 text-sky-700 font-semibold px-4 py-2 rounded-lg">Add Floors to Project First</button>}</div><div className="max-h-60 overflow-y-auto grid grid-cols-2 gap-2 mb-6 pr-2">{availableRoomsFromMaster.map(r => <button key={r} onClick={() => setSelectedFromList(p => p.includes(r) ? p.filter(i => i !== r) : [...p, r])} className={`px-3 py-2 text-sm rounded-lg border font-semibold ${selectedFromList.includes(r) ? 'bg-sky-500 text-white border-blue-700' : 'bg-slate-100 hover:bg-slate-200'}`}>{r}</button>)}</div><div className="flex justify-end gap-2"><button onClick={() => setShowFromListSelection({open: false, floor: 'Floor 1'})} className="px-4 py-2 bg-slate-200 rounded-lg">Cancel</button><button onClick={addFromListRooms} className="px-4 py-2 bg-sky-500 text-white rounded-lg">Add</button></div></div></div>}
      {editingTask && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]"><div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm"><h3 className="text-lg font-bold mb-4">Select Reason</h3><div className="flex flex-col gap-2 max-h-60 overflow-y-auto">{TASK_REASONS.map(reason => <button key={reason} onClick={() => {const {roomId, taskId} = editingTask; setRooms(prev => prev.map(r => r.id === roomId ? { ...r, tasks: r.tasks.map(t => t.id === taskId ? { ...t, reason } : t) } : r)); setEditingTask(null);}} className="w-full text-left p-2 hover:bg-slate-100 rounded-lg">{reason}</button>)}</div><button onClick={() => setEditingTask(null)} className="mt-4 w-full px-4 py-2 bg-slate-200 rounded-lg">Cancel</button></div></div>}
      {changingTask && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]"><div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm"><h3 className="text-lg font-bold mb-4">Add Change Note</h3><div className="flex flex-col gap-2 max-h-60 overflow-y-auto">{CHANGE_REASONS.map(reason => <button key={reason} onClick={() => handleSetChangeNote(reason)} className="w-full text-left p-2 hover:bg-slate-100 rounded-lg">{reason}</button>)}</div><form onSubmit={e => { e.preventDefault(); handleSetChangeNote(changeNote); }} className="flex gap-2 mt-4"><input type="text" placeholder="Or type custom note" value={changeNote} onChange={e => setChangeNote(e.target.value)} className="w-full border rounded-lg px-3 py-1.5 text-sm" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSetChangeNote(changeNote); }}} /><button type="submit" className="bg-sky-500 text-white font-semibold px-4 py-2 rounded-lg text-sm">Save</button></form><button onClick={() => setChangingTask(null)} className="mt-4 w-full px-4 py-2 bg-slate-200 rounded-lg">Cancel</button></div></div>}
      {showDoneConfirm && <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100]"><div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm">{ totalTasks === 0 ? (
            <>
             <div className="flex items-center gap-3"><AlertTriangle className="text-orange-500" size={32}/><h3 className="text-lg font-bold">No Tasks</h3></div>
             <p className="text-sm text-slate-600 my-4">There are no tasks entered in the scope. Please switch to Scope mode to add tasks.</p>
              <div className="flex justify-end gap-2 mt-4">
                  <button onClick={() => setShowDoneConfirm(false)} className="px-4 py-2 bg-sky-500 text-white rounded-lg">OK</button>
              </div>
            </>
      ) : undoneTasks.length > 0 ? (
        <>
          <div className="flex items-center gap-3"><AlertTriangle className="text-orange-500" size={32}/><h3 className="text-lg font-bold">Undone Tasks Found</h3></div>
          <p className="text-sm text-slate-600 my-4">There are {undoneTasks.length} task(s) not marked as Done or Changed:</p>
          <div className="max-h-40 overflow-y-auto space-y-1 text-sm bg-slate-100 p-2 rounded-lg">
              {undoneTasks.map(task => <div key={task.id}><strong>{task.roomName}:</strong> {task.label}</div>)}
          </div>
           <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowDoneConfirm(false)} className="px-4 py-2 bg-slate-200 rounded-lg">Go Back</button>
              <button onClick={() => {alert('Tasks moved!'); setShowDoneConfirm(false)}} className="px-4 py-2 bg-sky-500 text-white rounded-lg">Move to Next Pack-out</button>
          </div>
        </>
      ) : (
            <>
             <div className="flex items-center gap-3"><CheckCircle2 className="text-green-500" size={32}/><h3 className="text-lg font-bold">All Tasks Complete!</h3></div>
             <p className="text-sm text-slate-600 my-4">Great job! All tasks have been marked as Done or Changed.</p>
              <div className="flex justify-end gap-2 mt-4">
                  <button onClick={() => setShowDoneConfirm(false)} className="px-4 py-2 bg-sky-500 text-white rounded-lg">OK</button>
              </div>
            </>
      )}</div></div>}

      {showSdsSetup && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-sky-500 px-6 py-4 flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-white">Select Services for SDS PDF</div>
                <div className="text-sm text-sky-100">Choose which services should appear on the printout.</div>
              </div>
              <button className="text-white/80 hover:text-white text-2xl font-bold leading-none" onClick={() => setShowSdsSetup(false)}>×</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SDS_SERVICE_OPTIONS.map(opt => {
                  const active = sdsSelectedServices.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSdsSelectedServices(prev => prev.includes(opt.id) ? prev.filter(id => id !== opt.id) : [...prev, opt.id])}
                      className={`rounded-xl border px-3 py-3 text-left transition-all ${active ? "border-sky-400 bg-sky-50" : "border-slate-200 hover:border-sky-200"}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg border border-slate-200 bg-white flex items-center justify-center overflow-hidden">
                          <img src={opt.icon} alt={opt.id} className="h-10 w-10 object-contain" />
                        </div>
                        <div className="text-sm font-semibold text-slate-700">{opt.id}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowSdsSetup(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                <button
                  onClick={() => { setShowSdsSetup(false); setShowSdsDoc(true); }}
                  className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600"
                >
                  Open SDS PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSdsDoc && (
        <SdsDocument
          lossSeverity={lossSeverity}
          onChange={onLossSeverityChange}
          onClose={() => setShowSdsDoc(false)}
          rooms={rooms}
          orderTypes={orderTypes}
          severityCodes={severityCodes}
          claimNumber={claimNumber}
          address={addressLabel}
          selectedServices={sdsSelectedServices}
          customers={customers}
          familyMedicalIssues={familyMedicalIssues}
          soapFragAllergies={soapFragAllergies}
          sdsConsiderations={sdsConsiderations}
          sdsObservations={sdsObservations}
          sdsServices={sdsServices}
        />
      )}
    </div>
    </div>
  );
}
