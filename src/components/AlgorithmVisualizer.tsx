import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { Process, AlgorithmType } from '../types';
import { Play, Plus, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const AlgorithmVisualizer = () => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>('FCFS');
  const [timeQuantum, setTimeQuantum] = useState<number>(2);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationData, setSimulationData] = useState<any[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const addProcess = useCallback(() => {
    const newProcess: Process = {
      id: Date.now().toString(),
      name: `P${processes.length + 1}`,
      arrivalTime: 0,
      burstTime: 4,
      priority: 1,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      remainingTime: 4,
      waitingTime: 0,
      turnaroundTime: 0,
    };
    setProcesses(prev => [...prev, newProcess]);
  }, [processes.length]);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(processes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setProcesses(items);
  };

  const updateProcessValue = useCallback((index: number, field: keyof Process, value: number | string) => {
    setProcesses(prev => {
      const updated = [...prev];
      const numericValue = typeof value === 'string' ? parseInt(value, 10) : value;
      
      if (field === 'burstTime' && !isNaN(numericValue) && numericValue > 0) {
        updated[index] = {
          ...updated[index],
          [field]: numericValue,
          remainingTime: numericValue
        };
      } else if (!isNaN(numericValue)) {
        updated[index] = {
          ...updated[index],
          [field]: numericValue
        };
      }
      return updated;
    });
  }, []);

  const simulateFCFS = useCallback(() => {
    let currentTime = 0;
    const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
    const timeline: any[] = [];

    sortedProcesses.forEach(process => {
      currentTime = Math.max(currentTime, process.arrivalTime);
      timeline.push({
        time: currentTime,
        process: process.name,
        remainingTime: process.burstTime,
      });
      currentTime += process.burstTime;
    });

    return timeline;
  }, [processes]);

  const simulateSJF = useCallback(() => {
    let currentTime = 0;
    const remainingProcesses = [...processes].map(p => ({...p}));
    const timeline: any[] = [];

    while (remainingProcesses.length > 0) {
      const availableProcesses = remainingProcesses.filter(p => p.arrivalTime <= currentTime);
      if (availableProcesses.length === 0) {
        currentTime++;
        continue;
      }

      const shortestJob = availableProcesses.reduce((prev, curr) => 
        prev.burstTime < curr.burstTime ? prev : curr
      );

      timeline.push({
        time: currentTime,
        process: shortestJob.name,
        remainingTime: shortestJob.burstTime,
      });

      currentTime += shortestJob.burstTime;
      const index = remainingProcesses.findIndex(p => p.id === shortestJob.id);
      remainingProcesses.splice(index, 1);
    }

    return timeline;
  }, [processes]);

  const simulateRoundRobin = useCallback(() => {
    let currentTime = 0;
    const remainingProcesses = [...processes].map(p => ({...p, remainingTime: p.burstTime}));
    const timeline: any[] = [];
    let queue: Process[] = [];

    while (remainingProcesses.length > 0 || queue.length > 0) {
      const newArrivals = remainingProcesses.filter(p => p.arrivalTime <= currentTime);
      queue.push(...newArrivals);
      remainingProcesses.splice(0, newArrivals.length);

      if (queue.length === 0) {
        currentTime++;
        continue;
      }

      const currentProcess = queue.shift()!;
      const executeTime = Math.min(timeQuantum, currentProcess.remainingTime);

      timeline.push({
        time: currentTime,
        process: currentProcess.name,
        remainingTime: currentProcess.remainingTime,
      });

      currentTime += executeTime;
      currentProcess.remainingTime -= executeTime;

      if (currentProcess.remainingTime > 0) {
        queue.push(currentProcess);
      }
    }

    return timeline;
  }, [processes, timeQuantum]);

  const startSimulation = useCallback(() => {
    setIsSimulating(true);
    let timeline;
    
    switch (selectedAlgorithm) {
      case 'FCFS':
        timeline = simulateFCFS();
        break;
      case 'SJF':
        timeline = simulateSJF();
        break;
      case 'RoundRobin':
        timeline = simulateRoundRobin();
        break;
      default:
        timeline = simulateFCFS();
    }

    setSimulationData(timeline);
    
    let timeIndex = 0;
    const interval = setInterval(() => {
      if (timeIndex < timeline.length) {
        setCurrentTime(timeline[timeIndex].time);
        timeIndex++;
      } else {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedAlgorithm, simulateFCFS, simulateSJF, simulateRoundRobin]);

  const algorithmInfo = {
    FCFS: {
      title: "First Come First Serve (FCFS)",
      description: "The simplest scheduling algorithm that executes processes in the order they arrive. Non-preemptive.",
      pros: ["Simple to implement", "Fair for processes in arrival order"],
      cons: ["Can lead to convoy effect", "Not optimal for varying burst times"],
      metrics: ["Average waiting time can be high", "No priority consideration"]
    },
    SJF: {
      title: "Shortest Job First (SJF)",
      description: "Selects the process with the smallest burst time. Can be preemptive or non-preemptive.",
      pros: ["Optimal average waiting time", "Good for batch systems"],
      cons: ["Starvation possible for longer processes", "Burst time must be known"],
      metrics: ["Minimizes average waiting time", "May cause starvation"]
    },
    RoundRobin: {
      title: "Round Robin",
      description: "Each process gets a small unit of CPU time (time quantum), and then switches to the next process.",
      pros: ["Fair allocation", "Good for time-sharing systems"],
      cons: ["Performance depends on quantum size", "Higher switching overhead"],
      metrics: ["Response time is good", "Context switching overhead"]
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">CPU Scheduling Visualizer</h2>
        <div className="flex gap-4">
          <select
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={selectedAlgorithm}
            onChange={(e) => setSelectedAlgorithm(e.target.value as AlgorithmType)}
          >
            <option value="FCFS">First Come First Serve</option>
            <option value="SJF">Shortest Job First</option>
            <option value="Priority">Priority Scheduling</option>
            <option value="RoundRobin">Round Robin</option>
          </select>

          {selectedAlgorithm === 'RoundRobin' && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Time Quantum:</label>
              <input
                type="number"
                min="1"
                value={timeQuantum}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  if (!isNaN(value) && value > 0) {
                    setTimeQuantum(value);
                  }
                }}
                className="w-20 px-2 py-1 rounded border border-gray-300"
              />
            </div>
          )}
          
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Info className="w-5 h-5 text-indigo-600" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 bg-indigo-50 p-6 rounded-lg"
          >
            <h3 className="text-xl font-semibold mb-4">{algorithmInfo[selectedAlgorithm as keyof typeof algorithmInfo].title}</h3>
            <p className="mb-4">{algorithmInfo[selectedAlgorithm as keyof typeof algorithmInfo].description}</p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Advantages</h4>
                <ul className="list-disc list-inside space-y-1">
                  {algorithmInfo[selectedAlgorithm as keyof typeof algorithmInfo].pros.map((pro, index) => (
                    <li key={index}>{pro}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Disadvantages</h4>
                <ul className="list-disc list-inside space-y-1">
                  {algorithmInfo[selectedAlgorithm as keyof typeof algorithmInfo].cons.map((con, index) => (
                    <li key={index}>{con}</li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-6">
        <button
          onClick={addProcess}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Process
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="processes">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {processes.map((process, index) => (
                <Draggable key={process.id} draggableId={process.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="bg-gray-50 p-4 rounded-lg shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: process.color }}
                        />
                        <input
                          value={process.name}
                          onChange={(e) => updateProcessValue(index, 'name', e.target.value)}
                          className="px-2 py-1 rounded border border-gray-300"
                        />
                        <input
                          type="number"
                          min="0"
                          value={process.arrivalTime}
                          onChange={(e) => updateProcessValue(index, 'arrivalTime', e.target.value)}
                          className="w-20 px-2 py-1 rounded border border-gray-300"
                          placeholder="Arrival"
                        />
                        <input
                          type="number"
                          min="1"
                          value={process.burstTime}
                          onChange={(e) => updateProcessValue(index, 'burstTime', e.target.value)}
                          className="w-20 px-2 py-1 rounded border border-gray-300"
                          placeholder="Burst"
                        />
                        {selectedAlgorithm === 'Priority' && (
                          <input
                            type="number"
                            min="1"
                            value={process.priority}
                            onChange={(e) => updateProcessValue(index, 'priority', e.target.value)}
                            className="w-20 px-2 py-1 rounded border border-gray-300"
                            placeholder="Priority"
                          />
                        )}
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div className="mt-6">
        <button
          onClick={startSimulation}
          disabled={processes.length === 0}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg text-white transition-colors ${
            processes.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          <Play className="w-4 h-4" />
          Start Simulation
        </button>
      </div>

      {isSimulating && simulationData.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Simulation Results</h3>
          
          <div className="mb-6">
            <h4 className="font-semibold mb-2">Timeline</h4>
            <div className="overflow-x-auto">
              <LineChart width={600} height={300} data={simulationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="stepAfter" dataKey="remainingTime" stroke="#8884d8" name="Remaining Time" />
              </LineChart>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Current Time: {currentTime}</h4>
              <div className="space-y-2">
                {processes.map(process => (
                  <div key={process.id} className="flex justify-between">
                    <span>{process.name}</span>
                    <span>Remaining: {process.remainingTime}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Statistics</h4>
              <div className="space-y-2">
                {processes.map(process => (
                  <div key={process.id} className="flex justify-between">
                    <span>{process.name}</span>
                    <span>
                      Wait: {process.waitingTime} | Turnaround: {process.turnaroundTime}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlgorithmVisualizer;