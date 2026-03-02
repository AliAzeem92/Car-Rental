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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Planning & Calendar</h1>
        <button
          onClick={() => navigate('/dashboard/reservations')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition"
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

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => view === 'month' ? changeMonth(-1) : changeWeek(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => view === 'month' ? changeMonth(1) : changeWeek(1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition"
            >
              today
            </button>
            <span className="text-xl font-semibold ml-4">
              {view === 'month' ? getMonthName() : getWeekRange()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('month')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                view === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              month
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                view === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              week
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                view === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              list
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
    <div className={`border rounded-lg overflow-hidden transition-opacity duration-150 ${
      isAnimating ? 'opacity-0' : 'opacity-100'
    }`}>
      <div className="grid grid-cols-7 bg-gray-50 border-b">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center py-3 text-sm font-semibold text-blue-600 border-r last:border-r-0">
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
                className={`min-h-32 border-r border-b last:border-r-0 p-2 relative ${
                  day ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'
                }`}
              >
                {day && (
                  <div className={`text-sm font-medium mb-2 ${
                    isToday ? 'text-blue-600 font-bold' : 'text-gray-700'
                  }`}>
                    {day.getDate()}
                  </div>
                )}
              </div>
            );
          })}
          <div className="absolute top-8 left-0 right-0 space-y-1 px-2 pointer-events-none">
            {weekData.events.slice(0, 3).map((event, idx) => {
              const isFirstWeek = weekIndex === 0 || event.startDay > 0;
              const isLastWeek = weekIndex === weeks.length - 1 || event.startDay + event.span < 7;
              return (
                <div
                  key={event.id}
                  className={`text-xs px-2 py-1 text-white truncate pointer-events-auto cursor-pointer ${RESERVATION_STATUS[event.status].color} ${
                    isFirstWeek && isLastWeek ? 'rounded' : isFirstWeek ? 'rounded-l' : isLastWeek ? 'rounded-r' : ''
                  }`}
                  style={{
                    gridColumn: `${event.startDay + 1} / span ${event.span}`,
                    marginLeft: `${event.startDay * 14.28}%`,
                    width: `${event.span * 14.28}%`
                  }}
                  title={`${event.user.firstName} ${event.user.lastName} - ${event.vehicle.brand} ${event.vehicle.model} (${event.vehicle.licensePlate})`}
                >
                  {event.user.firstName} {event.user.lastName} - {event.vehicle.brand} {event.vehicle.model} ({event.vehicle.licensePlate})
                </div>
              );
            })}
          </div>
        </div>
      ))}
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
    <div className={`border rounded-lg overflow-hidden transition-opacity duration-150 ${
      isAnimating ? 'opacity-0' : 'opacity-100'
    }`}>
      <div className="grid grid-cols-8 bg-gray-50 border-b">
        <div className="border-r"></div>
        {weekDays.map((day, i) => {
          const isToday = day.toDateString() === new Date().toDateString();
          return (
            <div key={i} className="text-center py-3 border-r last:border-r-0">
              <div className={`text-sm font-semibold ${isToday ? 'text-blue-600' : 'text-gray-600'}`}>
                {day.toLocaleDateString('en-US', { weekday: 'short' })} {day.getDate()}
              </div>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-8 relative">
        <div className="border-r py-2 px-3 text-xs text-gray-600 font-medium border-b bg-gray-50">all-day</div>
        {weekDays.map((day, i) => (
          <div key={i} className="border-r last:border-r-0 border-b min-h-[80px] bg-white"></div>
        ))}
        <div className="absolute top-0 left-0 right-0 pt-2 px-2 space-y-1 pointer-events-none" style={{ marginLeft: '12.5%' }}>
          {weekEvents.map((event) => (
            <div
              key={event.id}
              className={`text-xs px-2 py-1 text-white truncate pointer-events-auto cursor-pointer rounded ${RESERVATION_STATUS[event.status].color}`}
              style={{
                marginLeft: `${event.startDay * 12.5}%`,
                width: `${event.span * 12.5}%`
              }}
              title={`${event.user.firstName} ${event.user.lastName} - ${event.vehicle.brand} ${event.vehicle.model} (${event.vehicle.licensePlate})`}
            >
              {event.user.firstName} {event.user.lastName} - {event.vehicle.brand} {event.vehicle.model}
            </div>
          ))}
        </div>
      </div>
      <div className="max-h-[600px] overflow-y-auto">
        <div className="grid grid-cols-8">
          <div className="border-r">
            {hours.map(hour => (
              <div key={hour} className="py-4 px-3 text-xs text-gray-600 border-b">
                {hour === 0 ? '12am' : hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour - 12}pm`}
              </div>
            ))}
          </div>
          {weekDays.map((day, i) => (
            <div key={i} className="border-r last:border-r-0">
              {hours.map(hour => (
                <div key={hour} className="py-4 px-2 border-b bg-white hover:bg-blue-50"></div>
              ))}
            </div>
          ))}
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
