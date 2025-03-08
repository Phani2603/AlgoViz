import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Layout, BarChart2, Brain } from 'lucide-react';
import Navbar from './components/Navbar';
import AlgorithmVisualizer from './components/AlgorithmVisualizer';
import PageReplacementVisualizer from './components/PageReplacementVisualizer';
import Tutorial from './components/Tutorial';

function App() {
  const [activeSection, setActiveSection] = useState<'scheduling' | 'paging' | 'tutorial'>('tutorial');

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`cursor-pointer p-6 rounded-xl shadow-lg ${
              activeSection === 'tutorial' ? 'bg-indigo-600 text-white' : 'bg-white'
            }`}
            onClick={() => setActiveSection('tutorial')}
          >
            <BookOpen className="w-8 h-8 mb-3" />
            <h3 className="text-xl font-semibold mb-2">Interactive Tutorial</h3>
            <p className="text-sm opacity-80">Start your journey with guided learning</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`cursor-pointer p-6 rounded-xl shadow-lg ${
              activeSection === 'scheduling' ? 'bg-indigo-600 text-white' : 'bg-white'
            }`}
            onClick={() => setActiveSection('scheduling')}
          >
            <Clock className="w-8 h-8 mb-3" />
            <h3 className="text-xl font-semibold mb-2">CPU Scheduling</h3>
            <p className="text-sm opacity-80">Explore process scheduling algorithms</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`cursor-pointer p-6 rounded-xl shadow-lg ${
              activeSection === 'paging' ? 'bg-indigo-600 text-white' : 'bg-white'
            }`}
            onClick={() => setActiveSection('paging')}
          >
            <Layout className="w-8 h-8 mb-3" />
            <h3 className="text-xl font-semibold mb-2">Page Replacement</h3>
            <p className="text-sm opacity-80">Learn memory management algorithms</p>
          </motion.div>
        </div>

        {activeSection === 'tutorial' && <Tutorial />}
        {activeSection === 'scheduling' && <AlgorithmVisualizer />}
        {activeSection === 'paging' && <PageReplacementVisualizer />}

        <div className="mt-12 bg-white rounded-xl p-8 shadow-lg">
          <div className="flex items-center gap-4 mb-6">
            <Brain className="w-8 h-8 text-indigo-600" />
            <h2 className="text-2xl font-bold">Why Learn These Algorithms?</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-3">CPU Scheduling</h3>
              <p className="text-gray-600">
                Understanding CPU scheduling algorithms is crucial for operating system design and optimization.
                These algorithms determine how processes share CPU time, affecting system performance and user experience.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">Page Replacement</h3>
              <p className="text-gray-600">
                Page replacement algorithms are fundamental to memory management in modern computers.
                They help optimize memory usage and minimize page faults, directly impacting system performance.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;