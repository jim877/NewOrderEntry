// @ts-nocheck
import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
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

    const instructionLines = (eventInstructions || "")
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean)
        .filter(line => !/^Service Offerings\s*:/i.test(line));

        if (instructionLines.length > 0) {
            instructionLines.forEach(line => {
                text += `- ${line}\n`;
            });
            text += "\n";
        } else {
            text += "None\n\n";
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
                    {eventInstructions && eventInstructions.trim().length > 0 ? (
                        <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
                            {eventInstructions
                                .split("\n")
                                .map(line => line.trim())
                                .filter(Boolean)
                                .map((line, idx) => {
                                    const parts = line.split(":");
                                    if (parts.length > 1) {
                                        const label = parts.shift();
                                        const rest = parts.join(":").trim();
                                        return (
                                            <li key={`${line}-${idx}`}>
                                                <span className="font-semibold">{label.trim()}:</span> {rest}
                                            </li>
                                        );
                                    }
                                    return <li key={`${line}-${idx}`}>{line}</li>;
                                })}
                        </ul>
                    ) : (
                        <p className="text-xs text-slate-500">No event instructions yet.</p>
                    )}
                    
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
        { id: 2, ref: refs.initialInstructionsRef, text: 'Use this section to review and edit the event instructions synced from the schedule.' },
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
const parseRoomList = (value = "") =>
  value
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);
const ROOM_MASTER_DEFAULTS = ["Kitchen", "Living", "Master", "Bathroom", "Bedroom 2", "Bedroom 3", "Basement", "Attic", "Dining", "Coat", "Family"];
const APARTMENT_ROOMS_DEFAULTS = ["Kitchen", "Living", "Master", "Bathroom", "Entrance", "Dining", "Coat", "M-Bath"];
const SEVERITY_GROUPS = ["Fire", "Water", "Mold", "Dust", "Protein", "Oil"];
const SEVERITY_LEVELS = ["1", "2", "3", "5"];
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

const newRoom = (name, floor = "") => ({ id: uid(), name, floorLabel: /basement|attic/i.test(name) ? name : floor, photos: [], severitySelections: [], roomSeverityCodes: [], odorLevel: "", tasks: [], affected: null, hasCleaning: null, packOut: null, leaveOnsite: null, details: { packOut: { locations: { include: [], exclude: [] }, items: { include: [], exclude: [] } }, leaveOnsite: { locations: { include: [], exclude: [] }, items: { include: [], exclude: [] } } }, ui: { openRoom: false, openStatus: false, openNotes: true, openTasks: true, openCleanQ: false, openPackQ: false, openLeaveQ: false }, completedSections: {} });
const buildAllProxy = () => ({ ...newRoom("Apply to Selected Room(s)"), id: "ALL", ui: { openRoom: true, openStatus: false, openNotes: false, openTasks: false, openCleanQ: false, openPackQ: false, openLeaveQ: false } });

// --- Room Card Component ---

