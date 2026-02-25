import React, { useState, useEffect } from 'react';
import { workspaces, papers, chat } from '../api';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    workspaces: 0,
    papers: 0,
    chats: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const workspacesRes = await workspaces.getAll();
      const workspaceList = workspacesRes.data;

      let totalPapers = 0;
      let totalChats = 0;
      const activities: any[] = [];

      for (const ws of workspaceList) {
        const papersRes = await papers.getByWorkspace(ws.id);
        const chatsRes = await chat.getHistory(ws.id);

        totalPapers += papersRes.data.length;
        totalChats += chatsRes.data.length;

        papersRes.data.slice(0, 3).forEach((paper: any) => {
          activities.push({
            type: 'paper',
            workspace: ws.name,
            title: paper.title,
            date: paper.date
          });
        });
      }

      setStats({
        workspaces: workspaceList.length,
        papers: totalPapers,
        chats: totalChats
      });

      setRecentActivity(activities.slice(0, 5));
      setLoading(false);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-200 border-t-blue-600"></div>
          <div className="mt-4 text-sm text-slate-500 text-center">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h2>
        <p className="text-slate-600">Overview of your research activity</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Workspaces */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-6 text-white shadow-lg border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/90 text-sm font-medium">Workspaces</p>
              <p className="text-4xl font-bold mt-2">{stats.workspaces}</p>
            </div>
            <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 text-xs text-white/80">
            Manage projects and group papers by topic
          </div>
        </div>

        {/* Papers Saved */}
        <div className="bg-white/90 backdrop-blur rounded-3xl p-6 shadow-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Papers Saved</p>
              <p className="text-4xl font-bold text-slate-900 mt-2">{stats.papers}</p>
            </div>
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center border border-slate-200">
              <svg className="w-8 h-8 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-500">
            Papers imported from search and saved to workspaces
          </div>
        </div>

        {/* AI Conversations */}
        <div className="bg-white/90 backdrop-blur rounded-3xl p-6 shadow-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">AI Conversations</p>
              <p className="text-4xl font-bold text-slate-900 mt-2">{stats.chats}</p>
            </div>
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center border border-slate-200">
              <svg className="w-8 h-8 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-500">
            Conversations linked with your saved workspaces
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/90 backdrop-blur rounded-3xl shadow-lg p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-slate-900">Recent Activity</h3>
          <div className="text-xs text-slate-500">Latest saved papers</div>
        </div>

        {recentActivity.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg font-medium text-slate-700">No activity yet</p>
            <p className="text-sm">Start by searching and importing papers.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentActivity.map((activity, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-4 p-4 border border-slate-200 rounded-2xl hover:border-blue-200 hover:bg-blue-50/40 transition-all"
              >
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-slate-200">
                  <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>

                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{activity.title}</p>
                  <p className="text-sm text-slate-600">Workspace: {activity.workspace}</p>
                  <p className="text-xs text-slate-500 mt-1">{activity.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;