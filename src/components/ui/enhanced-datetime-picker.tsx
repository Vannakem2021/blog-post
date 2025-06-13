"use client";

import { useState, useRef, useEffect } from "react";
import {
  CalendarIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

interface EnhancedDateTimePickerProps {
  value?: string; // ISO string or datetime-local format
  onChange: (value: string) => void;
  minDate?: Date;
  timezone?: string;
  className?: string;
  required?: boolean;
  placeholder?: string;
}

export function EnhancedDateTimePicker({
  value = "",
  onChange,
  minDate = new Date(),
  timezone = "Asia/Phnom_Penh",
  className,
  required = false,
  placeholder = "Select date and time",
}: EnhancedDateTimePickerProps) {
  const [selectedDateTime, setSelectedDateTime] = useState<string>(
    value ? new Date(value).toISOString().slice(0, 16) : ""
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(
    value ? new Date(value).toISOString().slice(0, 10) : ""
  );
  const [selectedTime, setSelectedTime] = useState<{
    hours: number;
    minutes: number;
    period: "AM" | "PM";
  }>(() => {
    if (value) {
      const date = new Date(value);
      const hours = date.getHours();
      return {
        hours: hours === 0 ? 12 : hours > 12 ? hours - 12 : hours,
        minutes: date.getMinutes(),
        period: hours >= 12 ? "PM" : "AM",
      };
    }
    return { hours: 12, minutes: 30, period: "PM" };
  });

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(() => {
    const date = value ? new Date(value) : new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const timePickerRef = useRef<HTMLDivElement>(null);

  // Update internal state when value prop changes
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      const dateTimeLocal = date.toISOString().slice(0, 16);
      setSelectedDateTime(dateTimeLocal);
      setSelectedDate(date.toISOString().slice(0, 10));
      setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));

      const hours = date.getHours();
      setSelectedTime({
        hours: hours === 0 ? 12 : hours > 12 ? hours - 12 : hours,
        minutes: date.getMinutes(),
        period: hours >= 12 ? "PM" : "AM",
      });
    } else {
      setSelectedDateTime("");
      setSelectedDate("");
      setSelectedTime({ hours: 12, minutes: 30, period: "PM" });
    }
  }, [value]);

  // Handle date change
  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    updateDateTime(newDate, selectedTime);
  };

  // Handle time change
  const handleTimeChange = (newTime: typeof selectedTime) => {
    setSelectedTime(newTime);
    updateDateTime(selectedDate, newTime);
  };

  // Update combined datetime
  const updateDateTime = (date: string, time: typeof selectedTime) => {
    if (date && time) {
      let hours = time.hours;
      if (time.period === "PM" && hours !== 12) hours += 12;
      if (time.period === "AM" && hours === 12) hours = 0;

      const dateTime = new Date(date);
      dateTime.setHours(hours, time.minutes, 0, 0);

      const dateTimeLocal = dateTime.toISOString().slice(0, 16);
      setSelectedDateTime(dateTimeLocal);
      onChange(dateTime.toISOString());
    }
  };

  // Handle direct datetime input change
  const handleDateTimeChange = (newDateTime: string) => {
    setSelectedDateTime(newDateTime);

    if (newDateTime) {
      const date = new Date(newDateTime);
      setSelectedDate(date.toISOString().slice(0, 10));

      const hours = date.getHours();
      setSelectedTime({
        hours: hours === 0 ? 12 : hours > 12 ? hours - 12 : hours,
        minutes: date.getMinutes(),
        period: hours >= 12 ? "PM" : "AM",
      });

      onChange(date.toISOString());
    } else {
      onChange("");
    }
  };

  const formatDisplayValue = () => {
    if (selectedDateTime) {
      const date = new Date(selectedDateTime);
      return date.toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
    return placeholder;
  };

  // Get minimum datetime-local string for input validation
  const getMinDateTimeString = () => {
    return minDate.toISOString().slice(0, 16);
  };

  // Close pickers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setShowDatePicker(false);
      }
      if (
        timePickerRef.current &&
        !timePickerRef.current.contains(event.target as Node)
      ) {
        setShowTimePicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return "Select date";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTimeDisplay = (time: typeof selectedTime) => {
    return `${time.hours}:${time.minutes.toString().padStart(2, "0")} ${
      time.period
    }`;
  };

  // Generate time options
  const timeOptions = [];
  for (let hour = 1; hour <= 12; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      for (const period of ["AM", "PM"]) {
        timeOptions.push({
          hours: hour,
          minutes: minute,
          period: period as "AM" | "PM",
          display: `${hour}:${minute.toString().padStart(2, "0")} ${period}`,
        });
      }
    }
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Modern Date and Time Inputs */}
      <div className="space-y-4">
        <div className="text-sm font-medium text-gray-700 mb-3">
          Choose a day and time in the future you want your post to be
          published.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
          {/* Date Input */}
          <div className="relative min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <button
              type="button"
              onClick={() => {
                setShowDatePicker(!showDatePicker);
                setShowTimePicker(false);
              }}
              className={cn(
                "w-full p-3 text-left rounded-lg border border-gray-300 min-w-0",
                "bg-white hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                "flex items-center justify-between transition-all duration-200",
                !selectedDate && "text-gray-500"
              )}
            >
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm font-medium whitespace-nowrap">
                  {formatDateDisplay(selectedDate)}
                </span>
              </div>
            </button>

            {/* Calendar Popup */}
            {showDatePicker && (
              <div
                ref={datePickerRef}
                className="absolute top-full left-0 mt-2 z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 min-w-[300px]"
              >
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentMonth(
                        new Date(
                          currentMonth.getFullYear(),
                          currentMonth.getMonth() - 1,
                          1
                        )
                      )
                    }
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </button>
                  <h3 className="text-sm font-semibold">
                    {currentMonth.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentMonth(
                        new Date(
                          currentMonth.getFullYear(),
                          currentMonth.getMonth() + 1,
                          1
                        )
                      )
                    }
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  {/* Day Headers */}
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                    <div key={day} className="p-2 font-medium text-gray-500">
                      {day}
                    </div>
                  ))}

                  {/* Calendar Days */}
                  {Array.from(
                    { length: getFirstDayOfMonth(currentMonth) },
                    (_, i) => (
                      <div key={`empty-${i}`} className="p-2"></div>
                    )
                  )}

                  {Array.from(
                    { length: getDaysInMonth(currentMonth) },
                    (_, i) => {
                      const day = i + 1;
                      const dateStr = new Date(
                        currentMonth.getFullYear(),
                        currentMonth.getMonth(),
                        day
                      )
                        .toISOString()
                        .slice(0, 10);

                      const isSelected = selectedDate === dateStr;
                      const isToday =
                        dateStr === new Date().toISOString().slice(0, 10);
                      const isDisabled = new Date(dateStr) < minDate;

                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            if (!isDisabled) {
                              handleDateChange(dateStr);
                              setShowDatePicker(false);
                            }
                          }}
                          disabled={isDisabled}
                          className={cn(
                            "p-2 rounded-full text-sm font-medium transition-colors",
                            isSelected && "bg-blue-500 text-white",
                            !isSelected && !isDisabled && "hover:bg-gray-100",
                            isToday &&
                              !isSelected &&
                              "bg-blue-50 text-blue-600",
                            isDisabled && "text-gray-300 cursor-not-allowed"
                          )}
                        >
                          {day}
                        </button>
                      );
                    }
                  )}
                </div>

                {/* Clear Button */}
                <div className="flex justify-end mt-4 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowDatePicker(false)}
                    className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Time Input */}
          <div className="relative min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time
            </label>
            <button
              type="button"
              onClick={() => {
                setShowTimePicker(!showTimePicker);
                setShowDatePicker(false);
              }}
              className={cn(
                "w-full p-3 text-left rounded-lg border border-gray-300 min-w-0",
                "bg-white hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                "flex items-center justify-between transition-all duration-200"
              )}
            >
              <div className="flex items-center space-x-2">
                <ClockIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm font-medium whitespace-nowrap">
                  {formatTimeDisplay(selectedTime)}
                </span>
              </div>
              <ChevronDownIcon
                className={cn(
                  "h-4 w-4 text-gray-500 transition-transform duration-200",
                  showTimePicker && "rotate-180"
                )}
              />
            </button>

            {/* Time Picker Dropdown */}
            {showTimePicker && (
              <div
                ref={timePickerRef}
                className="absolute top-full left-0 mt-2 z-50 bg-white rounded-lg shadow-xl border border-gray-200 min-w-[200px] max-h-[200px] overflow-y-auto"
              >
                <div className="p-2">
                  {/* Current Time Display */}
                  <div className="flex items-center justify-between p-2 border-b border-gray-100 mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {formatTimeDisplay(selectedTime)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowTimePicker(false)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <XMarkIcon className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>

                  {/* Time Options List */}
                  <div className="space-y-1">
                    {timeOptions.map((option, index) => {
                      const isSelected =
                        option.hours === selectedTime.hours &&
                        option.minutes === selectedTime.minutes &&
                        option.period === selectedTime.period;

                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            handleTimeChange(option);
                            setShowTimePicker(false);
                          }}
                          className={cn(
                            "w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
                            isSelected
                              ? "bg-blue-500 text-white"
                              : "hover:bg-gray-100 text-gray-900"
                          )}
                        >
                          {option.display}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Timezone Display */}
      <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-blue-600">🌍</span>
          <span className="font-medium text-blue-800">Timezone:</span>
          <span className="font-semibold text-blue-900">{timezone}</span>
        </div>
      </div>
    </div>
  );
}
