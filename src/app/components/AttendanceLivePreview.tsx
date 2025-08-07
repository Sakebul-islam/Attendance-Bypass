"use client";

import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  Shield,
  Network,
  Server,
  X,
  CheckCircle,
} from "lucide-react";

export default function AttendanceLivePreview() {
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  interface AttemptState {
    method: string;
    phase:
      | "connecting"
      | "sending_headers"
      | "server_validation"
      | "success"
      | "failed";
  }
  const [currentAttempt, setCurrentAttempt] = useState<AttemptState | null>(
    null
  );
  const [userActualIP, setUserActualIP] = useState<string>("Fetching...");

  // Fetch user's actual IP address on component mount
  useEffect(() => {
    const fetchIP = async () => {
      try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        setUserActualIP(data.ip);
      } catch (error) {
        console.error("Error fetching IP:", error);
        setUserActualIP("Error fetching IP");
      }
    };

    fetchIP();
  }, []);
  interface AttendanceResult {
    id: number;
    method: string;
    timestamp: string;
    success: boolean;
    actualIP: string;
    attemptedIP: string;
    headers: Record<string, string>;
    error: string | null;
    detectionMethod: string;
    serverResponse: {
      status: number;
      message?: string;
      error?: string;
      submitted_as_ip?: string;
      details?: unknown;
    };
  }

  const [results, setResults] = useState<AttendanceResult[]>([]);
  // Removed showCode and setShowCode
  // Attendance data from API
  interface AttendanceRecord {
    id: number;
    employee_id: number;
    employee_name: string;
    date: string;
    time: string;
    type: string;
  }
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);

  useEffect(() => {
    setAttendanceLoading(true);
    setAttendanceError(null);
    fetch("https://admin.unlocklive.com/api/attendance/?format=json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch attendance data");
        return res.json();
      })
      .then((data) => {
        setAttendanceData(data);
        setAttendanceLoading(false);
      })
      .catch((err) => {
        setAttendanceError(err.message || "Unknown error");
        setAttendanceLoading(false);
      });
  }, []);

  // Always use user's local time for date default
  const getLocalToday = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 10);
  };

  // Format "HH:mm:ss.SSSSSS" to 12-hour AM/PM
  function formatTimeToAMPM(time: string): string {
    if (!time) return "";
    // Handle possible fractional seconds
    const [hms] = time.split(".");
    const [hour, minute, second] = hms.split(":").map(Number);
    if (isNaN(hour) || isNaN(minute) || isNaN(second)) return time;
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}:${second.toString().padStart(2, "0")} ${ampm}`;
  }

  const [selectedDate, setSelectedDate] = useState(getLocalToday());

  // Employee data extracted from attendance records (updated with latest data)
  const employees = [
    { id: 2, name: "Mahmuda" },
    { id: 5, name: "Sanjib" },
    { id: 6, name: "Murad" },
    { id: 7, name: "Hasan" },
    { id: 8, name: "Sakebul" },
    { id: 11, name: "Jahid" },
    { id: 16, name: "Masum" },
    { id: 31, name: "AbdulKadir" },
    { id: 32, name: "Sajeeb" },
    { id: 35, name: "Veasin Arafat" },
  ];

  // Get current employee details
  const getCurrentEmployee = () => {
    if (!selectedEmployee) {
      return { id: 0, name: "No employee selected" };
    }
    const [id, name] = selectedEmployee.split("-");
    return { id: parseInt(id), name };
  };

  // (Bypass method kept for logic only, not for UI display)
  const bypassMethod = {
    name: "IP Bypass",
    description: "Forward client IP to attendance system",
    headers: {
      "X-Forwarded-For": "Client IP",
      "X-Real-IP": "Client IP",
    },
  };

  const [viewMode, setViewMode] = useState<"in" | "out" | "latest" | "all">(
    "all"
  );

  const [attendancePage, setAttendancePage] = useState(1);
  const ATTENDANCE_PER_PAGE = 10;
  let filteredAttendance: AttendanceRecord[] = [];
  if (viewMode === "in" || viewMode === "out") {
    filteredAttendance = attendanceData.filter(
      (rec) => rec.date === selectedDate && rec.type === viewMode
    );
  } else if (viewMode === "latest") {
    // Show latest record (in or out) per employee for the selected date
    const latestMap = new Map<number, AttendanceRecord>();
    attendanceData.forEach((rec) => {
      if (rec.date === selectedDate) {
        const prev = latestMap.get(rec.employee_id);
        if (!prev || rec.time > prev.time) {
          latestMap.set(rec.employee_id, rec);
        }
      }
    });
    filteredAttendance = Array.from(latestMap.values()).sort((a, b) =>
      b.time.localeCompare(a.time)
    );
  } else if (viewMode === "all") {
    filteredAttendance = attendanceData
      .filter((rec) => rec.date === selectedDate)
      .sort((a, b) => b.time.localeCompare(a.time));
  }

  const simulateAttendanceSubmission = async () => {
    setIsLoading(true);
    setCurrentAttempt({
      method: bypassMethod.name,
      phase: "connecting",
    });

    try {
      // Phase 1: Connecting
      await new Promise((resolve) => setTimeout(resolve, 800));
      setCurrentAttempt((prev) =>
        prev ? { ...prev, phase: "sending_headers" } : null
      );

      // Phase 2: Sending headers through our bypass API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setCurrentAttempt((prev) =>
        prev ? { ...prev, phase: "server_validation" } : null
      );

      // Phase 3: Making real API call through our bypass
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employee_id: getCurrentEmployee().id,
          employee_name: getCurrentEmployee().name,
        }),
      });

      const data = await response.json();

      await new Promise((resolve) => setTimeout(resolve, 500));

      // Check if the response indicates success (status 200 and no error)
      const isSuccess = response.ok && !data.error;

      const result = {
        id: Date.now(),
        method: bypassMethod.name,
        timestamp: new Date().toLocaleTimeString(),
        success: isSuccess,
        actualIP: isSuccess ? "103.98.107.98" : "116.204.148.43",
        attemptedIP: "103.98.107.98",
        headers: bypassMethod.headers,
        error: isSuccess ? null : data.error || "Attendance submission failed",
        detectionMethod: isSuccess ? "Bypass Successful" : "Server Rejection",
        serverResponse: {
          status: response.status,
          message: isSuccess
            ? "Attendance submitted successfully!"
            : data.error || "Submission failed",
          submitted_as_ip: "103.98.107.98",
          details: data.details || data,
        },
      };

      setResults((prev) => [result, ...prev.slice(0, 4)]);
      setCurrentAttempt((prev) =>
        prev ? { ...prev, phase: isSuccess ? "success" : "failed" } : null
      );

      // Show success/failure phase for a moment
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Submission error:", error);

      const result: AttendanceResult = {
        id: Date.now(),
        method: bypassMethod.name,
        timestamp: new Date().toLocaleTimeString(),
        success: false,
        actualIP: "116.204.148.43",
        attemptedIP: "103.98.107.98",
        headers: bypassMethod.headers,
        error: "Network error or API unavailable",
        detectionMethod: "Connection Failed",
        serverResponse: {
          status: 500,
          error: error instanceof Error ? error.message : String(error),
        },
      };

      setResults((prev) => [result, ...prev.slice(0, 4)]);
      setCurrentAttempt((prev) => (prev ? { ...prev, phase: "failed" } : null));
    }

    setCurrentAttempt(null);
    setIsLoading(false);
  };

  const getPhaseMessage = (phase: string) => {
    switch (phase) {
      case "connecting":
        return "Establishing connection to admin.unlocklive.com...";
      case "sending_headers":
        return "Sending request through bypass API...";
      case "server_validation":
        return "Server validating IP address...";
      case "success":
        return "✅ Attendance submitted successfully as office IP!";
      case "failed":
        return "❌ Submission failed - bypass unsuccessful";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white p-4 pt-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Attendance Bypass
          </h1>
          <p className="text-gray-300">
            Real-time demonstration of IP bypass attempts
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Attendance IN/OUT Box */}
          <div className="bg-gray-800/80 backdrop-blur rounded-xl p-6 border border-gray-600 mb-6 lg:mb-0">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Network className="h-5 w-5 mr-2 text-green-400" />
              Employee IN/OUT Records
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setAttendancePage(1);
                }}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white mb-2"
              />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                <button
                  className={`px-3 py-2 text-sm rounded transition cursor-pointer ${
                    viewMode === "all"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-700 text-gray-300"
                  }`}
                  onClick={() => {
                    setViewMode("all");
                    setAttendancePage(1);
                  }}
                  type="button"
                >
                  All
                </button>
                <button
                  className={`px-3 py-2 text-sm rounded transition cursor-pointer ${
                    viewMode === "latest"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-700 text-gray-300"
                  }`}
                  onClick={() => {
                    setViewMode("latest");
                    setAttendancePage(1);
                  }}
                  type="button"
                >
                  Latest
                </button>
                <button
                  className={`px-3 py-2 text-sm rounded transition cursor-pointer ${
                    viewMode === "in"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-700 text-gray-300"
                  }`}
                  onClick={() => {
                    setViewMode("in");
                    setAttendancePage(1);
                  }}
                  type="button"
                >
                  IN Only
                </button>
                <button
                  className={`px-3 py-2 text-sm rounded transition cursor-pointer ${
                    viewMode === "out"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-700 text-gray-300"
                  }`}
                  onClick={() => {
                    setViewMode("out");
                    setAttendancePage(1);
                  }}
                  type="button"
                >
                  OUT Only
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              {attendanceLoading ? (
                <div className="py-8 text-center text-blue-400">
                  Loading attendance data...
                </div>
              ) : attendanceError ? (
                <div className="py-8 text-center text-red-400">
                  Error: {attendanceError}
                </div>
              ) : (
                <table className="min-w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="py-2 px-3">Employee</th>
                      <th className="py-2 px-3">Time</th>
                      <th className="py-2 px-3">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttendance.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="py-4 text-center text-gray-400"
                        >
                          No records for this date
                        </td>
                      </tr>
                    ) : (
                      filteredAttendance
                        .slice(
                          (attendancePage - 1) * ATTENDANCE_PER_PAGE,
                          attendancePage * ATTENDANCE_PER_PAGE
                        )
                        .map((attendance) => (
                          <tr key={attendance.id}>
                            <td className="py-2 px-3">
                              {attendance.employee_name}
                            </td>
                            <td className="py-2 px-3">
                              {formatTimeToAMPM(attendance.time)}
                            </td>
                            <td className="py-2 px-3 capitalize">
                              {attendance.type}
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              )}
              {/* Pagination Controls */}
              {filteredAttendance.length > ATTENDANCE_PER_PAGE && (
                <div className="flex justify-center items-center gap-4 mt-4">
                  <button
                    onClick={() => setAttendancePage((p) => Math.max(1, p - 1))}
                    disabled={attendancePage === 1}
                    className="px-3 py-1 text-sm rounded bg-gray-700 text-gray-200 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-400">
                    Page {attendancePage} of{" "}
                    {Math.ceil(filteredAttendance.length / ATTENDANCE_PER_PAGE)}
                  </span>
                  <button
                    onClick={() =>
                      setAttendancePage((p) =>
                        Math.min(
                          Math.ceil(
                            filteredAttendance.length / ATTENDANCE_PER_PAGE
                          ),
                          p + 1
                        )
                      )
                    }
                    disabled={
                      attendancePage ===
                      Math.ceil(filteredAttendance.length / ATTENDANCE_PER_PAGE)
                    }
                    className="px-3 py-1 text-sm rounded bg-gray-700 text-gray-200 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* Control Panel */}
          <div className="bg-gray-800/80 backdrop-blur rounded-xl p-6 border border-gray-600">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-blue-400" />
              Control Panel
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Employee
                </label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                >
                  <option value="" disabled className="text-gray-500">
                    -- Select an employee --
                  </option>
                  {employees.map((emp, index) => (
                    <option
                      key={`${emp.id}-${emp.name}-${index}`}
                      value={`${emp.id}-${emp.name}`}
                      className="bg-gray-700"
                    >
                      ID: {emp.id} - {emp.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-sm text-gray-400">
                <span className="font-medium">Selected:</span> ID{" "}
                {getCurrentEmployee().id} - {getCurrentEmployee().name}
              </div>

              <div className="pt-2">
                <button
                  onClick={simulateAttendanceSubmission}
                  disabled={isLoading || !selectedEmployee}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                >
                  {isLoading
                    ? "Running Bypass Attempt..."
                    : selectedEmployee
                    ? "Submit Attendance"
                    : "Select an employee"}
                </button>
              </div>
            </div>

            {/* Attempt Results */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-red-400" />
                Attempt Results
              </h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {results.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    <Server className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No attempts yet</p>
                    <p className="text-xs">
                      Click &quot;Submit Attendance&quot; to see results
                    </p>
                  </div>
                ) : (
                  results.map((result: AttendanceResult) => (
                    <div
                      key={result.id}
                      className={`${
                        result.success
                          ? "bg-green-900/20 border border-green-500/30"
                          : "bg-red-900/20 border border-red-500/30"
                      } rounded-lg p-4`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          {result.success ? (
                            <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                          ) : (
                            <X className="h-4 w-4 text-red-400 mr-2" />
                          )}
                          <span className="font-medium text-sm">
                            {result.method}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {result.timestamp}
                        </span>
                      </div>

                      {result.success ? (
                        <div className="text-xs text-green-300 mb-2">
                          ✅{" "}
                          {result.serverResponse?.message ||
                            "Attendance submitted successfully!"}
                        </div>
                      ) : (
                        <div className="text-xs text-red-300 mb-2">
                          ❌ {result.error}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <div className="text-gray-400">Attempted IP:</div>
                          <div className="font-mono text-green-400">
                            {result.attemptedIP}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400">
                            {result.success
                              ? "Submitted as IP:"
                              : "Detected IP:"}
                          </div>
                          <div
                            className={`font-mono ${
                              result.success ? "text-green-400" : "text-red-400"
                            }`}
                          >
                            {result.actualIP}
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 text-xs">
                        <div className="text-gray-400">Status:</div>
                        <div
                          className={
                            result.success
                              ? "text-green-400"
                              : "text-orange-400"
                          }
                        >
                          {result.detectionMethod}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Live Status Panel */}
          <div className="bg-gray-800/80 backdrop-blur rounded-xl p-6 border border-gray-600">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Network className="h-5 w-5 mr-2 text-green-400" />
              Live Status
            </h2>

            {/* Current Attempt */}
            {currentAttempt && (
              <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">
                    Attempting: {currentAttempt.method}
                  </span>
                  <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
                <div className="text-sm text-blue-300 mb-2">
                  {getPhaseMessage(currentAttempt.phase)}
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width:
                        currentAttempt.phase === "connecting"
                          ? "25%"
                          : currentAttempt.phase === "sending_headers"
                          ? "50%"
                          : currentAttempt.phase === "server_validation"
                          ? "75%"
                          : "100%",
                    }}
                  ></div>
                </div>
              </div>
            )}

            {/* System Info */}
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-gray-400">Target Server:</span>
                <span className="font-mono">admin.unlocklive.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Your Actual IP:</span>
                <span className="font-mono text-red-400">{userActualIP}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Target IP:</span>
                <span className="font-mono text-green-400">103.98.107.98</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Cloudflare Status:</span>
                <span className="text-orange-400">
                  Active (Will detect real IP)
                </span>
              </div>
            </div>

            {/* Network Diagram */}
            <div className="mt-2 mb-6 p-4 bg-gray-900/50 rounded-lg">
              <div className="text-sm font-medium mb-3">Network Path</div>
              <div className="flex items-center justify-between text-xs">
                <div className="text-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-full mb-1"></div>
                  <div>You</div>
                  <div className="text-red-400">Real IP</div>
                </div>
                <div className="flex-1 h-px bg-gray-600 mx-2"></div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-orange-500 rounded-full mb-1"></div>
                  <div>Cloudflare</div>
                  <div className="text-orange-400">Detects</div>
                </div>
                <div className="flex-1 h-px bg-gray-600 mx-2"></div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-red-500 rounded-full mb-1"></div>
                  <div>Server</div>
                  <div className="text-red-400">Rejects</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
