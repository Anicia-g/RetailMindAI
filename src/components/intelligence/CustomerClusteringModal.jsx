'use client';

import React, { useState } from 'react';
import { Sparkles, Users, RefreshCw, CheckCircle2, Award, Zap } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { CustomerSegmentChart } from '@/components/charts/CustomerSegmentChart';
import { initialCustomerClusters } from '@/data/customers';

export function CustomerClusteringModal({ isOpen, onClose, onClusteringComplete }) {
  const [isTraining, setIsTraining] = useState(false);
  const [clusters, setClusters] = useState(initialCustomerClusters);
  const [completed, setCompleted] = useState(false);

  const handleRunClustering = () => {
    setIsTraining(true);
    setCompleted(false);

    // Simulate K-Means RFM clustering model execution
    setTimeout(() => {
      // Slightly update cluster metrics to demonstrate active computation
      const updated = clusters.map((c) => ({
        ...c,
        count: Math.round(c.count * (0.98 + Math.random() * 0.05)),
      }));
      setClusters(updated);
      setIsTraining(false);
      setCompleted(true);
      if (onClusteringComplete) {
        onClusteringComplete(updated);
      }
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="K-Means Customer Clustering & RFM Segmentation"
      subtitle="Behavioral clustering based on Recency (days), Frequency (orders), and Monetary value (LTV)"
      maxWidth="max-w-4xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Award className="w-4 h-4 text-indigo-500" />
            <span>Optimal K=4 clusters computed via Silhouette Score (0.81)</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={isTraining ? RefreshCw : Sparkles}
              loading={isTraining}
              onClick={handleRunClustering}
            >
              {isTraining ? 'Computing K-Means...' : 'Re-Run Clustering Engine'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Success / Status Banner */}
        {completed ? (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Clustering model convergence achieved in 14 iterations. Customer database re-segmented into 4 cohorts.</span>
            </div>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
              Silhouette: 0.81 | Inertia: 142.6
            </span>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-indigo-800 dark:text-indigo-300">
              <Zap className="w-4 h-4 text-indigo-500" />
              <span>Click "Re-Run Clustering Engine" to refresh behavioral segments from current purchase data.</span>
            </div>
            <Button size="sm" variant="primary" onClick={handleRunClustering} loading={isTraining}>
              Run Clustering
            </Button>
          </div>
        )}

        {/* 2D Scatter Chart Component */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            Multi-Dimensional Customer Segmentation Space
          </h4>
          <CustomerSegmentChart clusters={clusters} height={220} />
        </div>

        {/* Actionable Cohort Strategies */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {clusters.map((c) => (
            <div
              key={c.id}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{c.name}</span>
                </div>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {c.count} Customers ({c.percentOfTotal})
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 text-[11px] bg-white dark:bg-slate-900/60 rounded-lg p-2 border border-slate-200 dark:border-slate-700/60">
                <div>
                  <span className="text-slate-400 block">Recency</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{c.avgRecency}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Frequency</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{c.avgFrequency}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Avg LTV</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{c.avgMonetary}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300">
                <strong className="text-slate-800 dark:text-slate-200">Recommended Action:</strong> {c.strategy}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
