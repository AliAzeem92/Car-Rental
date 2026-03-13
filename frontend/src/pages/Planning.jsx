import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { planningAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { RESERVATION_STATUS } from '../utils/constants';

const Planning = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({ reservations: [], maintenance: [] });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [isAnimating, setIsAnimating] = useState(false);
  const [statusFilters] = useState(['CONFIRMED', 'ONGOING']);

  useEffect(() => {
    loadCalendar();
  }, [currentDate]);

  const loadCalendar = async () => {
    try {
      const { data } = await planningAPI.getCalendar({
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear()
      });
      setData(data);
    } catch (error) {
      console.error('Failed to load calendar');
    }
  };

  const getFilteredReservations = () => {
    if (statusFilters.length === 0) return [];
    return data.reservations.filter(r => statusFilters.includes(r.status));
  };



  const changeMonth = (delta) => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
      setIsAnimating(false);
    }, 150);
  };

  const changeWeek = (delta) => {
    setIsAnimating(true);
    setTimeout(() => {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + (delta * 7));
      setCurrentDate(newDate);
      setIsAnimating(false);
    }, 150);
  };

  const goToToday = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentDate(new Date());
      setIsAnimating(false);
    }, 150);
  };

  const getMonthName = () => {
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getWeekRange = () => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { day: 'numeric' })}, ${end.getFullYear()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Planning & Calendar</h1>
        <button
          onClick={() => navigate('/dashboard/reservations')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" /> New Reservation
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-6 mb-4">
          <span className="text-sm font-medium text-gray-600">Legend:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500"></div>
            <span className="text-sm text-gray-700">Ongoing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span className="text-sm text-gray-700">Confirmed</span>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => view === 'month' ? changeMonth(-1) : changeWeek(-1)}
                className="p-1.5 hover:bg-white rounded-md transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => view === 'month' ? changeMonth(1) : changeWeek(1)}
                className="p-1.5 hover:bg-white rounded-md transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors text-gray-700"
            >
              Today
            </button>
            <span className="text-lg sm:text-xl font-bold text-gray-800">
              {view === 'month' ? getMonthName() : getWeekRange()}
            </span>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-lg self-start xl:self-auto w-full sm:w-auto">
            <button
              onClick={() => setView('month')}
              className={`flex-1 sm:px-4 py-2 rounded-md text-sm font-medium transition-all ${
                view === 'month' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setView('week')}
              className={`flex-1 sm:px-4 py-2 rounded-md text-sm font-medium transition-all ${
                view === 'week' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setView('list')}
              className={`flex-1 sm:px-4 py-2 rounded-md text-sm font-medium transition-all ${
                view === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              List
            </button>
          </div>
        </div>

        {view === 'month' && <MonthView data={{ ...data, reservations: getFilteredReservations() }} currentDate={currentDate} isAnimating={isAnimating} />}
        {view === 'week' && <WeekView data={{ ...data, reservations: getFilteredReservations() }} currentDate={currentDate} isAnimating={isAnimating} />}
        {view === 'list' && <ListView data={{ ...data, reservations: getFilteredReservations() }} currentDate={currentDate} isAnimating={isAnimating} />}
      </div>
    </div>
  );
};

const MonthView = ({ data, currentDate, isAnimating }) => {
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getEventsForWeek = () => {
    const days = getDaysInMonth();
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    
    return weeks.map(week => {
      const weekEvents = [];
      data.reservations.forEach(event => {
        const eventStart = new Date(event.startDate);
        const eventEnd = new Date(event.endDate);
        eventStart.setHours(0, 0, 0, 0);
        eventEnd.setHours(0, 0, 0, 0);
        
        let foundStart = false;
        let startDay = -1;
        let span = 0;
        
        week.forEach((day, dayIndex) => {
          if (!day) return;
          const dayDate = new Date(day);
          dayDate.setHours(0, 0, 0, 0);
          
          if (dayDate >= eventStart && dayDate <= eventEnd) {
            if (!foundStart) {
              foundStart = true;
              startDay = dayIndex;
            }
            span++;
          }
        });
        
        if (foundStart) {
          weekEvents.push({ ...event, startDay, span });
        }
      });
      return { week, events: weekEvents };
    });
  };

  const weeks = getEventsForWeek();

  return (
    <div className={`border border-gray-200 rounded-xl transition-opacity duration-150 overflow-x-auto ${
      isAnimating ? 'opacity-0' : 'opacity-100'
    }`}>
      <div className="min-w-[800px]">
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500 border-r border-gray-200 last:border-r-0">
              {day}
            </div>
          ))}
        </div>
        {weeks.map((weekData, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 relative">
            {weekData.week.map((day, dayIndex) => {
              const isToday = day && day.toDateString() === new Date().toDateString();
              return (
                <div
                  key={dayIndex}
                  className={`min-h-[140px] border-r border-b border-gray-200 last:border-r-0 p-2 relative ${
                    day ? 'bg-white hover:bg-gray-50 transition-colors' : 'bg-gray-50/50'
                  }`}
                >
                  {day && (
                    <div className={`text-sm mb-2 flex items-center justify-center w-7 h-7 rounded-full ${
                      isToday ? 'bg-blue-600 text-white font-bold' : 'text-gray-700 font-medium whitespace-nowrap'
                    }`}>
                      {day.getDate()}
                    </div>
                  )}
                </div>
              );
            })}
            <div className="absolute top-10 left-0 right-0 space-y-1.5 px-2 pointer-events-none">
              {weekData.events.slice(0, 4).map((event, idx) => {
                const isFirstWeek = weekIndex === 0 || event.startDay > 0;
                const isLastWeek = weekIndex === weeks.length - 1 || event.startDay + event.span < 7;
                return (
                  <div
                    key={event.id}
                    className={`text-[11px] font-medium px-2.5 py-1.5 text-white truncate pointer-events-auto cursor-pointer shadow-sm hover:opacity-90 transition-opacity ${RESERVATION_STATUS[event.status].color} ${
                      isFirstWeek && isLastWeek ? 'rounded-md' : isFirstWeek ? 'rounded-l-md' : isLastWeek ? 'rounded-r-md' : ''
                    }`}
                    style={{
                      gridColumn: `${event.startDay + 1} / span ${event.span}`,
                      marginLeft: `${event.startDay * 14.28}%`,
                      width: `calc(${event.span * 14.28}% - 4px)`
                    }}
                    title={`${event.user.firstName} ${event.user.lastName} - ${event.vehicle.brand} ${event.vehicle.model} (${event.vehicle.licensePlate})`}
                  >
                    {event.vehicle.brand} {event.vehicle.model} ({event.user.firstName})
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const WeekView = ({ data, currentDate, isAnimating }) => {
  const getWeekDays = () => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay());
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getEventsForDay = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return data.reservations.filter(r => {
      const start = new Date(r.startDate).toISOString().split('T')[0];
      const end = new Date(r.endDate).toISOString().split('T')[0];
      return dateStr >= start && dateStr <= end;
    });
  };

  const getEventsForWeek = () => {
    const weekDays = getWeekDays();
    const weekEvents = [];
    
    data.reservations.forEach(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      eventStart.setHours(0, 0, 0, 0);
      eventEnd.setHours(0, 0, 0, 0);
      
      let foundStart = false;
      let startDay = -1;
      let span = 0;
      
      weekDays.forEach((day, dayIndex) => {
        const dayDate = new Date(day);
        dayDate.setHours(0, 0, 0, 0);
        
        if (dayDate >= eventStart && dayDate <= eventEnd) {
          if (!foundStart) {
            foundStart = true;
            startDay = dayIndex;
          }
          span++;
        }
      });
      
      if (foundStart) {
        weekEvents.push({ ...event, startDay, span });
      }
    });
    
    return weekEvents;
  };

  const weekDays = getWeekDays();
  const weekEvents = getEventsForWeek();
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className={`border border-gray-200 rounded-xl transition-opacity duration-150 overflow-x-auto ${
      isAnimating ? 'opacity-0' : 'opacity-100'
    }`}>
      <div className="min-w-[800px]">
        <div className="grid grid-cols-8 bg-gray-50 border-b border-gray-200">
          <div className="border-r border-gray-200"></div>
          {weekDays.map((day, i) => {
            const isToday = day.toDateString() === new Date().toDateString();
            return (
              <div key={i} className="text-center py-3.5 border-r border-gray-200 last:border-r-0">
                <div className={`text-xs font-bold uppercase tracking-wide ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  <div className={`text-base font-semibold mt-0.5 ${isToday ? 'text-blue-600' : 'text-gray-800'}`}>
                    {day.getDate()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-8 relative">
          <div className="border-r border-gray-200 py-2.5 px-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider border-b bg-gray-50 text-center">all-day</div>
          {weekDays.map((day, i) => (
            <div key={i} className="border-r border-gray-200 last:border-r-0 border-b min-h-[85px] bg-white"></div>
          ))}
          <div className="absolute top-0 left-0 right-0 pt-2.5 px-2 space-y-1.5 pointer-events-none" style={{ marginLeft: '12.5%' }}>
            {weekEvents.map((event) => (
              <div
                key={event.id}
                className={`text-[11px] font-medium px-2 py-1.5 text-white truncate pointer-events-auto cursor-pointer rounded-md shadow-sm hover:opacity-90 ${RESERVATION_STATUS[event.status].color}`}
                style={{
                  marginLeft: `${event.startDay * 12.5}%`,
                  width: `calc(${event.span * 12.5}% - 4px)`
                }}
                title={`${event.user.firstName} ${event.user.lastName} - ${event.vehicle.brand} ${event.vehicle.model} (${event.vehicle.licensePlate})`}
              >
                {event.vehicle.brand} {event.vehicle.model} ({event.user.firstName})
              </div>
            ))}
          </div>
        </div>
        <div className="max-h-[500px] overflow-y-auto w-full custom-scrollbar">
          <div className="grid grid-cols-8 min-w-[800px]">
            <div className="border-r border-gray-200 bg-gray-50/50">
              {hours.map(hour => (
                <div key={hour} className="h-16 relative border-b border-gray-200">
                  <span className="absolute -top-2.5 right-2 text-[10px] font-semibold text-gray-400">
                    {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                  </span>
                </div>
              ))}
            </div>
            {weekDays.map((day, i) => (
              <div key={i} className="border-r border-gray-200 last:border-r-0">
                {hours.map(hour => (
                  <div key={hour} className="h-16 border-b border-gray-200 bg-white hover:bg-gray-50 transition-colors"></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ListView = ({ data, currentDate, isAnimating }) => {
  const getWeekDays = () => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay());
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getEventsForDay = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return data.reservations.filter(r => {
      const start = new Date(r.startDate).toISOString().split('T')[0];
      const end = new Date(r.endDate).toISOString().split('T')[0];
      return dateStr >= start && dateStr <= end;
    });
  };

  const weekDays = getWeekDays();

  return (
    <div className={`space-y-6 transition-opacity duration-150 ${
      isAnimating ? 'opacity-0' : 'opacity-100'
    }`}>
      {weekDays.map((day, i) => {
        const events = getEventsForDay(day);
        return (
          <div key={i}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800">
                {day.toLocaleDateString('en-US', { weekday: 'long' })}
              </h3>
              <span className="text-sm text-blue-600 font-medium">
                {day.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            {events.length > 0 ? (
              <div className="space-y-2">
                {events.map(event => (
                  <div key={event.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className="text-sm text-gray-600 w-20">all-day</div>
                    <div className={`w-3 h-3 rounded-full ${RESERVATION_STATUS[event.status].color}`}></div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">
                        {event.vehicle.brand} {event.vehicle.model} — {event.user.firstName} {event.user.lastName}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">No reservations</div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Planning;
