import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Layout, ArrowRight } from 'lucide-react';

const Tutorial = () => {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-8 shadow-lg"
      >
        <div className="flex items-center gap-4 mb-6">
          <BookOpen className="w-8 h-8 text-indigo-600" />
          <h2 className="text-2xl font-bold">Welcome to AlgoViz</h2>
        </div>
        <p className="text-gray-600 mb-4">
          This interactive platform will help you understand complex scheduling and page replacement
          algorithms through visual demonstrations and hands-on practice.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl p-6 shadow-lg"
        >
          <Clock className="w-8 h-8 text-indigo-600 mb-4" />
          <h3 className="text-xl font-bold mb-4">CPU Scheduling Algorithms</h3>
          <ul className="space-y-3">
            <li className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-indigo-600" />
              <span>First Come First Serve (FCFS)</span>
            </li>
            <li className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-indigo-600" />
              <span>Shortest Job First (SJF)</span>
            </li>
            <li className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-indigo-600" />
              <span>Priority Scheduling</span>
            </li>
            <li className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-indigo-600" />
              <span>Round Robin</span>
            </li>
            <li className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-indigo-600" />
              <span>Multi-Level Feedback Queue</span>
            </li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl p-6 shadow-lg"
        >
          <Layout className="w-8 h-8 text-indigo-600 mb-4" />
          <h3 className="text-xl font-bold mb-4">Page Replacement Algorithms</h3>
          <ul className="space-y-3">
            <li className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-indigo-600" />
              <span>First In First Out (FIFO)</span>
            </li>
            <li className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-indigo-600" />
              <span>Least Recently Used (LRU)</span>
            </li>
            <li className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-indigo-600" />
              <span>Optimal Page Replacement</span>
            </li>
            <li className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-indigo-600" />
              <span>Clock Algorithm</span>
            </li>
          </ul>
        </motion.div>
      </div>

      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white shadow-lg">
        <h3 className="text-2xl font-bold mb-4">Getting Started</h3>
        <p className="mb-6">
          Choose a section above to begin exploring. Each algorithm comes with:
        </p>
        <ul className="grid md:grid-cols-3 gap-6">
          <li className="bg-white/10 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Interactive Visualizations</h4>
            <p className="text-sm opacity-90">See how each algorithm works step by step</p>
          </li>
          <li className="bg-white/10 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Hands-on Practice</h4>
            <p className="text-sm opacity-90">Create your own scenarios and test them</p>
          </li>
          <li className="bg-white/10 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Performance Metrics</h4>
            <p className="text-sm opacity-90">Analyze and compare algorithm efficiency</p>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Tutorial;