const RoomCard = ({ room, rooms, isSelectionMode, isSelected, onSelect, onToggleSection, onSetField, onToggleSeverity, onToggleInline, onToggleRoomSeverity, orderSeverityCodes, mode, dynamicItemOptions, onSetTaskStatus, onSetTaskReason, onDeleteTask, onAddTask, onApplyChanges, bulkDirty, onDeleteRequest, selectedIds, onChangeNote, newlyAddedRoomId, onSetTaskQuantity, tourRefs }) => {
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
    const effectiveRoomSeverityCodes = (room.roomSeverityCodes && room.roomSeverityCodes.length)
      ? room.roomSeverityCodes
      : (orderSeverityCodes || []);
    const severityGroups = Object.keys((orderSeverityCodes || []).reduce((acc, code) => {
      const [group] = String(code || "").split("-");
      if (group) acc[group] = true;
      return acc;
    }, {}));
    
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
                  {room.id !== 'ALL' && mode === 'scope' && (
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500" onClick={(e) => e.stopPropagation()}>
                      <span className="font-semibold">Odor</span>
                      <select
                        value={room.odorLevel || ""}
                        onChange={(e) => onSetField(room.id, "odorLevel", e.target.value)}
                        className="border border-slate-200 rounded-md bg-white px-1.5 py-0.5 text-[11px]"
                      >
                        <option value="">—</option>
                        <option value="0">0</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                      </select>
                    </div>
                  )}
                  {effectiveRoomSeverityCodes.length > 0 && (
                    <div className="mt-1 text-[11px] text-slate-500">
                      Severity: <span className="font-semibold">{effectiveRoomSeverityCodes.join(", ")}</span>
                    </div>
                  )}
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
                        <div className="space-y-3">
                            <div className="flex flex-wrap gap-1">
                              {SEVERITY_OPTIONS.map(s => (
                                <button key={s} onClick={() => onToggleSeverity(room.id, s)} className={`px-2 py-0.5 text-xs rounded-full border ${room.severitySelections.includes(s) ? "bg-sky-500 text-white" : "bg-white"}`}>{s}</button>
                              ))}
                            </div>
                            {severityGroups.length > 0 && (
                              <div className="space-y-2">
                                <div className="text-xs font-semibold text-slate-500">Room Severity (from Order)</div>
                                <div className="grid gap-2 sm:grid-cols-2">
                                  {severityGroups.map(group => (
                                    <div key={group} className="flex items-center gap-2">
                                      <span className="w-14 text-xs font-semibold text-slate-600">{group}</span>
                                      <div className="flex gap-2">
                                        {SEVERITY_LEVELS.map(level => {
                                          const code = `${group}-${level}`;
                                          const isActive = effectiveRoomSeverityCodes.includes(code);
                                          return (
                                            <button
                                              key={level}
                                              type="button"
                                              onClick={() => onToggleRoomSeverity(room.id, code)}
                                              className={`h-8 w-8 rounded-lg text-xs font-bold transition-all border ${isActive ? 'bg-sky-500 border-sky-700 text-white shadow' : 'bg-slate-100 border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-200'}`}
                                            >
                                              {level}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div className="text-[11px] text-slate-400">Defaults from Order severity. Click to override per room.</div>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <label className="text-xs font-semibold text-slate-600">Odor Level</label>
                              <select
                                value={room.odorLevel || ""}
                                onChange={(e) => onSetField(room.id, "odorLevel", e.target.value)}
                                className="border rounded-lg px-2 py-1 text-xs bg-white"
                              >
                                <option value="">Select</option>
                                <option value="0">0</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                              </select>
                            </div>
                        </div>
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
export default function SameDayScope({ onExit, eventInstructions, onEventInstructionsChange, serviceOfferings, onServiceOfferingsChange, suggestedGroups, onSuggestedGroupsChange, lossSeverity, onLossSeverityChange, orderTypes = [], severityCodes = [], orderName = "", claimNumber = "", insuranceCompany = "", insuranceAdjuster = "", dateOfLoss = "", addressLabel = "", customers = [], familyMedicalIssues = "", soapFragAllergies = "", sdsConsiderations = [], sdsObservations = [], sdsServices = [], sdsRooms = [], onSdsRoomsChange, sdsProjectFloors = [], onSdsProjectFloorsChange, sdsApartmentType = "", onSdsApartmentTypeChange, sdsPrebagged = "", onSdsPrebaggedChange, sdsInitialInstructions = [], onSdsInitialInstructionsChange, sdsInstructionAgreement = null, onSdsInstructionAgreementChange, sdsDisagreementNote = "", onSdsDisagreementNoteChange }) {
  const [rooms, setRooms] = useState(Array.isArray(sdsRooms) ? sdsRooms : []);
  const [mode, setMode] = useState("scope");
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [allModel, setAllModel] = useState(buildAllProxy());
  const [bulkDirty, setBulkDirty] = useState(false);
  const [openAddRooms, setOpenAddRooms] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState({ open: false, type: null, selection: [] });
  const [showFromListSelection, setShowFromListSelection] = useState({open: false, floor: 'Floor 1'});
  const [selectedFromList, setSelectedFromList] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [changingTask, setChangingTask] = useState(null);
  const [changeNote, setChangeNote] = useState("");
  const [selectedServices, setSelectedServices] = useState(serviceOfferings || []);
  const [eventInstructionDraft, setEventInstructionDraft] = useState(eventInstructions || "");
  const [editInstructions, setEditInstructions] = useState(false);
  const [freeFormDraft, setFreeFormDraft] = useState("");
  const [openServiceOfferings, setOpenServiceOfferings] = useState(false);
  const [anticipatedGroups, setAnticipatedGroups] = useState(ANTICIPATED_GROUPS.reduce((acc, group) => ({...acc, [group]: {selected: false, note: ''}}), {}));
  const [openAnticipatedGroups, setOpenAnticipatedGroups] = useState(false);
  const [textileFilters, setTextileFilters] = useState(SERVICE_OFFERINGS['Textiles']);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [deletingRoomId, setDeletingRoomId] = useState(null);
  const [projectFloors, setProjectFloors] = useState(Array.isArray(sdsProjectFloors) ? sdsProjectFloors : []);
  const [openFloors, setOpenFloors] = useState(false);
  const [newFloorNumber, setNewFloorNumber] = useState("");
  const [showOnlyRoomsWithTasks, setShowOnlyRoomsWithTasks] = useState(false);
  const [showDoneConfirm, setShowDoneConfirm] = useState(false);
  const [newlyAddedRoomId, setNewlyAddedRoomId] = useState(null);
  const [masterRoomList, setMasterRoomList] = useState(ROOM_MASTER_DEFAULTS);
  const [apartmentRoomList, setApartmentRoomList] = useState(APARTMENT_ROOMS_DEFAULTS);
  const [viewAsList, setViewAsList] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showSdsDoc, setShowSdsDoc] = useState(false);
  const [showSdsSetup, setShowSdsSetup] = useState(false);
  const [sdsSelectedServices, setSdsSelectedServices] = useState([]);
  const [selectedRoomFloors, setSelectedRoomFloors] = useState([]);
  const [selectedRoomTemplates, setSelectedRoomTemplates] = useState([]);
  const [bedroomCountDraft, setBedroomCountDraft] = useState("");
  const [bathroomCountDraft, setBathroomCountDraft] = useState("");
  const [customRoomsDraft, setCustomRoomsDraft] = useState("");
  const [tourStep, setTourStep] = useState(0);
  const [isTourStarting, setIsTourStarting] = useState(false);
  const [initialInstructions, setInitialInstructions] = useState(
    Array.isArray(sdsInitialInstructions) && sdsInitialInstructions.length
      ? sdsInitialInstructions
      : [{ id: uid(), person: '', role: '', instruction: '' }]
  );
  const [openInitialInstructions, setOpenInitialInstructions] = useState(false);
  const [instructionAgreement, setInstructionAgreement] = useState(sdsInstructionAgreement ?? null);
  const [disagreementNote, setDisagreementNote] = useState(sdsDisagreementNote || '');
  const [hideDoneButton, setHideDoneButton] = useState(false);
  const [showPackoutSettings, setShowPackoutSettings] = useState(false);
  const [openApartmentOptions, setOpenApartmentOptions] = useState(false);
  const [openPrebaggedOptions, setOpenPrebaggedOptions] = useState(false);
  const [apartmentType, setApartmentType] = useState(sdsApartmentType || "");
  const [prebaggedType, setPrebaggedType] = useState(sdsPrebagged || "");
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
    { id: "Fold ASAP", icon: "/Gemini_Fold_AMAP.png" },
    { id: "Re-Hanging", icon: "/Gemini_Generated_Image_jnzpynjnzpynjnzp.png" },
    { id: "Drying", icon: "/Drying.jpg" },
    { id: "Total Loss Inventory", icon: "/Total_Loss_Inventory.jpg" },
    { id: "Content Manipulation", icon: "/Content_Manipulation.jpg" },
    { id: "High Density", icon: "/High_Density_Parking.jpg" },
    { id: "Expert Stain Removal", icon: "/Expert_Stain_Removal.jpg" }
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

  const roomsSyncRef = useRef("");
  const floorsSyncRef = useRef("");
  const instructionsSyncRef = useRef("");

  useEffect(() => {
    const serialized = JSON.stringify(Array.isArray(sdsRooms) ? sdsRooms : []);
    if (serialized !== roomsSyncRef.current) {
      roomsSyncRef.current = serialized;
      setRooms(Array.isArray(sdsRooms) ? sdsRooms : []);
    }
  }, [sdsRooms]);

  useEffect(() => {
    const serialized = JSON.stringify(rooms || []);
    if (serialized !== roomsSyncRef.current) {
      roomsSyncRef.current = serialized;
      onSdsRoomsChange?.(rooms);
    }
  }, [rooms, onSdsRoomsChange]);

  useEffect(() => {
    const serialized = JSON.stringify(Array.isArray(sdsProjectFloors) ? sdsProjectFloors : []);
    if (serialized !== floorsSyncRef.current) {
      floorsSyncRef.current = serialized;
      setProjectFloors(Array.isArray(sdsProjectFloors) ? sdsProjectFloors : []);
    }
  }, [sdsProjectFloors]);

  useEffect(() => {
    const serialized = JSON.stringify(projectFloors || []);
    if (serialized !== floorsSyncRef.current) {
      floorsSyncRef.current = serialized;
      onSdsProjectFloorsChange?.(projectFloors);
    }
  }, [projectFloors, onSdsProjectFloorsChange]);

  useEffect(() => {
    const serialized = JSON.stringify(Array.isArray(sdsInitialInstructions) ? sdsInitialInstructions : []);
    if (serialized !== instructionsSyncRef.current) {
      instructionsSyncRef.current = serialized;
      setInitialInstructions(Array.isArray(sdsInitialInstructions) && sdsInitialInstructions.length
        ? sdsInitialInstructions
        : [{ id: uid(), person: '', role: '', instruction: '' }]
      );
    }
  }, [sdsInitialInstructions]);

  useEffect(() => {
    const serialized = JSON.stringify(initialInstructions || []);
    if (serialized !== instructionsSyncRef.current) {
      instructionsSyncRef.current = serialized;
      onSdsInitialInstructionsChange?.(initialInstructions);
    }
  }, [initialInstructions, onSdsInitialInstructionsChange]);

  useEffect(() => {
    if (sdsInstructionAgreement !== undefined && sdsInstructionAgreement !== instructionAgreement) {
      setInstructionAgreement(sdsInstructionAgreement ?? null);
    }
  }, [sdsInstructionAgreement]);

  useEffect(() => {
    onSdsInstructionAgreementChange?.(instructionAgreement);
  }, [instructionAgreement, onSdsInstructionAgreementChange]);

  useEffect(() => {
    if (typeof sdsDisagreementNote === "string" && sdsDisagreementNote !== disagreementNote) {
      setDisagreementNote(sdsDisagreementNote);
    }
  }, [sdsDisagreementNote]);

  useEffect(() => {
    onSdsDisagreementNoteChange?.(disagreementNote);
  }, [disagreementNote, onSdsDisagreementNoteChange]);

  useEffect(() => {
    if (sdsApartmentType !== undefined && sdsApartmentType !== apartmentType) {
      setApartmentType(sdsApartmentType || "");
    }
  }, [sdsApartmentType]);

  useEffect(() => {
    onSdsApartmentTypeChange?.(apartmentType || "");
  }, [apartmentType, onSdsApartmentTypeChange]);

  useEffect(() => {
    if (sdsPrebagged !== undefined && sdsPrebagged !== prebaggedType) {
      setPrebaggedType(sdsPrebagged || "");
    }
  }, [sdsPrebagged]);

  useEffect(() => {
    onSdsPrebaggedChange?.(prebaggedType || "");
  }, [prebaggedType, onSdsPrebaggedChange]);

  useEffect(() => {
    if (!projectFloors.length) {
      setSelectedRoomFloors([]);
      return;
    }
    if (projectFloors.length === 1) {
      setSelectedRoomFloors([projectFloors[0]]);
      return;
    }
    setSelectedRoomFloors(prev => {
      if (!prev.length) return [];
      const next = prev.filter(f => projectFloors.includes(f));
      return next.length ? [next[0]] : [];
    });
  }, [projectFloors]);

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

  const AUTO_LABELS = useMemo(() => new Set([
    "Conditions",
    "Bring",
    "Load",
    "Items to load",
    "Service Offerings",
    "Quick Notes",
    "Estimate Required",
    "Estimate Requested",
    "Estimate",
  ]), []);

  const HIDDEN_AUTO_LABELS = useMemo(() => new Set([
    "Service Offerings"
  ]), []);

  const parseInstructionLines = useCallback((text) => {
    const lines = (text || "")
      .split("\n")
      .map(line => line.trim())
      .filter(Boolean);
    const autoAll = [];
    const autoDisplay = [];
    const free = [];
    lines.forEach((line) => {
      const parts = line.split(":");
      if (parts.length > 1) {
        const label = parts.shift().trim();
        const rest = parts.join(":").trim();
        if (AUTO_LABELS.has(label)) {
          const entry = { label, value: rest };
          autoAll.push(entry);
          if (!HIDDEN_AUTO_LABELS.has(label)) {
            autoDisplay.push(entry);
          }
          return;
        }
      }
      free.push(line);
    });
    return { autoAll, autoDisplay, freeText: free.join("\n") };
  }, [AUTO_LABELS, HIDDEN_AUTO_LABELS]);

  const { autoAll: autoInstructionLinesAll, autoDisplay: autoInstructionLines, freeText: parsedFreeText } = useMemo(
    () => parseInstructionLines(eventInstructionDraft),
    [eventInstructionDraft, parseInstructionLines]
  );

  useEffect(() => {
    setFreeFormDraft(parsedFreeText || "");
  }, [parsedFreeText]);

  const buildInstructionText = useCallback((autoLines, freeText) => {
    const autoStrings = (autoLines || [])
      .map(line => line.value ? `${line.label}: ${line.value}` : line.label)
      .filter(Boolean);
    const free = (freeText || "").trim();
    if (free) {
      return autoStrings.length ? `${autoStrings.join("\n")}\n\n${free}` : free;
    }
    return autoStrings.join("\n");
  }, []);

  const handleEventInstructionChange = (value) => {
    setEventInstructionDraft(value);
    onEventInstructionsChange?.(value);
  };

  const handleFreeFormChange = (value) => {
    setFreeFormDraft(value);
    const next = buildInstructionText(autoInstructionLinesAll, value);
    handleEventInstructionChange(next);
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

  const normalizeBaseLabel = (label) => {
      const lower = (label || "").toLowerCase();
      if (lower === "bath" || lower === "bathroom") return "Bath";
      if (lower === "bedroom") return "Bedroom";
      return null;
  };

  const stripFloorPrefix = (name) => (name || "").replace(/^\d+\.\s*/, "").trim();

  const roomBaseName = (name) => {
      const stripped = stripFloorPrefix(name);
      const lower = stripped.toLowerCase();
      if (lower.startsWith("bath")) return "Bath";
      if (lower.startsWith("bedroom")) return "Bedroom";
      return stripped;
  };

  const floorNumberForLabel = (floorLabel) => {
      const label = (floorLabel || "").toLowerCase();
      if (label.includes("basement")) return 0;
      const match = label.match(/(\d+)/);
      if (match) return Number(match[1]);
      if (label.includes("attic")) {
          const nums = (projectFloors || [])
            .map(f => (f || "").match(/(\d+)/))
            .filter(Boolean)
            .map(m => Number(m[1]))
            .filter(n => !Number.isNaN(n));
          const maxNum = nums.length ? Math.max(...nums) : 1;
          return maxNum + 1;
      }
      return 1;
  };

  const countExistingBase = (baseLabel, floorLabel) => {
      if (!baseLabel) return 0;
      return (rooms || []).filter(r => (r.floorLabel || "") === (floorLabel || ""))
        .map(r => roomBaseName(r.name))
        .filter(name => name.toLowerCase() === baseLabel.toLowerCase()).length;
  };

  const formatRoomNameForFloor = (rawName, floorLabel, baseCounts) => {
      const trimmed = rawName.trim();
      if (!trimmed) return trimmed;
      const baseLabel = normalizeBaseLabel(trimmed) || trimmed;
      const floorNumber = floorNumberForLabel(floorLabel);
      const currentCount = baseCounts?.[baseLabel] ?? countExistingBase(baseLabel, floorLabel);
      const nextCount = currentCount + 1;
      if (baseCounts) baseCounts[baseLabel] = nextCount;
      const suffix = (normalizeBaseLabel(trimmed) ? (nextCount > 1 ? ` ${nextCount}` : "") : "");
      return `${floorNumber}. ${baseLabel}${suffix}`;
  };

  const addSingleRoom = (name, floor, shouldOpen = false, shouldFocus = false) => {
      const trimmedName = name.trim();
      if (!trimmedName) return;
      const formattedName = formatRoomNameForFloor(trimmedName, floor);
      const newR = newRoom(formattedName, floor);
      newR.ui.openRoom = shouldOpen;
      setRooms(prev => {
        if (prev.some(r => r.name === formattedName)) {
            // If room exists but we need to ensure it's open for the tour
            if (shouldOpen) {
                return prev.map(r => r.name === formattedName ? {...r, ui: {...r.ui, openRoom: true}} : r);
            }
            return prev;
        }
        const newRooms = [...prev, newR];
        if(shouldFocus){
            setNewlyAddedRoomId(newR.id);
            setTimeout(() => setNewlyAddedRoomId(null), 2100);
        }
        return newRooms;
      });
      setMasterRoomList(prev => Array.from(new Set([...prev, trimmedName])));
  };

  
  const addMultipleRooms = (names, floor, { shouldFocus = true } = {}) => {
      let lastRoomId = null;
      setRooms(prev => {
        const baseCounts = {};
        prev
          .filter(r => (r.floorLabel || "") === (floor || ""))
          .forEach(r => {
            const base = roomBaseName(r.name);
            baseCounts[base] = (baseCounts[base] || 0) + 1;
          });
        const roomsToAdd = names
          .map(name => formatRoomNameForFloor(name, floor, baseCounts))
          .filter(name => name.trim() && !prev.some(r => r.name === name.trim()));
        if (roomsToAdd.length === 0) return prev;

        const newRooms = roomsToAdd.map(name => newRoom(name.trim(), floor));
        if (shouldFocus) {
          lastRoomId = newRooms[newRooms.length - 1].id;
        }
        return [...prev, ...newRooms];
      });
      if (shouldFocus && lastRoomId) {
        setNewlyAddedRoomId(lastRoomId);
        setTimeout(() => setNewlyAddedRoomId(null), 2100);
      }
  };
  
  const handleQuickAdd = (type) => setShowConfirmation({ open: true, type, selection: [...(type === "Home" ? masterRoomList : apartmentRoomList)] });
  const handleQuickAddConfirm = () => {
    const targetFloor = primaryRoomFloor || selectedRoomFloors[0] || "";
    if (!targetFloor) return;
    addMultipleRooms(showConfirmation.selection, targetFloor, { shouldFocus: false });
    setShowConfirmation({ open: false, type: null, selection: [] });
  };
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

  const sortFloors = (list) => {
    return [...list].sort((a, b) => {
      if (a === 'Basement') return -1;
      if (b === 'Basement') return 1;
      if (a === 'Attic') return 1;
      if (b === 'Attic') return -1;
      return a.localeCompare(b, undefined, { numeric: true });
    });
  };

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

        return sortFloors(next);
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
          return sortFloors(newFloors);
      });

      setNewFloorNumber("");
  };

  const apartmentFloorsForType = (type) => {
    if (type === "Studio") return ["Floor 1"];
    if (type === "Duplex") return ["Floor 1", "Floor 2"];
    if (type === "Triplex") return ["Floor 1", "Floor 2", "Floor 3"];
    return [];
  };

  const handleApartmentTypeSelect = (type) => {
    const nextType = apartmentType === type ? "" : type;
    setApartmentType(nextType);
    if (!nextType) return;
    const aptFloors = apartmentFloorsForType(nextType);
    setProjectFloors(prev => {
      const filtered = prev.filter(f => !["Floor 1", "Floor 2", "Floor 3"].includes(f));
      return sortFloors([...new Set([...filtered, ...aptFloors])]);
    });
    setSelectedRoomFloors(aptFloors.length > 1 ? [] : aptFloors);
  };

  const handlePrebaggedSelect = (type) => {
    const nextType = prebaggedType === type ? "" : type;
    setPrebaggedType(nextType);
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
      if (allModel.roomSeverityCodes && allModel.roomSeverityCodes.length) {
        next.roomSeverityCodes = [...allModel.roomSeverityCodes];
      }
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
  const initialInstructionsComplete = eventInstructionDraft.trim() !== "" && instructionAgreement === 'agree';
  const initialInstructionsBorderClass = !openInitialInstructions ? (instructionAgreement === 'agree' ? 'border-green-500 border-2' : 'border-red-500 border-2') : 'border-slate-200';

  const primaryRoomFloor = selectedRoomFloors[0] || "";

  const roomsOnActiveFloor = useMemo(() => {
    return (rooms || []).filter(r => (r.floorLabel || "") === (primaryRoomFloor || ""));
  }, [rooms, primaryRoomFloor]);

  const roomCountsOnActiveFloor = useMemo(() => {
    const counts = {};
    roomsOnActiveFloor.forEach(r => {
      const base = roomBaseName(r.name);
      counts[base] = (counts[base] || 0) + 1;
    });
    return counts;
  }, [roomsOnActiveFloor]);

  const roomOptionsForSelection = useMemo(() => {
    const baseList = masterRoomList;
    const usedBases = new Set(
      roomsOnActiveFloor.map(r => (roomBaseName(r.name) || "").toLowerCase())
    );
    const seenBases = new Set();
    const options = [];

    baseList.forEach(item => {
      const base = normalizeBaseLabel(item) || item;
      const baseLower = base.toLowerCase();
      const isBedroom = baseLower === "bedroom";
      const isBath = baseLower === "bath";

      // Remove numbered bedroom/bath options so only the base appears once.
      if ((isBedroom || isBath) && baseLower !== item.toLowerCase()) return;

      if (seenBases.has(baseLower)) return;
      if (!isBedroom && !isBath && usedBases.has(baseLower)) return;

      seenBases.add(baseLower);
      options.push(base);
    });

    if (!seenBases.has("bedroom")) options.unshift("Bedroom");
    if (!seenBases.has("bath")) options.unshift("Bath");

    return options;
  }, [masterRoomList, roomsOnActiveFloor]);

  const hasRoomsByFloor = useMemo(() => {
    const map = {};
    (projectFloors || []).forEach(f => {
      map[f] = (rooms || []).some(r => (r.floorLabel || "") === f);
    });
    return map;
  }, [rooms, projectFloors]);

  const hasRoomAddInputs = useMemo(() => {
    const bedroomCount = parseInt(bedroomCountDraft, 10);
    const bathroomCount = parseInt(bathroomCountDraft, 10);
    const customNames = parseRoomList(customRoomsDraft);
    return Boolean(selectedRoomTemplates.length
      || (Number.isFinite(bedroomCount) && bedroomCount > 0)
      || (Number.isFinite(bathroomCount) && bathroomCount > 0)
      || customNames.length);
  }, [selectedRoomTemplates, bedroomCountDraft, bathroomCountDraft, customRoomsDraft]);

  const orderSeverityCodes = useMemo(() => {
    const map = {};
    (severityCodes || []).forEach(code => {
      const [group, level] = String(code || "").split("-");
      if (group && level) map[group] = level;
    });
    return Object.entries(map).map(([group, level]) => `${group}-${level}`);
  }, [severityCodes]);

  const toggleRoomSelection = (label) => {
    setSelectedRoomTemplates(prev => (
      prev.includes(label) ? prev.filter(r => r !== label) : [...prev, label]
    ));
  };

  const toggleRoomFloorSelection = (floor) => {
    setSelectedRoomFloors(prev => (prev[0] === floor ? [] : [floor]));
  };

  const toggleRoomSeverity = (roomId, code) => {
    const group = String(code || "").split("-")[0];
    const apply = (room) => {
      const defaults = orderSeverityCodes;
      const current = (room.roomSeverityCodes && room.roomSeverityCodes.length) ? room.roomSeverityCodes : defaults;
      const filtered = current.filter(c => !c.startsWith(`${group}-`));
      const next = current.includes(code) ? filtered : [...filtered, code];
      return { ...room, roomSeverityCodes: next };
    };

    if (isSelectionMode || roomId === "ALL") {
      setAllModel(prev => apply(prev));
      setBulkDirty(true);
      return;
    }
    setRooms(prev => prev.map(r => (r.id === roomId ? apply(r) : r)));
  };

  const addSelectedRooms = (selectForBulk = false) => {
    if (!selectedRoomFloors.length) return;
    const selections = selectedRoomTemplates;
    const bedroomCount = parseInt(bedroomCountDraft, 10);
    const bathroomCount = parseInt(bathroomCountDraft, 10);
    const customNames = parseRoomList(customRoomsDraft);
    const extraBedrooms = Number.isFinite(bedroomCount) && bedroomCount > 0 ? Array.from({ length: bedroomCount }, () => "Bedroom") : [];
    const extraBaths = Number.isFinite(bathroomCount) && bathroomCount > 0 ? Array.from({ length: bathroomCount }, () => "Bath") : [];
    const extraNames = [...extraBedrooms, ...extraBaths, ...customNames];

    if (!selections.length && !extraNames.length) return;
    const created = [];
    setRooms(prev => {
      let next = [...prev];
      selectedRoomFloors.forEach(floor => {
        const baseCounts = {};
        next
          .filter(r => (r.floorLabel || "") === floor)
          .forEach(r => {
            const base = roomBaseName(r.name);
            baseCounts[base] = (baseCounts[base] || 0) + 1;
          });
        [...selections, ...extraNames].forEach(label => {
          const name = formatRoomNameForFloor(label, floor, baseCounts).trim();
          if (!name || next.some(r => r.name === name)) return;
          const r = newRoom(name, floor);
          created.push(r);
          next = [...next, r];
        });
      });
      return selectForBulk ? next.map(r => ({ ...r, ui: { ...r.ui, openRoom: false } })) : next;
    });
    if (selectForBulk && created.length) {
      setIsSelectionMode(true);
      setSelectedIds(created.map(r => r.id));
    }
    setSelectedRoomTemplates([]);
    setBedroomCountDraft("");
    setBathroomCountDraft("");
    setCustomRoomsDraft("");
    if (customNames.length) {
      setMasterRoomList(prev => Array.from(new Set([...prev, ...customNames])));
    }
  };
  
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
                    <div className="font-bold text-lg">1. Event Instructions</div>
                    <span className={`opacity-60 transition-transform ${openInitialInstructions ? "rotate-180" : ""}`}><ChevronDown/></span>
                </button>
                {openInitialInstructions && (
                    <div className="p-4 border-t space-y-4">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                                {autoInstructionLines.length > 0 ? (
                                    <ul className="list-disc pl-5 text-base text-slate-700 space-y-1">
                                        {autoInstructionLines.map((line, idx) => (
                                            <li key={`${line.label}-${idx}`}>
                                                <span className="font-semibold">{line.label}:</span> {line.value}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-sm text-slate-500">No auto-filled instructions yet.</div>
                                )}
                                {freeFormDraft.trim() && (
                                    <div className="mt-3 text-base text-slate-700 whitespace-pre-line">
                                        {freeFormDraft.trim()}
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => setEditInstructions(v => !v)}
                                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-100"
                                title="Edit instructions"
                            >
                                <FilePenLine size={16} />
                            </button>
                        </div>

                        {editInstructions && (
                            <div className="space-y-2">
                                <textarea
                                    value={eventInstructionDraft}
                                    onChange={(e) => handleEventInstructionChange(e.target.value)}
                                    placeholder="Enter instructions here..."
                                    className="w-full min-h-[140px] rounded-xl border border-slate-200 bg-white p-3 text-base text-slate-700 shadow-sm focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                                />
                                <div className="text-xs text-slate-500">Edits here update the Schedule Event Instructions.</div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Additional Instructions</div>
                            <textarea
                                value={freeFormDraft}
                                onChange={(e) => handleFreeFormChange(e.target.value)}
                                placeholder="Add any extra instructions here..."
                                className="w-full min-h-[120px] rounded-xl border border-slate-200 bg-white p-3 text-base text-slate-700 shadow-sm focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                            />
                        </div>

                        {instructionAgreement !== 'disagree' ? (
                            <div className="flex flex-wrap justify-end gap-2 pt-2">
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
                            <div className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-3">
                                <div className="flex items-center gap-2 text-red-700">
                                    <AlertTriangle size={20} />
                                    <h4 className="font-semibold">Please explain your concerns</h4>
                                </div>
                                <p className="text-xs text-red-600">Please alert sales rep to address your concerns before proceeding.</p>
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
                                    className="w-full bg-slate-200 text-slate-800 font-semibold py-2 rounded-lg hover:bg-slate-300 text-sm"
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
                            <div className="flex flex-wrap items-center gap-2">
                                {['Basement', 'Floor 1', 'Floor 2', 'Floor 3', 'Floor 4', 'Attic'].map(f => (
                                    <button key={f} onClick={() => toggleFloor(f)} className={`px-3 py-1 text-sm rounded-full border font-semibold ${projectFloors.includes(f) ? 'bg-sky-500 text-white' : 'bg-white'}`}>{f}</button>
                                ))}
                            </div>
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-slate-50">
                            <button
                                type="button"
                                onClick={() => setOpenApartmentOptions(v => !v)}
                                className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-slate-700"
                            >
                                Apartment / Hotels?
                                <span className={`opacity-60 transition-transform ${openApartmentOptions ? "rotate-180" : ""}`}><ChevronDown size={16} /></span>
                            </button>
                            {openApartmentOptions && (
                                <div className="px-3 pb-3">
                                    <div className="text-xs text-slate-500 mb-2">Selecting a type auto-selects the required floors. Hotels can add any number of floors below.</div>
                                    <div className="flex flex-wrap gap-2">
                                        {['Studio', 'Duplex', 'Triplex'].map(f => (
                                            <button
                                                key={f}
                                                type="button"
                                                onClick={() => handleApartmentTypeSelect(f)}
                                                className={`px-3 py-1 text-sm rounded-full border font-semibold ${apartmentType === f ? 'bg-sky-500 text-white' : 'bg-white'}`}
                                            >
                                                {f}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                        <input
                                            type="number"
                                            value={newFloorNumber}
                                            onChange={e => setNewFloorNumber(e.target.value)}
                                            placeholder="# floors"
                                            className="w-24 border rounded-lg px-3 py-1.5 text-sm"
                                        />
                                        <button
                                            onClick={addNumericFloor}
                                            type="button"
                                            className="bg-indigo-500 text-white font-semibold px-3 py-1.5 rounded-lg text-sm"
                                        >
                                            Add Floors
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-slate-50">
                            <button
                                type="button"
                                onClick={() => setOpenPrebaggedOptions(v => !v)}
                                className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-slate-700"
                            >
                                Pre-bagged?
                                <span className={`opacity-60 transition-transform ${openPrebaggedOptions ? "rotate-180" : ""}`}><ChevronDown size={16} /></span>
                            </button>
                            {openPrebaggedOptions && (
                                <div className="px-3 pb-3">
                                    <div className="text-xs text-slate-500 mb-2">Use when items were bagged by someone else.</div>
                                    <div className="flex flex-wrap gap-2">
                                        {['Off-site', 'In the home', 'In the rooms'].map(option => (
                                            <button
                                                key={option}
                                                type="button"
                                                onClick={() => handlePrebaggedSelect(option)}
                                                className={`px-3 py-1 text-sm rounded-full border font-semibold ${prebaggedType === option ? 'bg-sky-500 text-white' : 'bg-white'}`}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
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
                        <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                            <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Step 1 • Select floor (you are adding rooms to)</div>
                            <div className="text-xs text-slate-500">If more than one floor exists, choose the floor you are working on.</div>
                            {projectFloors.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {projectFloors.filter(f => f !== 'Duplex' && f !== 'Triplex').map(f => {
                                        const selected = selectedRoomFloors.includes(f);
                                        return (
                                            <button
                                                key={f}
                                                type="button"
                                                onClick={() => toggleRoomFloorSelection(f)}
                                                className={`px-3 py-1 text-sm rounded-full border font-semibold ${selected ? 'border-sky-400 bg-sky-500 text-white' : 'border-slate-200 bg-white text-slate-700'}`}
                                            >
                                                {f}
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-xs text-slate-500">Add floors first to start adding rooms.</div>
                            )}
                        </div>

                        <div className="space-y-2 rounded-lg border border-slate-200 bg-white px-3 py-3">
                                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Step 2 • Select rooms to add</div>
                                <div className="text-xs text-slate-500">
                                    {selectedRoomFloors.length ? `Adding rooms to: ${selectedRoomFloors.join(", ")}` : "Select a floor first to add rooms."}
                                </div>
                                {selectedRoomFloors.length ? (
                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex flex-wrap gap-2">
                                                {roomOptionsForSelection.map(room => {
                                                    const base = normalizeBaseLabel(room) || room;
                                                    const count = roomCountsOnActiveFloor[base] || 0;
                                                    const selected = selectedRoomTemplates.includes(room);
                                                    return (
                                                        <button
                                                            key={`${primaryRoomFloor || "all"}-${room}`}
                                                            type="button"
                                                            onClick={() => toggleRoomSelection(room)}
                                                            className={`px-3 py-1 text-sm rounded-full border font-semibold ${selected ? 'border-sky-400 bg-sky-100 text-sky-800' : 'border-slate-200 bg-white text-slate-700'}`}
                                                        >
                                                            {room}
                                                            {count > 0 && <span className="ml-2 text-xs font-bold">{count}</span>}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                                            <div className="text-[11px] font-semibold text-slate-500 mb-2">Optional • Add bedrooms, baths, or custom rooms (comma separated)</div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    value={bedroomCountDraft}
                                                    onChange={(e) => setBedroomCountDraft(e.target.value)}
                                                    placeholder="# Bedrooms"
                                                    className="w-28 border-2 border-sky-200 rounded-lg px-3 py-1.5 text-sm bg-white"
                                                />
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    value={bathroomCountDraft}
                                                    onChange={(e) => setBathroomCountDraft(e.target.value)}
                                                    placeholder="# Baths"
                                                    className="w-24 border-2 border-sky-200 rounded-lg px-3 py-1.5 text-sm bg-white"
                                                />
                                                <input
                                                    type="text"
                                                    value={customRoomsDraft}
                                                    onChange={(e) => setCustomRoomsDraft(e.target.value)}
                                                    placeholder="Custom rooms (ex: John, Sally, Kevin)"
                                                    className="flex-1 min-w-[160px] border-2 border-sky-200 rounded-lg px-3 py-1.5 text-sm bg-white"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => addSelectedRooms(false)}
                                                disabled={!hasRoomAddInputs}
                                                className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:bg-slate-200 disabled:text-slate-400"
                                            >
                                                Add
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => addSelectedRooms(true)}
                                                disabled={!hasRoomAddInputs}
                                                className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:bg-slate-200 disabled:text-slate-300"
                                            >
                                                Add and select
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-xs text-slate-500">Select a floor before choosing rooms.</div>
                                )}
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
                <div className="space-y-3">{visibleRooms.map((room, index) => <div ref={index === 0 ? tourRefs.firstRoomRef : null} key={room.id}><RoomCard room={room} isSelectionMode={isSelectionMode} isSelected={selectedIds.includes(room.id)} onSelect={() => setSelectedIds(p => p.includes(room.id) ? p.filter(id => id !== room.id) : [...p, room.id])} onToggleSection={toggleRoomSection} onSetField={setRoomField} onToggleSeverity={toggleSeverity} onToggleRoomSeverity={toggleRoomSeverity} orderSeverityCodes={orderSeverityCodes} onToggleInline={toggleInline} mode={mode} dynamicItemOptions={dynamicItemOptions} onSetTaskStatus={setTaskStatus} onSetTaskReason={setTaskReason} onDeleteTask={deleteTask} onAddTask={addTask} onDeleteRequest={setDeletingRoomId} selectedIds={selectedIds} onChangeNote={openChangeNoteModal} newlyAddedRoomId={newlyAddedRoomId} onSetTaskQuantity={setTaskQuantity} tourRefs={tourRefs} rooms={rooms}/></div>)}</div>
                </>
            )}
        </>
      )}


      {isSelectionMode && <div ref={bulkEditCardRef}><RoomCard room={allModel} rooms={rooms} projectFloors={projectFloors} selectedIds={selectedIds} onSetField={setRoomField} onToggleSection={toggleRoomSection} onToggleSeverity={toggleSeverity} onToggleRoomSeverity={toggleRoomSeverity} orderSeverityCodes={orderSeverityCodes} onToggleInline={toggleInline} isSelectionMode={true} onApplyChanges={applyBulkChanges} bulkDirty={bulkDirty} onSetTaskReason={setTaskReason} onAddTask={addTask} onDeleteTask={deleteTask} onChangeNote={openChangeNoteModal} onSetTaskQuantity={setTaskQuantity} dynamicItemOptions={dynamicItemOptions}/></div>}

      {mode === 'scope' && <div ref={roomListContainerRef} className="space-y-3">{visibleRooms.map((room, index) => <div ref={index === 0 ? tourRefs.firstRoomRef : null} key={room.id}><RoomCard room={room} rooms={rooms} isSelectionMode={isSelectionMode} isSelected={selectedIds.includes(room.id)} onSelect={() => setSelectedIds(p => p.includes(room.id) ? p.filter(id => id !== room.id) : [...p, room.id])} onToggleSection={toggleRoomSection} onSetField={setRoomField} onToggleSeverity={toggleSeverity} onToggleRoomSeverity={toggleRoomSeverity} orderSeverityCodes={orderSeverityCodes} onToggleInline={toggleInline} mode={mode} dynamicItemOptions={dynamicItemOptions} onSetTaskStatus={setTaskStatus} onSetTaskReason={setTaskReason} onDeleteTask={deleteTask} onAddTask={addTask} onDeleteRequest={setDeletingRoomId} selectedIds={selectedIds} onChangeNote={openChangeNoteModal} newlyAddedRoomId={newlyAddedRoomId} onSetTaskQuantity={setTaskQuantity} tourRefs={tourRefs} /></div>)}</div>}

      {deletingRoomId && <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100]"><div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm"><div className="flex items-center gap-3"><AlertTriangle className="text-red-500" size={32}/><h3 className="text-lg font-bold">Delete Room?</h3></div><p className="text-sm text-slate-600 my-4">Are you sure you want to delete this room? This action cannot be undone.</p><div className="flex justify-end gap-2"><button onClick={() => setDeletingRoomId(null)} className="px-4 py-2 bg-slate-200 rounded-lg">Cancel</button><button onClick={() => handleDeleteRoom(deletingRoomId)} className="px-4 py-2 bg-red-600 text-white rounded-lg">Confirm Delete</button></div></div></div>}
      {showClearConfirm && <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100]"><div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm"><div className="flex items-center gap-3"><AlertTriangle className="text-red-500" size={32}/><h3 className="text-lg font-bold">Clear All Data?</h3></div><p className="text-sm text-slate-600 my-4">This will remove all rooms and reset the form. This action cannot be undone.</p><div className="flex justify-end gap-2"><button onClick={() => setShowClearConfirm(false)} className="px-4 py-2 bg-slate-200 rounded-lg">Cancel</button><button onClick={handleClearAll} className="px-4 py-2 bg-red-600 text-white rounded-lg">Confirm Clear</button></div></div></div>}
      {showConfirmation.open && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]"><div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm"><h3 className="text-lg font-bold mb-4">Add {showConfirmation.type} Rooms</h3><div className="grid grid-cols-2 gap-2 mb-6">{(showConfirmation.type === 'Home' ? masterRoomList : apartmentRoomList).map(r => <button key={r} onClick={() => toggleQuickAddRoom(r)} className={`px-2 py-1 text-sm rounded-lg border ${showConfirmation.selection.includes(r) ? 'bg-sky-500 text-white' : 'bg-slate-100'}`}>{r}</button>)}</div><div className="flex justify-end gap-2"><button onClick={() => setShowConfirmation({ open: false, type: null, selection: [] })} className="px-4 py-2 bg-slate-200 rounded-lg">Cancel</button><button onClick={handleQuickAddConfirm} className="px-4 py-2 bg-sky-500 text-white rounded-lg">Add</button></div></div></div>}
      {false && showFromListSelection.open && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]"><div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm"><h3 className="text-lg font-bold mb-1">Add Rooms to {showFromListSelection.floor}</h3><p className="text-xs text-slate-500 mb-4">Select rooms to add to this floor.</p><div className="max-h-60 overflow-y-auto grid grid-cols-2 gap-2 mb-6 pr-2">{availableRoomsFromMaster.map(r => <button key={r} onClick={() => setSelectedFromList(p => p.includes(r) ? p.filter(i => i !== r) : [...p, r])} className={`px-3 py-2 text-sm rounded-lg border font-semibold ${selectedFromList.includes(r) ? 'bg-sky-500 text-white border-sky-600' : 'bg-slate-100 hover:bg-slate-200'}`}>{r}</button>)}</div><div className="flex justify-end gap-2"><button onClick={() => setShowFromListSelection({open: false, floor: 'Floor 1'})} className="px-4 py-2 bg-slate-200 rounded-lg">Cancel</button><button onClick={addFromListRooms} className="px-4 py-2 bg-sky-500 text-white rounded-lg">Add</button></div></div></div>}
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
                      className={`rounded-xl border px-4 py-4 text-left transition-all ${active ? "border-sky-400 bg-sky-50" : "border-slate-200 hover:border-sky-200"}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 flex items-center justify-center overflow-hidden">
                          <img src={opt.icon} alt={opt.id} className="h-16 w-16 object-contain" />
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
          orderName={orderName}
          claimNumber={claimNumber}
          insuranceCompany={insuranceCompany}
          insuranceAdjuster={insuranceAdjuster}
          dateOfLoss={dateOfLoss}
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
