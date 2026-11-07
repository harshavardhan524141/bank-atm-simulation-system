import React, { useState, useEffect } from 'react';
import { BarChart3, Download, TrendingUp, ArrowDownToLine, ArrowUpFromLine, Send, FileSpreadsheet } from 'lucide-react';
import { api } from '../../services/api.ts';
import { useToast } from '../../components/Toast.tsx';

interface ReportsProps {
  onNavigate: (view: string) => void;
}

export const Reports: React.FC<ReportsProps> = () => {
  const { success } = useToast();
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    api.admin.getReports()
      .then((res) => setReportData(res))
      .catch((err) => console.error('Failed to load reports:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const exportReportCSV = () => {
    if (!reportData) return;

    const lines = [
      'APEX DIGITAL BANK - SYSTEM OPERATIONS REPORT',
      `Generated At: ${new Date().toISOString()}`,
      '',
      'SUMMARY METRICS',
      `Total Deposits Count,${reportData.summary.totalDeposits}`,
      `Total Deposit Volume (INR),${reportData.summary.totalDepositVol}`,
      `Total Withdrawals Count,${reportData.summary.totalWithdrawals}`,
      `Total Withdrawal Volume (INR),${reportData.summary.totalWithdrawalVol}`,
      `Total Transfers Count,${reportData.summary.totalTransfers}`,
      `Total Transfer Volume (INR),${reportData.summary.totalTransferVol}`,
      `Grand Total Volume (INR),${reportData.summary.grandTotalVolume}`,
      '',
      'DAILY BREAKDOWN (PAST 7 DAYS)',
      'Date,Deposits (INR),Withdrawals (INR),Transfers (INR),Total Volume (INR)',
      ...reportData.dailyTrend.map(
        (d: any) => `${d.date},${d.deposits},${d.withdrawals},${d.transfers},${d.volume}`
      ),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Apex-Banking-Report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    success('Report Exported', 'CSV financial intelligence report downloaded.');
  };

  if (isLoading || !reportData) {
    return (
      <div className="p-12 text-center text-xs text-slate-400">
        Aggregating financial statistics and transaction charts...
      </div>
    );
  }

  const { summary, dailyTrend } = reportData;
  const maxDayVolume = Math.max(...dailyTrend.map((d: any) => d.volume), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#102A43] tracking-tight">
            Financial & Transaction Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Aggregated liquidity volume, operation counts, and daily settlement trajectories
          </p>
        </div>

        <button
          onClick={exportReportCSV}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl shadow-xs transition-colors"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Export Financial Report (.CSV)</span>
        </button>
      </div>

      {/* 3 Channel Metrics */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Deposits */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Cash Deposits Inflow
              </span>
              <div className="text-2xl font-mono font-bold text-emerald-600 mt-1">
                ₹{summary.totalDepositVol.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowUpFromLine className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-4 pt-2 border-t border-slate-100 flex justify-between">
            <span>Successful Deposits:</span>
            <span className="font-bold text-slate-900">{summary.totalDeposits}</span>
          </div>
        </div>

        {/* Withdrawals */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                ATM Withdrawals Outflow
              </span>
              <div className="text-2xl font-mono font-bold text-rose-600 mt-1">
                ₹{summary.totalWithdrawalVol.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowDownToLine className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-4 pt-2 border-t border-slate-100 flex justify-between">
            <span>Total Cash-Outs:</span>
            <span className="font-bold text-slate-900">{summary.totalWithdrawals}</span>
          </div>
        </div>

        {/* Transfers */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Inter-Bank Transfers
              </span>
              <div className="text-2xl font-mono font-bold text-blue-700 mt-1">
                ₹{summary.totalTransferVol.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-4 pt-2 border-t border-slate-100 flex justify-between">
            <span>Settled Transfers:</span>
            <span className="font-bold text-slate-900">{summary.totalTransfers}</span>
          </div>
        </div>
      </div>

      {/* 7-Day Trend Chart */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div>
          <h2 className="text-base font-bold text-[#102A43]">7-Day Settlement Trend</h2>
          <p className="text-xs text-slate-500">Daily total transactional volume processed through Apex switch</p>
        </div>

        {/* Clean responsive bar chart */}
        <div className="pt-4 pb-2">
          <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 border-b border-slate-200 px-2">
            {dailyTrend.map((day: any) => {
              const heightPercent = Math.max(8, Math.round((day.volume / maxDayVolume) * 100));
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 bg-slate-900 text-white text-[10px] py-1 px-2 rounded-lg whitespace-nowrap pointer-events-none z-10 font-mono shadow-md">
                    ₹{day.volume.toLocaleString('en-IN')}
                  </div>

                  {/* Bar */}
                  <div className="w-full max-w-[48px] bg-blue-100 hover:bg-blue-600 rounded-t-lg transition-colors flex items-end justify-center" style={{ height: `${heightPercent}%` }}>
                    <div className="w-full bg-blue-600/70 hover:bg-blue-600 rounded-t-lg h-full" />
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">
                    {day.date.substring(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
