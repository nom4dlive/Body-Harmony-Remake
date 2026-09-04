import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  FaChevronLeft, FaChevronRight, FaCalendarAlt, FaClock, 
  FaPlus, FaExclamationCircle, FaCheckCircle, FaUser, FaRegCalendarCheck
} from 'react-icons/fa';

const CalendarWrapper = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
  font-family: 'Montserrat', sans-serif;
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;
`;

const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;

  h2 {
    color: #0a3e60;
    font-size: 1.35rem;
    font-weight: 800;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    span {
      color: #ed7e13;
    }
  }
`;

const TodayBtn = styled.button`
  padding: 0.35rem 0.85rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  background: #f1f5f9;
  color: #0a3e60;
  border: 1px solid #cbd5e1;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #ed7e13;
    color: white;
    border-color: #ed7e13;
  }
`;

const ControlsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const NavBtn = styled.button`
  width: 38px;
  height: 38px;
  min-width: 38px;
  min-height: 38px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: white;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #0a3e60;
    color: #0a3e60;
    background: #f8fafc;
  }
`;

const QuickAddBtn = styled.button`
  height: 38px;
  min-height: 38px;
  padding: 0 1rem;
  border-radius: 8px;
  background: #ed7e13;
  color: white;
  border: none;
  font-weight: 700;
  font-size: 0.82rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #d96d07;
    transform: translateY(-1px);
  }
`;

/* WEEKDAY HEADERS */
const WeekdayGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 8px;
  text-align: center;
`;

const WeekdayCell = styled.div`
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  padding: 0.5rem 0;
  color: ${props => props.$isWeekend ? '#ed7e13' : '#64748b'};
  letter-spacing: 0.5px;
`;

/* DAYS GRID (7 REAL COLUMNS) */
const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 8px;

  @media (max-width: 768px) {
    gap: 4px;
  }
`;

const EmptyDayCell = styled.div`
  min-height: 110px;
  border-radius: 12px;
  border: 1px dashed #e2e8f0;
  background: #f8fafc;
  opacity: 0.4;
`;

const DayCell = styled.div`
  min-height: 110px;
  padding: 0.6rem 0.5rem;
  border-radius: 12px;
  border: 1px solid ${props => props.$isToday ? '#ed7e13' : '#e2e8f0'};
  background: ${props => props.$isToday ? 'rgba(237, 126, 19, 0.04)' : '#ffffff'};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.2s;
  box-shadow: ${props => props.$isToday ? '0 0 0 1px #ed7e13' : 'none'};

  &:hover {
    border-color: #0a3e60;
    box-shadow: 0 4px 12px rgba(10, 62, 96, 0.08);
  }
`;

const DayHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
`;

const DayNumber = styled.span`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 800;
  background: ${props => props.$isToday ? '#ed7e13' : 'transparent'};
  color: ${props => props.$isToday ? '#ffffff' : '#0a3e60'};
`;

const DayItemsCount = styled.span`
  font-size: 0.68rem;
  font-weight: 700;
  color: #94a3b8;
`;

const EventsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
  max-height: 80px;
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    width: 3px;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
`;

const EventPill = styled.div`
  padding: 4px 6px;
  border-radius: 6px;
  font-size: 0.72rem;
  cursor: pointer;
  background: #f8fafc;
  border-left: 3px solid ${props => props.$color || '#0a3e60'};
  border-top: 1px solid #e2e8f0;
  border-right: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
  transition: all 0.15s;
  display: flex;
  flex-direction: column;
  gap: 2px;

  &:hover {
    transform: scale(1.02);
    background: white;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
    border-color: #cbd5e1;
  }
`;

const PillTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 4px;

  span.title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #0a3e60;
    font-weight: 700;
    font-size: 0.72rem;
  }
`;

const PillTime = styled.div`
  font-size: 0.65rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 3px;
`;

const PriorityBadge = styled.span`
  font-size: 0.58rem;
  padding: 1px 4px;
  border-radius: 4px;
  font-weight: 800;
  text-transform: uppercase;
  color: white;
  background: ${props => {
    switch (props.$priority) {
      case 'critica': return '#ef4444';
      case 'alta': return '#f97316';
      case 'media': return '#f59e0b';
      default: return '#3b82f6';
    }
  }};
`;

export default function AgendaCalendarView({ events, onSelectEvent, onCreateEvent }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const today = () => setCurrentDate(new Date());

  const getEventsForDay = (day) => {
    const targetDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => {
      if (!e.start_datetime) return false;
      const eventDate = e.start_datetime.substring(0, 10);
      return eventDate === targetDateStr;
    });
  };

  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'urgencia': return '🚨';
      case 'agendamento_cliente': return '📅';
      case 'evento_geral': return '🏢';
      default: return '📌';
    }
  };

  return (
    <CalendarWrapper>
      {/* Calendar Header Controls */}
      <CalendarHeader>
        <TitleGroup>
          <h2>
            {monthNames[month]} <span>{year}</span>
          </h2>
          <TodayBtn onClick={today}>
            Hoje
          </TodayBtn>
        </TitleGroup>

        <ControlsGroup>
          <NavBtn onClick={prevMonth} title="Mês Anterior">
            <FaChevronLeft size={12} />
          </NavBtn>
          <NavBtn onClick={nextMonth} title="Próximo Mês">
            <FaChevronRight size={12} />
          </NavBtn>
          <QuickAddBtn onClick={onCreateEvent}>
            <FaPlus size={11} /> Novo Evento
          </QuickAddBtn>
        </ControlsGroup>
      </CalendarHeader>

      {/* Weekday Headers */}
      <WeekdayGrid>
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, idx) => (
          <WeekdayCell key={day} $isWeekend={idx === 0 || idx === 6}>
            {day}
          </WeekdayCell>
        ))}
      </WeekdayGrid>

      {/* Calendar Days Grid */}
      <DaysGrid>
        {/* Empty slots for month start offset */}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <EmptyDayCell key={`empty-${i}`} />
        ))}

        {/* Days of the month */}
        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const day = idx + 1;
          const dayEvents = getEventsForDay(day);
          const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

          return (
            <DayCell key={`day-${day}`} $isToday={isToday}>
              <DayHeader>
                <DayNumber $isToday={isToday}>
                  {day}
                </DayNumber>
                {dayEvents.length > 0 && (
                  <DayItemsCount>
                    {dayEvents.length} {dayEvents.length === 1 ? 'item' : 'itens'}
                  </DayItemsCount>
                )}
              </DayHeader>

              {/* Event Pills */}
              <EventsList>
                {dayEvents.map((evt) => (
                  <EventPill
                    key={evt.id}
                    $color={evt.color}
                    onClick={() => onSelectEvent(evt)}
                  >
                    <PillTop>
                      <span className="title">
                        {getEventTypeIcon(evt.event_type)} {evt.title}
                      </span>
                      <PriorityBadge $priority={evt.priority}>
                        {evt.priority.substring(0, 1)}
                      </PriorityBadge>
                    </PillTop>
                    {evt.start_datetime && (
                      <PillTime>
                        <FaClock size={9} />
                        {evt.start_datetime.substring(11, 16)}
                      </PillTime>
                    )}
                  </EventPill>
                ))}
              </EventsList>
            </DayCell>
          );
        })}
      </DaysGrid>
    </CalendarWrapper>
  );
}
