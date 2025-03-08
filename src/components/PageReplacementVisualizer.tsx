import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageFrame, PageReplacementType } from '../types';
import { RefreshCw, Info, Plus, Play, Clock, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const PageReplacementVisualizer = () => {
  const [frames, setFrames] = useState<PageFrame[]>([]);
  const [algorithm, setAlgorithm] = useState<PageReplacementType>('FIFO');
  const [frameCount, setFrameCount] = useState(3);
  const [pageSequence, setPageSequence] = useState<string>('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [simulationStats, setSimulationStats] = useState({
    hits: 0,
    faults: 0,
    hitRate: 0,
  });
  const [simulationHistory, setSimulationHistory] = useState<Array<{
    step: number;
    frames: PageFrame[];
    isHit: boolean;
    page: number;
  }>>([]);

  const algorithmInfo = {
    FIFO: {
      title: "First In First Out (FIFO)",
      description: "Replaces the page that has been in memory the longest. Simple to implement but may not always be optimal.",
      pros: ["Simple to understand and implement", "Low overhead", "No additional bookkeeping needed"],
      cons: ["May remove frequently used pages", "Can suffer from Belady's anomaly", "Not adaptive to access patterns"],
    },
    LRU: {
      title: "Least Recently Used (LRU)",
      description: "Replaces the page that hasn't been used for the longest period. Typically provides good performance but requires tracking page access history.",
      pros: ["Good performance in practice", "Adapts to program behavior", "No Belady's anomaly"],
      cons: ["Requires hardware support for efficiency", "More complex to implement", "Higher overhead"],
    },
    OPT: {
      title: "Optimal Page Replacement",
      description: "Replaces the page that won't be used for the longest time in the future. Theoretical algorithm that provides the best possible performance.",
      pros: ["Best possible performance", "Useful as a benchmark", "No Belady's anomaly"],
      cons: ["Requires future knowledge", "Not implementable in practice", "Purely theoretical"],
    },
    Clock: {
      title: "Clock Algorithm",
      description: "A more efficient approximation of LRU using a circular buffer and reference bits. Good balance of performance and complexity.",
      pros: ["Efficient implementation", "Good approximation of LRU", "Low overhead"],
      cons: ["Not as optimal as LRU", "Requires reference bit support", "May need multiple passes"],
    },
  };

  const simulateFIFO = useCallback((sequence: number[]) => {
    const history: typeof simulationHistory = [];
    const framesList: PageFrame[] = Array(frameCount).fill(null).map((_, i) => ({
      id: i.toString(),
      page: null,
    }));
    let hits = 0;
    let nextFrameIndex = 0;

    sequence.forEach((page, step) => {
      const existingFrame = framesList.find(f => f.page === page);
      const isHit = !!existingFrame;

      if (isHit) {
        hits++;
      } else {
        framesList[nextFrameIndex] = {
          id: nextFrameIndex.toString(),
          page,
        };
        nextFrameIndex = (nextFrameIndex + 1) % frameCount;
      }

      history.push({
        step,
        frames: [...framesList],
        isHit,
        page,
      });
    });

    return { history, hits, faults: sequence.length - hits };
  }, [frameCount]);

  const simulateLRU = useCallback((sequence: number[]) => {
    const history: typeof simulationHistory = [];
    const framesList: PageFrame[] = Array(frameCount).fill(null).map((_, i) => ({
      id: i.toString(),
      page: null,
      lastUsed: 0,
    }));
    let hits = 0;
    let currentTime = 0;

    sequence.forEach((page, step) => {
      currentTime++;
      const existingFrame = framesList.find(f => f.page === page);
      const isHit = !!existingFrame;

      if (isHit) {
        hits++;
        existingFrame.lastUsed = currentTime;
      } else {
        const lruFrame = framesList.reduce((prev, curr) => 
          (!curr.lastUsed || (prev.lastUsed || 0) > (curr.lastUsed || 0)) ? curr : prev
        );
        const frameIndex = framesList.indexOf(lruFrame);
        framesList[frameIndex] = {
          id: frameIndex.toString(),
          page,
          lastUsed: currentTime,
        };
      }

      history.push({
        step,
        frames: [...framesList],
        isHit,
        page,
      });
    });

    return { history, hits, faults: sequence.length - hits };
  }, [frameCount]);

  const startSimulation = useCallback(() => {
    setIsSimulating(true);
    const sequence = pageSequence.split(/[,\s]+/).map(Number).filter(n => !isNaN(n));
    
    let result;
    switch (algorithm) {
      case 'FIFO':
        result = simulateFIFO(sequence);
        break;
      case 'LRU':
        result = simulateLRU(sequence);
        break;
      default:
        result = simulateFIFO(sequence);
    }

    setSimulationHistory(result.history);
    setSimulationStats({
      hits: result.hits,
      faults: result.faults,
      hitRate: (result.hits / sequence.length) * 100,
    });
  }, [algorithm, pageSequence, simulateFIFO, simulateLRU]);

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Page Replacement Visualizer</h2>
        <div className="flex gap-4">
          <select
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value as PageReplacementType)}
          >
            <option value="FIFO">First In First Out (FIFO)</option>
            <option value="LRU">Least Recently Used (LRU)</option>
            <option value="OPT">Optimal</option>
            <option value="Clock">Clock</option>
          </select>
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
            <h3 className="text-xl font-semibold mb-4">{algorithmInfo[algorithm].title}</h3>
            <p className="mb-4">{algorithmInfo[algorithm].description}</p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Advantages</h4>
                <ul className="list-disc list-inside space-y-1">
                  {algorithmInfo[algorithm].pros.map((pro, index) => (
                    <li key={index}>{pro}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Disadvantages</h4>
                <ul className="list-disc list-inside space-y-1">
                  {algorithmInfo[algorithm].cons.map((con, index) => (
                    <li key={index}>{con}</li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Frames
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={frameCount}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              if (!isNaN(value) && value > 0 && value <= 10) {
                setFrameCount(value);
              }
            }}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Page Reference String (comma or space separated)
          </label>
          <input
            type="text"
            value={pageSequence}
            onChange={(e) => setPageSequence(e.target.value)}
            placeholder="e.g., 1, 2, 3, 4, 1, 2, 5"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <button
        onClick={startSimulation}
        disabled={!pageSequence.trim()}
        className={`flex items-center gap-2 px-6 py-3 rounded-lg text-white transition-colors ${
          !pageSequence.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        <Play className="w-4 h-4" />
        Start Simulation
      </button>

      {isSimulating && simulationHistory.length > 0 && (
        <div className="mt-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-indigo-50 p-4 rounded-lg"
            >
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                <h4 className="font-semibold">Page Hits</h4>
              </div>
              <p className="text-2xl font-bold text-indigo-600">{simulationStats.hits}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-red-50 p-4 rounded-lg"
            >
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="w-5 h-5 text-red-600" />
                <h4 className="font-semibold">Page Faults</h4>
              </div>
              <p className="text-2xl font-bold text-red-600">{simulationStats.faults}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-green-50 p-4 rounded-lg"
            >
              <div className="flex items-center gap-2 mb-2">
                <BarChart2 className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold">Hit Rate</h4>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {simulationStats.hitRate.toFixed(1)}%
              </p>
            </motion.div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-4">Simulation Steps</h4>
            <div className="space-y-4">
              {simulationHistory.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg ${
                    step.isHit ? 'bg-green-100' : 'bg-red-100'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Step {index + 1}</span>
                    <span className={`px-2 py-1 rounded text-sm ${
                      step.isHit ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                    }`}>
                      {step.isHit ? 'Hit' : 'Fault'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {step.frames.map((frame, frameIndex) => (
                      <div
                        key={frameIndex}
                        className="bg-white p-3 rounded border text-center"
                      >
                        {frame.page !== null ? frame.page : '-'}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="font-semibold mb-4">Performance Analysis</h4>
            <div className="w-full overflow-x-auto">
              <BarChart width={600} height={300} data={[
                { name: 'Hits', value: simulationStats.hits },
                { name: 'Faults', value: simulationStats.faults },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageReplacementVisualizer;