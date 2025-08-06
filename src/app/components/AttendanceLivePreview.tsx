'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, Shield, Code, Network, Server, Play, X, CheckCircle } from 'lucide-react';

export default function AttendanceLivePreview() {
  const [selectedEmployee, setSelectedEmployee] = useState('2-Mahmuda');
  const [isLoading, setIsLoading] = useState(false);
  const [currentAttempt, setCurrentAttempt] = useState(null);
  const [results, setResults] = useState<any[]>([]);
  const [showCode, setShowCode] = useState(false);

  // Employee data extracted from attendance records (updated with latest data)
  const employees = [
    { id: 2, name: 'Mahmuda' },
    { id: 5, name: 'Sanjib' },
    { id: 6, name: 'Murad' },
    { id: 7, name: 'Hasan' },
    { id: 8, name: 'Sakebul' },
    { id: 11, name: 'Jahid' },
    { id: 16, name: 'Masum' },
    { id: 31, name: 'AbdulKadir' },
    { id: 32, name: 'Sajeeb' },
    { id: 35, name: 'Veasin Arafat' }
  ];

  // Get current employee details
  const getCurrentEmployee = () => {
    const [id, name] = selectedEmployee.split('-');
    return { id: parseInt(id), name };
  };

  const bypassMethod = {
    name: 'IP Bypass',
    description: 'Forward client IP to attendance system',
    headers: {
      'X-Forwarded-For': 'Client IP',
      'X-Real-IP': 'Client IP',
    }
  };

  const simulateAttendanceSubmission = async () => {
    setIsLoading(true);
    setCurrentAttempt({
      method: bypassMethod.name,
      startTime: Date.now(),
      phase: 'connecting'
    });

    try {
      // Phase 1: Connecting
      await new Promise(resolve => setTimeout(resolve, 800));
      setCurrentAttempt(prev => ({ ...prev, phase: 'sending_headers' }));

      // Phase 2: Sending headers through our bypass API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurrentAttempt(prev => ({ ...prev, phase: 'server_validation' }));

      // Phase 3: Making real API call through our bypass
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employee_id: getCurrentEmployee().id,
          employee_name: getCurrentEmployee().name,
        }),
      });

      const data = await response.json();
      
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if the response indicates success (status 200 and no error)
      const isSuccess = response.ok && !data.error;

      const result = {
        id: Date.now(),
        method: bypassMethod.name,
        timestamp: new Date().toLocaleTimeString(),
        success: isSuccess,
        actualIP: isSuccess ? '103.98.107.98' : '116.204.148.43',
        attemptedIP: '103.98.107.98',
        headers: bypassMethod.headers,
        error: isSuccess ? null : (data.error || "Attendance submission failed"),
        detectionMethod: isSuccess ? 'Bypass Successful' : 'Server Rejection',
        serverResponse: {
          status: response.status,
          message: isSuccess ? 'Attendance submitted successfully!' : (data.error || 'Submission failed'),
          submitted_as_ip: '103.98.107.98',
          details: data.details || data
        }
      };

      setResults(prev => [result, ...prev.slice(0, 4)]);
      setCurrentAttempt(prev => ({ ...prev, phase: data.success ? 'success' : 'failed' }));
      
      // Show success/failure phase for a moment
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('Submission error:', error);
      
      const result = {
        id: Date.now(),
        method: bypassMethods[selectedMethod].name,
        timestamp: new Date().toLocaleTimeString(),
        success: false,
        actualIP: '116.204.148.43',
        attemptedIP: '103.98.107.98',
        headers: bypassMethods[selectedMethod].headers,
        error: "Network error or API unavailable",
        detectionMethod: 'Connection Failed',
        serverResponse: {
          status: 500,
          error: error.message
        }
      };

      setResults(prev => [result, ...prev.slice(0, 4)]);
      setCurrentAttempt(prev => ({ ...prev, phase: 'failed' }));
    }

    setCurrentAttempt(null);
    setIsLoading(false);
  };

  const getPhaseMessage = (phase: string) => {
    switch (phase) {
      case 'connecting':
        return 'Establishing connection to admin.unlocklive.com...';
      case 'sending_headers':
        return 'Sending request through bypass API...';
      case 'server_validation':
        return 'Server validating IP address...';
      case 'success':
        return '✅ Attendance submitted successfully as office IP!';
      case 'failed':
        return '❌ Submission failed - bypass unsuccessful';
      default:
        return '';
    }
  };

  const generateCodePreview = () => {
    const method = bypassMethods[selectedMethod];
    return `// API Route: /app/api/attendance/route.js
export async function POST(req) {
  try {
    const { employee_id, employee_name } = await req.json();
    
    // Attempting to spoof IP as office IP
    const spoofedIP = '103.98.107.98';
    
    const response = await fetch('https://admin.unlocklive.com/api/attendance/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ${Object.entries(method.headers).map(([key, value]) => `        '${key}': '${value}',`).join('\n')}
      },
      body: JSON.stringify({
        employee_id: employee_id,
        employee_name: employee_name,
      }),
    });

    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    // This will always fail because:
    // 1. Cloudflare detects real IP
    // 2. Server uses actual connection IP
    // 3. Client headers are ignored
    
    return new Response(JSON.stringify({ 
      error: "You need to go to the office first for giving attendance...",
      your_real_ip: '116.204.148.43', // Always shows actual IP
      attempted_spoof: '103.98.107.98',
      why_failed: 'Server ignores client headers'
    }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500/20 rounded-full mb-4 border-2 border-blue-500/30">
            <Play className="h-10 w-10 text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Live Attendance System Preview
          </h1>
          <p className="text-gray-300">Real-time demonstration of IP bypass attempts</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Control Panel */}
          <div className="bg-gray-800/80 backdrop-blur rounded-xl p-6 border border-gray-600">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-blue-400" />
              Control Panel
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Employee</label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                >
                  {employees.map((emp, index) => (
                    <option key={`${emp.id}-${emp.name}-${index}`} value={`${emp.id}-${emp.name}`} className="bg-gray-700">
                      ID: {emp.id} - {emp.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="text-sm text-gray-400">
                <span className="font-medium">Selected:</span> ID {getCurrentEmployee().id} - {getCurrentEmployee().name}
              </div>



              <div className="pt-2">
                <button
                  onClick={simulateAttendanceSubmission}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:scale-100"
                >
                  {isLoading ? 'Running Bypass Attempt...' : 'Submit Attendance'}</button>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setShowCode(!showCode)}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  <Code className="h-4 w-4 mr-2" />
                  {showCode ? 'Hide Code' : 'Show Code'}</button>
              </div>
            </div>

            {/* Method Info */}
            <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-gray-600">
              <h3 className="font-medium mb-2 text-blue-300">{bypassMethod.name}</h3>
              <p className="text-sm text-gray-300 mb-3">{bypassMethod.description}</p>
              
              <div className="text-xs space-y-1">
                <div className="text-gray-400">Headers to send:</div>
                {Object.entries(bypassMethod.headers).map(([key, value]) => (
                  <div key={key} className="font-mono bg-gray-800 p-1 rounded">
                    <span className="text-yellow-400">{key}:</span> <span className="text-green-400">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Live Status */}
          <div className="bg-gray-800/80 backdrop-blur rounded-xl p-6 border border-gray-600">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Network className="h-5 w-5 mr-2 text-green-400" />
              Live Status
            </h2>

            {/* Current Attempt */}
            {currentAttempt && (
              <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Attempting: {currentAttempt.method}</span>
                  <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
                
                <div className="text-sm text-blue-300 mb-2">
                  {getPhaseMessage(currentAttempt.phase)}
                </div>

                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: currentAttempt.phase === 'connecting' ? '25%' :
                             currentAttempt.phase === 'sending_headers' ? '50%' :
                             currentAttempt.phase === 'server_validation' ? '75%' : '100%'
                    }}
                  ></div>
                </div>
              </div>
            )}

            {/* System Info */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Target Server:</span>
                <span className="font-mono">admin.unlocklive.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Your Actual IP:</span>
                <span className="font-mono text-red-400">116.204.148.43</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Target IP:</span>
                <span className="font-mono text-green-400">103.98.107.98</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Cloudflare Status:</span>
                <span className="text-orange-400">Active (Will detect real IP)</span>
              </div>
            </div>

            {/* Network Diagram */}
            <div className="mt-6 p-4 bg-gray-900/50 rounded-lg">
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

          {/* Results Panel */}
          <div className="bg-gray-800/80 backdrop-blur rounded-xl p-6 border border-gray-600">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-red-400" />
              Attempt Results
            </h2>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {results.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <Server className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No attempts yet</p>
                  <p className="text-xs">Click "Submit Attendance" to see results</p>
                </div>
              ) : (
                results.map((result: any) => (
                  <div key={result.id} className={`${result.success ? 'bg-green-900/20 border border-green-500/30' : 'bg-red-900/20 border border-red-500/30'} rounded-lg p-4`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        {result.success ? (
                          <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                        ) : (
                          <X className="h-4 w-4 text-red-400 mr-2" />
                        )}
                        <span className="font-medium text-sm">{result.method}</span>
                      </div>
                      <span className="text-xs text-gray-400">{result.timestamp}</span>
                    </div>
                    
                    {result.success ? (
                      <div className="text-xs text-green-300 mb-2">✅ {result.serverResponse?.message || 'Attendance submitted successfully!'}</div>
                    ) : (
                      <div className="text-xs text-red-300 mb-2">❌ {result.error}</div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-gray-400">Attempted IP:</div>
                        <div className="font-mono text-green-400">{result.attemptedIP}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">{result.success ? 'Submitted as IP:' : 'Detected IP:'}</div>
                        <div className={`font-mono ${result.success ? 'text-green-400' : 'text-red-400'}`}>{result.actualIP}</div>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-xs">
                      <div className="text-gray-400">Status:</div>
                      <div className={result.success ? 'text-green-400' : 'text-orange-400'}>{result.detectionMethod}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Code Preview */}
        {showCode && (
          <div className="mt-6 bg-gray-800/80 backdrop-blur rounded-xl p-6 border border-gray-600">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Code className="h-5 w-5 mr-2 text-purple-400" />
              Generated Code Preview
            </h2>
            
            <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs overflow-x-auto">
              <pre className="text-green-400 whitespace-pre-wrap">{generateCodePreview()}</pre>
            </div>
          </div>
        )}

        {/* Working Solutions */}
        <div className="mt-6 bg-green-900/20 backdrop-blur rounded-xl p-6 border border-gray-600">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
            Actual Working Solutions
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="bg-green-900/20 p-4 rounded-lg">
              <h3 className="font-medium text-green-300 mb-2">🔒 Corporate VPN</h3>
              <p className="text-gray-300">Connect through company VPN to appear from office network range.</p>
            </div>
            
            <div className="bg-green-900/20 p-4 rounded-lg">
              <h3 className="font-medium text-green-300 mb-2">🏢 Remote Desktop</h3>
              <p className="text-gray-300">Access office computer remotely and submit from there.</p>
            </div>
            
            <div className="bg-green-900/20 p-4 rounded-lg">
              <h3 className="font-medium text-green-300 mb-2">📋 IP Whitelisting</h3>
              <p className="text-gray-300">Request IT to add your home IP to the allowed list.</p>
            </div>
            
            <div className="bg-green-900/20 p-4 rounded-lg">
              <h3 className="font-medium text-green-300 mb-2">🌐 Office Proxy</h3>
              <p className="text-gray-300">Set up proxy server at office location for routing.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
