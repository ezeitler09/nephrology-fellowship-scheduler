import React, { useState } from 'react';
import { Calendar, Users, AlertCircle, Download, RefreshCw } from 'lucide-react';

const NephrologyScheduler = () => {
  const [fellows, setFellows] = useState([
    { id: 1, name: 'Fellow 1', year: 1, vacationWeeks: ['', '', ''] },
    { id: 2, name: 'Fellow 2', year: 1, vacationWeeks: ['', '', ''] },
    { id: 3, name: 'Fellow 3', year: 1, vacationWeeks: ['', '', ''] },
    { id: 4, name: 'Fellow 4', year: 1, vacationWeeks: ['', '', ''] },
    { id: 5, name: 'Fellow 5', year: 2, vacationWeeks: ['', '', ''] },
    { id: 6, name: 'Fellow 6', year: 2, vacationWeeks: ['', '', ''] },
    { id: 7, name: 'Fellow 7', year: 2, vacationWeeks: ['', '', ''] },
    { id: 8, name: 'Fellow 8', year: 2, vacationWeeks: ['', '', ''] }
  ]);
  
  const [academicYearStart, setAcademicYearStart] = useState(2025);
  const [renalBlockWeeks, setRenalBlockWeeks] = useState([32, 33]);
  const [schedule, setSchedule] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [stats, setStats] = useState(null);

  const rotations = [
    'ICU Consult',
    'Floor Consult',
    'Transplant Consult',
    'Night Coverage',
    'Subspecialty',
    'Outpatient',
    'Renal Biopsy',
    'Elective',
    'Apheresis',
    'Vacation',
    'Orientation',
    'Renal Block'
  ];

  const getWeekDates = (weekNum) => {
    const startDate = new Date(academicYearStart, 6, 1); // July 1 of selected year
    const weekStart = new Date(startDate);
    weekStart.setDate(startDate.getDate() + weekNum * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return {
      start: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      end: weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
  };

  const isHolidayWeek = (weekNum) => {
    const startDate = new Date(academicYearStart, 6, 1);
    const weekStart = new Date(startDate);
    weekStart.setDate(startDate.getDate() + weekNum * 7);
    
    const month = weekStart.getMonth();
    const date = weekStart.getDate();
    
    // Thanksgiving week
    if (month === 10 && date >= 20) return 'thanksgiving';
    // Christmas/New Year week
    if (month === 11 && date >= 20) return 'christmas';
    if (month === 0 && date <= 7) return 'christmas';
    
    return false;
  };

  const generateSchedule = () => {
    const weeks = 52;
    const numFellows = fellows.length;
    const newSchedule = Array(weeks).fill(null).map(() => Array(numFellows).fill(null));
    
    // Calculate how many weeks each fellow should do each rotation
    // Total ICU + Floor = 104 weeks (52 each)
    // Year 1 fellows (4 fellows): 8 ICU + 8 Floor each = 32 + 32 = 64 weeks total
    // Year 2 fellows (4 fellows): remaining 20 ICU + 20 Floor = 5 each
    // Night coverage: 52 weeks minus Christmas week = ~51 weeks
    
    const year1Fellows = fellows.filter(f => f.year === 1).length;
    const year2Fellows = fellows.filter(f => f.year === 2).length;
    
    // Year 1: 8 ICU + 8 Floor = 16 total weeks of consults
    const year1IcuFloor = 8;
    
    // Year 2: Remaining consults divided among them
    // 52 ICU - (4 year1 * 8) = 52 - 32 = 20 ICU for year 2s = 5 each
    // 52 Floor - (4 year1 * 8) = 52 - 32 = 20 Floor for year 2s = 5 each
    const year2IcuFloor = 5;
    
    // Night coverage: ~51 weeks / 8 fellows = 6 each (48 total) + some 7s
    const nightWeeks = 6;
    
    const year1Targets = {
      'ICU Consult': year1IcuFloor,
      'Floor Consult': year1IcuFloor,
      'Transplant Consult': 4,
      'Night Coverage': nightWeeks,
      'Subspecialty': 5,
      'Outpatient': 4,
      'Renal Biopsy': 6,
      'Elective': 4,
      'Apheresis': 0,
      'Vacation': 3,
      'Orientation': 1,
      'Renal Block': 0
    };
    
    const year2Targets = {
      'ICU Consult': year2IcuFloor,
      'Floor Consult': year2IcuFloor,
      'Transplant Consult': 4,
      'Night Coverage': nightWeeks,
      'Subspecialty': 7,
      'Outpatient': 7,
      'Renal Biopsy': 6,
      'Elective': 5,
      'Apheresis': 1,
      'Vacation': 3,
      'Orientation': 0,
      'Renal Block': 2
    };
    
    // Track what each fellow has done
    const fellowStats = fellows.map((fellow) => ({
      rotationCounts: Object.fromEntries(rotations.map(r => [r, 0])),
      targets: fellow.year === 1 ? year1Targets : year2Targets,
      lastRotation: null,
      requestedVacationWeeks: fellow.vacationWeeks
        .map(w => w ? parseInt(w) - 1 : null)
        .filter(w => w !== null && w >= 0 && w < weeks)
    }));

    const consultRotations = ['ICU Consult', 'Floor Consult', 'Transplant Consult'];
    
    // FIRST: Assign orientation to all Year 1 fellows in week 0
    for (let f = 0; f < numFellows; f++) {
      if (fellows[f].year === 1) {
        newSchedule[0][f] = 'Orientation';
        fellowStats[f].rotationCounts['Orientation']++;
        fellowStats[f].lastRotation = 'Orientation';
      }
    }
    
    // SECOND: Assign Renal Block to all Year 2 fellows in mid-February
    for (const week of renalBlockWeeks) {
      for (let f = 0; f < numFellows; f++) {
        if (fellows[f].year === 2) {
          newSchedule[week][f] = 'Renal Block';
          fellowStats[f].rotationCounts['Renal Block']++;
          fellowStats[f].lastRotation = 'Renal Block';
        }
      }
    }
    
    // THIRD: Assign requested vacation weeks
    for (let f = 0; f < numFellows; f++) {
      for (const requestedWeek of fellowStats[f].requestedVacationWeeks) {
        // Only assign if the week is available and not a special week
        if (requestedWeek > 0 && 
            !renalBlockWeeks.includes(requestedWeek) && 
            !isHolidayWeek(requestedWeek) &&
            newSchedule[requestedWeek][f] === null &&
            fellowStats[f].rotationCounts['Vacation'] < 3) {
          newSchedule[requestedWeek][f] = 'Vacation';
          fellowStats[f].rotationCounts['Vacation']++;
          fellowStats[f].lastRotation = 'Vacation';
        }
      }
    }
    
    // Helper function to check if a fellow can do a rotation
    const canAssignRotation = (fellowIdx, rotation, week) => {
      const stats = fellowStats[fellowIdx];
      
      // Already assigned this week
      if (newSchedule[week][fellowIdx] !== null) return false;
      
      // Already hit target for this rotation
      if (stats.rotationCounts[rotation] >= stats.targets[rotation]) return false;
      
      // Can't repeat same rotation (check previous week if not week 0)
      if (week > 0 && newSchedule[week - 1][fellowIdx] === rotation) return false;
      
      // Vacation and Orientation shouldn't be assigned during required coverage weeks
      if ((rotation === 'Vacation' || rotation === 'Orientation') && 
          (week === 0 || isHolidayWeek(week))) return false;
      
      // Renal Block only for Year 2 and only during designated weeks
      if (rotation === 'Renal Block' && 
          (fellows[fellowIdx].year !== 2 || !renalBlockWeeks.includes(week))) return false;
      
      // Apheresis only for Year 2
      if (rotation === 'Apheresis' && fellows[fellowIdx].year !== 2) return false;
      
      return true;
    };
    
    // Helper function to score a fellow for a rotation
    const scoreFellow = (fellowIdx, rotation, week) => {
      const stats = fellowStats[fellowIdx];
      const fellow = fellows[fellowIdx];
      let score = 0;
      
      // How far from target?
      const remaining = stats.targets[rotation] - stats.rotationCounts[rotation];
      score += remaining * 100;  // Prioritize rotations they need
      
      // For consults, slightly prefer year 1 fellows
      if (consultRotations.includes(rotation)) {
        score += fellow.year === 1 ? 10 : 5;
      }
      
      // Penalize back-to-back consult rotations
      if (consultRotations.includes(rotation) && consultRotations.includes(stats.lastRotation)) {
        score -= 200;
      }
      
      // HEAVILY penalize bad transitions from ICU
      if (stats.lastRotation === 'ICU Consult') {
        if (rotation === 'Night Coverage') score -= 500;
        if (rotation === 'Subspecialty') score -= 500;
        if (rotation === 'Renal Biopsy') score -= 500;
      }
      
      // CRITICAL: Prevent working both holidays
      const holidayType = isHolidayWeek(week);
      if (holidayType) {
        // Check if this fellow already worked the other holiday
        const thanksgivingWeeks = [];
        const christmasWeeks = [];
        for (let w = 0; w < weeks; w++) {
          const hType = isHolidayWeek(w);
          if (hType === 'thanksgiving') thanksgivingWeeks.push(w);
          if (hType === 'christmas') christmasWeeks.push(w);
        }
        
        if (holidayType === 'thanksgiving') {
          // Check if they're already assigned Christmas
          const hasChristmas = christmasWeeks.some(w => newSchedule[w] && newSchedule[w][fellowIdx]);
          if (hasChristmas) score -= 10000; // Make this nearly impossible
        } else if (holidayType === 'christmas') {
          // Check if they're already assigned Thanksgiving
          const hasThanksgiving = thanksgivingWeeks.some(w => newSchedule[w] && newSchedule[w][fellowIdx]);
          if (hasThanksgiving) score -= 10000; // Make this nearly impossible
        }
      }
      
      // Add randomness for variety
      score += Math.random() * 10;
      
      return score;
    };

    // Assign rotations week by week
    for (let week = 0; week < weeks; week++) {
      const holidayType = isHolidayWeek(week);
      const isRenalBlockWeek = renalBlockWeeks.includes(week);
      let rotationsThisWeek;
      
      if (holidayType === 'christmas') {
        // Christmas/New Year: Only ICU and Floor
        rotationsThisWeek = ['ICU Consult', 'Floor Consult'];
      } else if (holidayType === 'thanksgiving') {
        // Thanksgiving: ICU, Floor, and Night coverage
        rotationsThisWeek = ['ICU Consult', 'Floor Consult', 'Night Coverage'];
      } else if (week === 0) {
        // First week: Orientation for Year 1s already assigned, need ICU, Floor, Night for Year 2s
        rotationsThisWeek = ['ICU Consult', 'Floor Consult', 'Night Coverage'];
      } else if (isRenalBlockWeek) {
        // Renal Block weeks: Year 2s already assigned, Year 1s cover everything (no Apheresis)
        rotationsThisWeek = ['ICU Consult', 'Floor Consult', 'Transplant Consult', 'Night Coverage', 
                             'Subspecialty', 'Outpatient', 'Renal Biopsy', 'Elective'];
      } else {
        // Regular week: all clinical rotations (not vacation/orientation/renal block - those are assigned separately)
        rotationsThisWeek = ['ICU Consult', 'Floor Consult', 'Transplant Consult', 'Night Coverage', 
                             'Subspecialty', 'Outpatient', 'Renal Biopsy', 'Elective', 'Apheresis'];
      }
      
      for (const rotation of rotationsThisWeek) {
        // Find best fellow for this rotation
        let bestFellow = -1;
        let bestScore = -Infinity;
        
        for (let f = 0; f < numFellows; f++) {
          if (canAssignRotation(f, rotation, week)) {
            const score = scoreFellow(f, rotation, week);
            if (score > bestScore) {
              bestScore = score;
              bestFellow = f;
            }
          }
        }
        
        // Assign if we found someone
        if (bestFellow >= 0) {
          newSchedule[week][bestFellow] = rotation;
          fellowStats[bestFellow].rotationCounts[rotation]++;
          fellowStats[bestFellow].lastRotation = rotation;
        }
      }
      
      // After assigning required rotations, prioritize vacation for unassigned fellows
      for (let f = 0; f < numFellows; f++) {
        if (newSchedule[week][f] === null && 
            fellowStats[f].rotationCounts['Vacation'] < fellowStats[f].targets['Vacation'] &&
            !holidayType && week !== 0 && !renalBlockWeeks.includes(week)) {
          newSchedule[week][f] = 'Vacation';
          fellowStats[f].rotationCounts['Vacation']++;
          fellowStats[f].lastRotation = 'Vacation';
        }
      }
      
      // Reset last rotation for fellows not assigned this week
      for (let f = 0; f < numFellows; f++) {
        if (newSchedule[week][f] === null) {
          fellowStats[f].lastRotation = null;
        }
      }
    }
    
    // After all weeks assigned, ensure EVERY fellow gets exactly 3 weeks vacation
    // Find fellows who need more vacation and assign to their null weeks
    for (let f = 0; f < numFellows; f++) {
      const vacationNeeded = 3 - fellowStats[f].rotationCounts['Vacation'];
      if (vacationNeeded > 0) {
        let assigned = 0;
        for (let week = 1; week < weeks && assigned < vacationNeeded; week++) {
          // Skip holiday weeks and renal block weeks
          if (isHolidayWeek(week) || renalBlockWeeks.includes(week)) continue;
          
          // Find unassigned weeks or weeks with non-critical rotations
          if (newSchedule[week][f] === null) {
            newSchedule[week][f] = 'Vacation';
            fellowStats[f].rotationCounts['Vacation']++;
            assigned++;
          }
        }
        
        // If still need vacation, look for elective weeks we can swap
        if (assigned < vacationNeeded) {
          for (let week = 1; week < weeks && assigned < vacationNeeded; week++) {
            if (newSchedule[week][f] === 'Elective') {
              newSchedule[week][f] = 'Vacation';
              fellowStats[f].rotationCounts['Vacation']++;
              fellowStats[f].rotationCounts['Elective']--;
              assigned++;
            }
          }
        }
      }
    }
    
    // Calculate statistics
    const newStats = fellows.map((fellow, idx) => ({
      name: fellow.name,
      year: fellow.year,
      rotations: fellowStats[idx].rotationCounts,
      targets: fellowStats[idx].targets
    }));
    
    setSchedule(newSchedule);
    setStats(newStats);
    setSelectedWeek(0);
  };

  const updateFellow = (id, field, value) => {
    setFellows(fellows.map(f => f.id === id ? { ...f, [field]: value } : f));
    setSchedule(null);
    setStats(null);
  };

  const updateFellowVacation = (id, index, value) => {
    setFellows(fellows.map(f => {
      if (f.id === id) {
        const newVacationWeeks = [...f.vacationWeeks];
        newVacationWeeks[index] = value;
        return { ...f, vacationWeeks: newVacationWeeks };
      }
      return f;
    }));
    setSchedule(null);
    setStats(null);
  };

  const updateScheduleCell = (week, fellowIdx, rotation) => {
    const newSchedule = [...schedule.map(w => [...w])];
    newSchedule[week][fellowIdx] = rotation === '' ? null : rotation;
    setSchedule(newSchedule);
    
    // Recalculate stats
    if (stats) {
      const newStats = fellows.map((fellow, idx) => {
        const counts = Object.fromEntries(rotations.map(r => [r, 0]));
        for (let w = 0; w < newSchedule.length; w++) {
          if (newSchedule[w][idx]) {
            counts[newSchedule[w][idx]]++;
          }
        }
        return {
          name: fellow.name,
          year: fellow.year,
          rotations: counts,
          targets: stats[idx].targets
        };
      });
      setStats(newStats);
    }
  };

  const exportSchedule = () => {
    if (!schedule) return;
    
    let csv = 'Week,Start Date,End Date,';
    csv += fellows.map(f => `"${f.name}"`).join(',') + '\n';
    
    schedule.forEach((week, idx) => {
      const dates = getWeekDates(idx);
      csv += `${idx + 1},"${dates.start}","${dates.end}",`;
      csv += fellows.map((f, fIdx) => `"${week[fIdx] || ''}"`).join(',') + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'nephrology_schedule.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const rotationColors = {
    'ICU Consult': 'bg-red-100 text-red-800 border-red-300',
    'Floor Consult': 'bg-orange-100 text-orange-800 border-orange-300',
    'Transplant Consult': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'Night Coverage': 'bg-purple-100 text-purple-800 border-purple-300',
    'Subspecialty': 'bg-blue-100 text-blue-800 border-blue-300',
    'Outpatient': 'bg-green-100 text-green-800 border-green-300',
    'Renal Biopsy': 'bg-teal-100 text-teal-800 border-teal-300',
    'Elective': 'bg-gray-100 text-gray-800 border-gray-300',
    'Apheresis': 'bg-pink-100 text-pink-800 border-pink-300',
    'Vacation': 'bg-cyan-100 text-cyan-800 border-cyan-300',
    'Orientation': 'bg-indigo-100 text-indigo-800 border-indigo-300',
    'Renal Block': 'bg-lime-100 text-lime-800 border-lime-300'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="text-indigo-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-800">UNC Nephrology Fellowship Scheduler</h1>
          </div>
          
          <div className="mb-4 flex items-center gap-3">
            <label className="text-gray-700 font-medium">Academic Year:</label>
            <select
              value={academicYearStart}
              onChange={(e) => {
                setAcademicYearStart(parseInt(e.target.value));
                setSchedule(null);
                setStats(null);
              }}
              className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {[2025, 2026, 2027, 2028, 2029, 2030].map(year => (
                <option key={year} value={year}>
                  July 1, {year} - June 30, {year + 1}
                </option>
              ))}
            </select>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <AlertCircle size={18} />
              Scheduling Rules
            </h3>
            <ul className="text-sm text-blue-800 space-y-1 ml-6 list-disc">
              <li>All Year 1 fellows start with 1 week of Orientation (Week 1)</li>
              <li>All Year 2 fellows do Renal Block together (configurable, default mid-February)</li>
              <li>All fellows get exactly 3 weeks of vacation per year (mandatory, can request specific weeks)</li>
              <li>No fellow works both Thanksgiving and Christmas holidays</li>
              <li>Only Year 2 fellows do Apheresis (1 week total during 2-year fellowship)</li>
              <li>ICU and Floor consults must be covered every week (52 weeks each)</li>
              <li>Night coverage every week except Christmas-New Year week (~51 weeks)</li>
              <li>Year 1 fellows: 8 ICU + 8 Floor = 16 weeks total of consults</li>
              <li>Year 2 fellows: 5 ICU + 5 Floor = 10 weeks total of consults</li>
              <li>Transplant consults: 4 weeks for all fellows</li>
              <li>Elective: 4 weeks (Year 1), 5 weeks (Year 2)</li>
              <li>Subspecialty: 5 weeks (Year 1), 7 weeks (Year 2)</li>
              <li>Outpatient: 4 weeks (Year 1), 7 weeks (Year 2)</li>
              <li>No rotation repeats two weeks in a row for the same fellow</li>
              <li>Consult rotations avoid back-to-back scheduling when possible</li>
              <li>Avoid transitions from ICU to: Nights, Subspecialty, or Renal Biopsy (clinic scheduling)</li>
            </ul>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Users className="text-indigo-600" size={20} />
              <h2 className="text-xl font-semibold text-gray-800">Fellows</h2>
            </div>
            <div className="space-y-4">
              {fellows.map(fellow => (
                <div key={fellow.id} className="bg-gray-50 p-4 rounded border">
                  <div className="flex gap-3 items-center mb-3">
                    <input
                      type="text"
                      value={fellow.name}
                      onChange={(e) => updateFellow(fellow.id, 'name', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <select
                      value={fellow.year}
                      onChange={(e) => updateFellow(fellow.id, 'year', parseInt(e.target.value))}
                      className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value={1}>Year 1</option>
                      <option value={2}>Year 2</option>
                    </select>
                  </div>
                  <div className="pl-3">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Vacation Requests (3 weeks required):
                    </label>
                    <div className="flex gap-2">
                      {[0, 1, 2].map(index => (
                        <div key={index} className="flex items-center gap-1">
                          <span className="text-xs text-gray-600">Week</span>
                          <input
                            type="number"
                            min="2"
                            max="52"
                            placeholder={`Choice ${index + 1}`}
                            value={fellow.vacationWeeks[index]}
                            onChange={(e) => updateFellowVacation(fellow.id, index, e.target.value)}
                            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="text-indigo-600" size={20} />
              <h2 className="text-xl font-semibold text-gray-800">Renal Block Schedule</h2>
            </div>
            <div className="bg-gray-50 p-4 rounded border">
              <p className="text-sm text-gray-700 mb-3">
                All Year 2 fellows will be assigned to Renal Block during these weeks (usually mid-February):
              </p>
              <div className="flex gap-3 items-center">
                <label className="text-sm font-medium text-gray-700">Week</label>
                <input
                  type="number"
                  min="1"
                  max="51"
                  value={renalBlockWeeks[0]}
                  onChange={(e) => {
                    const week1 = parseInt(e.target.value);
                    setRenalBlockWeeks([week1, week1 + 1]);
                    setSchedule(null);
                    setStats(null);
                  }}
                  className="w-20 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <span className="text-gray-600">to</span>
                <span className="px-3 py-2 bg-white border border-gray-300 rounded">{renalBlockWeeks[1]}</span>
                <span className="text-sm text-gray-600">
                  ({getWeekDates(renalBlockWeeks[0] - 1).start} - {getWeekDates(renalBlockWeeks[1] - 1).end})
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={generateSchedule}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
            >
              <RefreshCw size={18} />
              Generate Schedule
            </button>
            {schedule && (
              <button
                onClick={exportSchedule}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
              >
                <Download size={18} />
                Export CSV
              </button>
            )}
          </div>
        </div>

        {stats && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Rotation Distribution</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-3 py-2 text-left font-semibold">Fellow</th>
                    <th className="px-3 py-2 text-center font-semibold">Year</th>
                    {rotations.map(rot => (
                      <th key={rot} className="px-2 py-2 text-center font-semibold text-xs">{rot.split(' ')[0]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.map((stat, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="px-3 py-2 font-medium">{stat.name}</td>
                      <td className="px-3 py-2 text-center">{stat.year}</td>
                      {rotations.map(rot => {
                        const actual = stat.rotations[rot];
                        const target = stat.targets[rot];
                        const isGood = actual >= target - 1 && actual <= target + 1;
                        return (
                          <td key={rot} className={`px-2 py-2 text-center ${isGood ? '' : 'bg-yellow-100'}`}>
                            {actual}/{target}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-600 mt-2">Yellow highlight indicates counts outside target range</p>
          </div>
        )}

        {schedule && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Week (1-52):
              </label>
              <input
                type="range"
                min="0"
                max="51"
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>Week {selectedWeek + 1}</span>
                <span>{getWeekDates(selectedWeek).start} - {getWeekDates(selectedWeek).end}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-indigo-600 text-white">
                    <th className="px-4 py-3 text-left font-semibold">Fellow</th>
                    <th className="px-4 py-3 text-left font-semibold">Year</th>
                    <th className="px-4 py-3 text-left font-semibold">Rotation</th>
                  </tr>
                </thead>
                <tbody>
                  {fellows.map((fellow, idx) => (
                    <tr key={fellow.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{fellow.name}</td>
                      <td className="px-4 py-3">Year {fellow.year}</td>
                      <td className="px-4 py-3">
                        <select
                          value={schedule[selectedWeek][idx] || ''}
                          onChange={(e) => updateScheduleCell(selectedWeek, idx, e.target.value)}
                          className={`px-3 py-1 rounded border text-sm font-medium ${
                            schedule[selectedWeek][idx] ? rotationColors[schedule[selectedWeek][idx]] : 'bg-gray-100'
                          }`}
                        >
                          <option value="">None</option>
                          {rotations.map(rot => (
                            <option key={rot} value={rot}>{rot}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Rotation Legend:</h3>
              <div className="flex flex-wrap gap-2">
                {rotations.map(rot => (
                  <span
                    key={rot}
                    className={`px-3 py-1 rounded border text-xs font-medium ${rotationColors[rot]}`}
                  >
                    {rot}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NephrologyScheduler;
